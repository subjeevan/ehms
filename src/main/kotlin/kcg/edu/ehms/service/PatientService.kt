package kcg.edu.ehms.service

import kcg.edu.ehms.dto.common.PageResponse
import kcg.edu.ehms.dto.patient.*
import kcg.edu.ehms.entity.InsuranceDetail
import kcg.edu.ehms.entity.Patient
import kcg.edu.ehms.entity.PatientType
import kcg.edu.ehms.exception.BusinessValidationException
import kcg.edu.ehms.exception.DuplicateEntryException
import kcg.edu.ehms.exception.ResourceNotFoundException
import kcg.edu.ehms.repository.InsuranceDetailRepository
import kcg.edu.ehms.repository.PatientRepository
import kcg.edu.ehms.specification.PatientSpecifications
import org.slf4j.LoggerFactory
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class PatientService(
    private val patientRepository: PatientRepository,
    private val insuranceDetailRepository: InsuranceDetailRepository
) {
    private val log = LoggerFactory.getLogger(javaClass)
    private val allowedSorts = setOf("id", "fullName", "gender", "dateOfBirth", "patientType", "registeredAt")

    @Transactional
    fun create(request: PatientRequest, actor: String): PatientResponse {
        validateInsurance(request)
        val patient = Patient()
        applyRequest(patient, request)
        val saved = patientRepository.save(patient)
        log.info("Patient {} created by {}", saved.id, actor)
        return saved.toResponse()
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
        val result = patientRepository.findAll(PatientSpecifications.search(search), pageable).map { it.toResponse() }
        return PageResponse.from(result)
    }

    @Transactional(readOnly = true)
    fun get(id: Long): PatientResponse = find(id).toResponse()

    @Transactional
    fun update(id: Long, request: PatientRequest, actor: String): PatientResponse {
        validateInsurance(request, id)
        val patient = find(id)
        applyRequest(patient, request)
        val saved = patientRepository.save(patient)
        log.info("Patient {} updated by {}", id, actor)
        return saved.toResponse()
    }

    @Transactional
    fun delete(id: Long, actor: String) {
        val patient = find(id)
        patientRepository.delete(patient)
        log.warn("Patient {} deleted by {}", id, actor)
    }

    private fun find(id: Long): Patient = patientRepository.findById(id)
        .orElseThrow { ResourceNotFoundException("Patient with ID $id was not found") }

    private fun validateInsurance(request: PatientRequest, patientId: Long? = null) {
        if (request.patientType == PatientType.INSURANCE && request.insuranceDetail == null) {
            throw BusinessValidationException(
                "Insurance information is required",
                mapOf("insuranceDetail" to "Insurance details are required for insurance patients")
            )
        }
        val detail = request.insuranceDetail ?: return
        if (request.patientType != PatientType.INSURANCE) {
            throw BusinessValidationException(
                "Insurance information is not applicable",
                mapOf("insuranceDetail" to "Insurance details are only allowed for insurance patients")
            )
        }
        val currentInsuranceId = patientId?.let { patientRepository.findById(it).orElse(null)?.insuranceDetail?.id }
        val duplicate = if (currentInsuranceId == null) {
            insuranceDetailRepository.existsByPolicyNumber(detail.policyNumber.trim())
        } else {
            insuranceDetailRepository.existsByPolicyNumberAndIdNot(detail.policyNumber.trim(), currentInsuranceId)
        }
        if (duplicate) throw DuplicateEntryException("Insurance policy number already exists")
    }

    private fun applyRequest(patient: Patient, request: PatientRequest) {
        patient.fullName = request.fullName.trim()
        patient.gender = request.gender!!
        patient.dateOfBirth = request.dateOfBirth!!
        patient.contactNumber = request.contactNumber.trim()
        patient.address = request.address.trim()
        patient.patientType = request.patientType!!

        if (request.patientType == PatientType.INSURANCE) {
            val req = request.insuranceDetail!!
            val detail = patient.insuranceDetail ?: InsuranceDetail()
            detail.provider = req.provider.trim()
            detail.policyNumber = req.policyNumber.trim()
            detail.coverageAmount = req.coverageAmount!!
            detail.expiryDate = req.expiryDate!!
            patient.insuranceDetail = detail
        } else {
            patient.insuranceDetail = null
        }
    }

    private fun Patient.toResponse() = PatientResponse(
        id = id!!,
        fullName = fullName,
        gender = gender,
        dateOfBirth = dateOfBirth,
        contactNumber = contactNumber,
        address = address,
        patientType = patientType,
        registeredAt = registeredAt,
        insuranceDetail = insuranceDetail?.let {
            InsuranceDetailResponse(it.id!!, it.provider, it.policyNumber, it.coverageAmount, it.expiryDate)
        }
    )
}
