package kcg.edu.ehms.service

import kcg.edu.ehms.dto.bill.BillResponse
import kcg.edu.ehms.dto.charge.PatientRegistrationResponse
import kcg.edu.ehms.dto.visit.*
import kcg.edu.ehms.entity.*
import kcg.edu.ehms.exception.BusinessValidationException
import kcg.edu.ehms.exception.ResourceNotFoundException
import kcg.edu.ehms.repository.*
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate

@Service
class RegistrationService(
    private val patientService: PatientService,
    private val patientVisitRepository: PatientVisitRepository,
    private val departmentRepository: DepartmentRepository,
    private val doctorRepository: DoctorRepository,
    private val billRepository: BillRepository,
    private val patientTypeChargeService: PatientTypeChargeService
) {
    private val log = LoggerFactory.getLogger(javaClass)

    @Transactional
    fun registerNew(request: NewPatientRegistrationRequest, actor: String): PatientRegistrationResponse {
        val patient = patientService.createEntity(request.patient!!)
        val visit = createVisit(patient, request.visit!!, VisitPatientStatus.NEW, actor)
        val bill = createRegistrationBill(visit)

        log.info("New patient {} registered with MRN {} and visit {} by {}", patient.id, patient.medicalRecordNumber, visit.id, actor)
        return response(patient, visit, bill, "New patient registered successfully")
    }

    @Transactional
    fun registerReturning(request: ReturningPatientRegistrationRequest, actor: String): PatientRegistrationResponse {
        val patient = patientService.findEntityByMrn(request.medicalRecordNumber)
        val visit = createVisit(patient, request.visit!!, VisitPatientStatus.RETURNING, actor)
        val bill = createRegistrationBill(visit)

        log.info("Returning patient {} registered for visit {} by {}", patient.medicalRecordNumber, visit.id, actor)
        return response(patient, visit, bill, "Returning patient visit registered successfully")
    }

    private fun createVisit(
        patient: Patient,
        request: VisitRegistrationRequest,
        status: VisitPatientStatus,
        actor: String
    ): PatientVisit {
        validateInsurance(request)

        val department = departmentRepository.findById(request.departmentId!!)
            .orElseThrow { ResourceNotFoundException("Selected department was not found") }

        val doctor = doctorRepository.findById(request.doctorId!!)
            .orElseThrow { ResourceNotFoundException("Selected doctor was not found") }

        val doctorBelongsToDepartment = doctor.departments.any { it.id == department.id }
        if (!doctorBelongsToDepartment) {
            throw BusinessValidationException(
                "Doctor and department do not match",
                mapOf("doctorId" to "Select a doctor who belongs to the selected department")
            )
        }

        val visit = PatientVisit(
            patient = patient,
            visitDate = LocalDate.now(),
            patientStatus = status,
            patientType = request.patientType!!,
            department = department,
            doctor = doctor,
            reasonForVisit = request.reasonForVisit?.trim()?.takeIf { it.isNotBlank() },
            createdBy = actor,
            insuranceDetail = request.insuranceDetail?.let {
                InsuranceDetail(
                    provider = it.provider.trim(),
                    policyNumber = it.policyNumber.trim(),
                    coverageAmount = it.coverageAmount!!,
                    expiryDate = it.expiryDate!!
                )
            }
        )

        val saved = patientVisitRepository.save(visit)
        patient.visits.add(saved)
        return saved
    }

    private fun validateInsurance(request: VisitRegistrationRequest) {
        if (request.patientType == PatientType.INSURANCE && request.insuranceDetail == null) {
            throw BusinessValidationException(
                "Insurance information is required",
                mapOf("insuranceDetail" to "Insurance details are required for an insurance visit")
            )
        }

        if (request.patientType != PatientType.INSURANCE && request.insuranceDetail != null) {
            throw BusinessValidationException(
                "Insurance information is not applicable",
                mapOf("insuranceDetail" to "Insurance details are only allowed for an insurance visit")
            )
        }
    }

    private fun createRegistrationBill(visit: PatientVisit): Bill? {
        val chargeAmount = patientTypeChargeService.tryGetChargeForPatientType(visit.patientType) ?: return null
        val paymentStatus = if (visit.patientType == PatientType.INSURANCE) PaymentStatus.PENDING else PaymentStatus.PAID

        val bill = billRepository.save(
            Bill(
                visit = visit,
                amount = chargeAmount,
                billDate = visit.visitDate,
                paymentStatus = paymentStatus,
                billType = BillType.REGISTRATION,
                description = "Visit registration charge - ${visit.patientType}"
            )
        )
        visit.bills.add(bill)
        return bill
    }

    private fun response(
        patient: Patient,
        visit: PatientVisit,
        bill: Bill?,
        successMessage: String
    ): PatientRegistrationResponse {
        val billResponse = bill?.toResponse()
        val message = if (billResponse == null) {
            "$successMessage. Automatic registration billing is disabled."
        } else {
            "$successMessage and registration bill created."
        }

        return PatientRegistrationResponse(
            patient = patientService.mapToResponse(patient),
            visit = patientService.mapVisit(visit),
            bill = billResponse,
            message = message
        )
    }

    private fun Bill.toResponse(): BillResponse {
        val visit = visit!!
        val patient = visit.patient!!
        return BillResponse(
            id = id!!,
            visitId = visit.id!!,
            patientId = patient.id!!,
            medicalRecordNumber = patient.medicalRecordNumber,
            patientName = patient.fullName,
            amount = amount,
            billDate = billDate,
            paymentStatus = paymentStatus,
            billType = billType,
            description = description
        )
    }
}
