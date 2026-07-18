package kcg.edu.ehms.service

import kcg.edu.ehms.dto.common.PageResponse
import kcg.edu.ehms.dto.patient.*
import kcg.edu.ehms.dto.visit.PatientVisitListResponse
import kcg.edu.ehms.dto.visit.VisitResponse
import kcg.edu.ehms.entity.*
import kcg.edu.ehms.exception.BusinessValidationException
import kcg.edu.ehms.exception.ResourceNotFoundException
import kcg.edu.ehms.repository.PatientRepository
import kcg.edu.ehms.repository.PatientVisitRepository
import kcg.edu.ehms.specification.PatientSpecifications
import kcg.edu.ehms.specification.PatientVisitSpecifications
import org.slf4j.LoggerFactory
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.UUID

@Service
class PatientService(
    private val patientRepository: PatientRepository,
    private val patientVisitRepository: PatientVisitRepository
) {
    private val log = LoggerFactory.getLogger(javaClass)
    private val allowedSorts = setOf(
        "id", "medicalRecordNumber", "fullName", "gender", "dateOfBirth", "registeredAt", "updatedAt"
    )

    private val visitSorts = mapOf(
        "id" to "id",
        "visitDate" to "visitDate",
        "patientId" to "patient.id",
        "patientName" to "patient.fullName",
        "patientType" to "patientType",
        "patientStatus" to "patientStatus",
        "registeredBy" to "createdBy",
        "createdAt" to "createdAt"
    )

    @Transactional
    fun create(request: PatientRequest, actor: String): PatientResponse {
        val patient = createEntity(request)
        log.info("Patient {} with MRN {} created by {}", patient.id, patient.medicalRecordNumber, actor)
        return mapToResponse(patient)
    }

    /** Used by the registration transaction. MRN is generated after the first database insert. */
    fun createEntity(request: PatientRequest): Patient {
        val patient = Patient(medicalRecordNumber = temporaryMrn())
        applyRequest(patient, request)

        val inserted = patientRepository.saveAndFlush(patient)
        inserted.medicalRecordNumber = generateMrn(inserted)
        return patientRepository.save(inserted)
    }

    @Transactional(readOnly = true)
    fun list(
        page: Int,
        size: Int,
        search: String?,
        sortBy: String,
        sortDir: String
    ): PageResponse<PatientResponse> {
        val safePage = page.coerceAtLeast(0)
        val safeSize = size.coerceIn(1, 100)
        val safeSort = sortBy.takeIf { it in allowedSorts } ?: "registeredAt"
        val direction = if (sortDir.equals("asc", true)) Sort.Direction.ASC else Sort.Direction.DESC
        val pageable = PageRequest.of(safePage, safeSize, Sort.by(direction, safeSort))

        val result = patientRepository
            .findAll(PatientSpecifications.search(search), pageable)
            .map { mapToResponse(it) }

        return PageResponse.from(result)
    }

    @Transactional(readOnly = true)
    fun listVisits(
        page: Int,
        size: Int,
        search: String?,
        sortBy: String,
        sortDir: String
    ): PageResponse<PatientVisitListResponse> {
        val safePage = page.coerceAtLeast(0)
        val safeSize = size.coerceIn(1, 100)
        val safeSort = visitSorts[sortBy] ?: "visitDate"
        val direction = if (sortDir.equals("asc", true)) Sort.Direction.ASC else Sort.Direction.DESC
        val pageable = PageRequest.of(safePage, safeSize, Sort.by(direction, safeSort).and(Sort.by(Sort.Direction.DESC, "createdAt")))

        val result = patientVisitRepository
            .findAll(PatientVisitSpecifications.search(search), pageable)
            .map { mapVisitListResponse(it) }

        return PageResponse.from(result)
    }

    @Transactional(readOnly = true)
    fun exportVisits(
        search: String?,
        sortBy: String,
        sortDir: String
    ): List<PatientVisitListResponse> {
        val safeSort = visitSorts[sortBy] ?: "visitDate"
        val direction = if (sortDir.equals("asc", true)) Sort.Direction.ASC else Sort.Direction.DESC
        val sort = Sort.by(direction, safeSort).and(Sort.by(Sort.Direction.DESC, "createdAt"))

        return patientVisitRepository
            .findAll(PatientVisitSpecifications.search(search), sort)
            .map { mapVisitListResponse(it) }
    }

    @Transactional(readOnly = true)
    fun lookup(type: PatientLookupType, rawValue: String): List<PatientResponse> {
        val value = rawValue.trim()
        if (value.isBlank()) {
            throw BusinessValidationException(
                "Search value is required",
                mapOf("lookupValue" to "Enter a value to search")
            )
        }

        val patients = when (type) {
            PatientLookupType.PATIENT_ID -> {
                val id = value.toLongOrNull()
                    ?: throw BusinessValidationException(
                        "Patient ID must be a number",
                        mapOf("lookupValue" to "Enter a valid numeric patient ID")
                    )

                patientRepository.findById(id)
                    .map { listOf(it) }
                    .orElse(emptyList())
            }

            PatientLookupType.MRN ->
                listOfNotNull(patientRepository.findByMedicalRecordNumberIgnoreCase(value))

            PatientLookupType.MOBILE -> {
                if (!value.matches(Regex("^[0-9]{8,10}$"))) {
                    throw BusinessValidationException(
                        "Mobile number must contain between 8 and 10 digits",
                        mapOf("lookupValue" to "Enter an 8 to 10 digit mobile number")
                    )
                }
                patientRepository.findAllByContactNumberOrderByFullNameAsc(value)
            }

            PatientLookupType.INSURANCE_NUMBER ->
                patientRepository.findDistinctByInsurancePolicyNumber(value)
        }

        if (patients.isEmpty()) {
            throw ResourceNotFoundException("No patient was found for the supplied ${type.displayName()}")
        }

        return patients
            .distinctBy { it.id }
            .sortedWith(compareBy<Patient> { it.fullName.lowercase() }.thenBy { it.id })
            .map { mapToResponse(it) }
    }

    @Transactional(readOnly = true)
    fun get(id: Long): PatientResponse = mapToResponse(findEntity(id))

    @Transactional(readOnly = true)
    fun getByMrn(mrn: String): PatientResponse = mapToResponse(findEntityByMrn(mrn))

    @Transactional(readOnly = true)
    fun visits(patientId: Long): List<VisitResponse> {
        findEntity(patientId)
        return patientVisitRepository
            .findAllByPatientIdOrderByVisitDateDescCreatedAtDesc(patientId)
            .map { mapVisit(it) }
    }

    @Transactional
    fun update(id: Long, request: PatientRequest, actor: String): PatientResponse {
        val patient = findEntity(id)
        applyRequest(patient, request)
        val saved = patientRepository.save(patient)
        log.info("Patient {} demographic information updated by {}", id, actor)
        return mapToResponse(saved)
    }

    @Transactional
    fun delete(id: Long, actor: String) {
        patientRepository.delete(findEntity(id))
        log.warn("Patient {} deleted by {}", id, actor)
    }

    fun findEntity(id: Long): Patient = patientRepository.findById(id)
        .orElseThrow { ResourceNotFoundException("Patient with ID $id was not found") }

    fun findEntityByMrn(mrn: String): Patient = patientRepository
        .findByMedicalRecordNumberIgnoreCase(mrn.trim())
        ?: throw ResourceNotFoundException("Patient with MRN ${mrn.trim()} was not found")

    fun mapToResponse(patient: Patient): PatientResponse {
        val visits = patient.visits
        val latestVisit = visits.maxWithOrNull(
            compareBy<PatientVisit> { it.visitDate }
                .thenBy { it.createdAt }
                .thenBy { it.id ?: 0L }
        )

        val amountPaid = visits
            .flatMap { it.bills }
            .filter { it.paymentStatus == PaymentStatus.PAID }
            .fold(BigDecimal.ZERO) { total, bill -> total + bill.amount }

        return PatientResponse(
            id = patient.id!!,
            medicalRecordNumber = patient.medicalRecordNumber,
            fullName = patient.fullName,
            gender = patient.gender,
            dateOfBirth = patient.dateOfBirth,
            contactNumber = patient.contactNumber,
            address = patient.address,
            registeredAt = patient.registeredAt,
            updatedAt = patient.updatedAt,
            patientType = latestVisit?.patientType,
            latestVisitId = latestVisit?.id,
            latestVisitDate = latestVisit?.visitDate,
            patientStatus = latestVisit?.patientStatus,
            department = latestVisit?.department?.let { AssignedDepartmentResponse(it.id!!, it.name) },
            assignedDoctor = latestVisit?.doctor?.let { doctor ->
                AssignedDoctorResponse(
                    id = doctor.id!!,
                    fullName = doctor.fullName,
                    specialization = doctor.specialization,
                    departments = doctor.departments.sortedBy { it.name }.map { it.name }
                )
            },
            insuranceDetail = latestVisit?.insuranceDetail?.toResponse(),
            visitCount = visits.size,
            amountPaid = amountPaid
        )
    }

    fun mapVisitListResponse(visit: PatientVisit): PatientVisitListResponse {
        val patient = visit.patient!!
        val bills = visit.bills
        val billedAmount = bills.fold(BigDecimal.ZERO) { total, bill -> total + bill.amount }
        val paidAmount = bills
            .filter { it.paymentStatus == PaymentStatus.PAID }
            .fold(BigDecimal.ZERO) { total, bill -> total + bill.amount }

        val billingStatus = when {
            bills.isEmpty() -> "NO_BILL"
            bills.all { it.paymentStatus == PaymentStatus.PAID } -> "PAID"
            bills.all { it.paymentStatus == PaymentStatus.PENDING } -> "PENDING"
            else -> "MIXED"
        }

        return PatientVisitListResponse(
            visitId = visit.id!!,
            patientId = patient.id!!,
            medicalRecordNumber = patient.medicalRecordNumber,
            fullName = patient.fullName,
            gender = patient.gender,
            dateOfBirth = patient.dateOfBirth,
            contactNumber = patient.contactNumber,
            address = patient.address,
            visitDate = visit.visitDate,
            patientStatus = visit.patientStatus,
            patientType = visit.patientType,
            departmentName = visit.department!!.name,
            doctorName = visit.doctor!!.fullName,
            reasonForVisit = visit.reasonForVisit,
            insuranceProvider = visit.insuranceDetail?.provider,
            insuranceNumber = visit.insuranceDetail?.policyNumber,
            registeredBy = visit.createdBy,
            registeredAt = visit.createdAt,
            billIds = bills.mapNotNull { it.id }.sorted(),
            billedAmount = billedAmount,
            paidAmount = paidAmount,
            billingStatus = billingStatus
        )
    }

    fun mapVisit(visit: PatientVisit): VisitResponse {
        val patient = visit.patient!!
        val doctor = visit.doctor!!
        val department = visit.department!!

        return VisitResponse(
            id = visit.id!!,
            patientId = patient.id!!,
            medicalRecordNumber = patient.medicalRecordNumber,
            patientName = patient.fullName,
            visitDate = visit.visitDate,
            patientStatus = visit.patientStatus,
            patientType = visit.patientType,
            department = AssignedDepartmentResponse(department.id!!, department.name),
            doctor = AssignedDoctorResponse(
                id = doctor.id!!,
                fullName = doctor.fullName,
                specialization = doctor.specialization,
                departments = doctor.departments.sortedBy { it.name }.map { it.name }
            ),
            reasonForVisit = visit.reasonForVisit,
            insuranceDetail = visit.insuranceDetail?.toResponse(),
            createdBy = visit.createdBy,
            createdAt = visit.createdAt
        )
    }

    private fun applyRequest(patient: Patient, request: PatientRequest) {
        patient.fullName = request.fullName.trim()
        patient.gender = request.gender!!
        patient.dateOfBirth = request.dateOfBirth!!
        patient.contactNumber = request.contactNumber.trim()
        patient.address = request.address.trim()
        patient.updatedAt = LocalDateTime.now()
    }

    private fun temporaryMrn(): String = "TMP-${UUID.randomUUID().toString().replace("-", "").take(20)}"

    private fun generateMrn(patient: Patient): String {
        val year = patient.registeredAt.year
        val number = patient.id!!.toString().padStart(6, '0')
        return "EHMS-$year-$number"
    }

    private fun PatientLookupType.displayName(): String = when (this) {
        PatientLookupType.PATIENT_ID -> "patient ID"
        PatientLookupType.MRN -> "MRN"
        PatientLookupType.MOBILE -> "mobile number"
        PatientLookupType.INSURANCE_NUMBER -> "insurance number"
    }

    private fun InsuranceDetail.toResponse() = InsuranceDetailResponse(
        id = id!!,
        provider = provider,
        policyNumber = policyNumber,
        coverageAmount = coverageAmount,
        expiryDate = expiryDate
    )
}
