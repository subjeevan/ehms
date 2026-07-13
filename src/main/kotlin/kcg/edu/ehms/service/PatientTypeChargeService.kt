package kcg.edu.ehms.service

import kcg.edu.ehms.dto.charge.PatientTypeChargeResponse
import kcg.edu.ehms.dto.charge.UpdatePatientTypeChargeRequest
import kcg.edu.ehms.entity.PatientType
import kcg.edu.ehms.entity.PatientTypeCharge
import kcg.edu.ehms.exception.BusinessValidationException
import kcg.edu.ehms.exception.ResourceNotFoundException
import kcg.edu.ehms.repository.PatientTypeChargeRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal

@Service
class PatientTypeChargeService(
    private val patientTypeChargeRepository: PatientTypeChargeRepository
) {
    private val log = LoggerFactory.getLogger(javaClass)

    @Transactional(readOnly = true)
    fun listAll(): List<PatientTypeChargeResponse> = patientTypeChargeRepository.findAll()
        .sortedBy { it.patientType.ordinal }
        .map { it.toResponse() }

    @Transactional(readOnly = true)
    fun getByPatientType(patientType: PatientType): PatientTypeChargeResponse {
        val charge = patientTypeChargeRepository.findByPatientType(patientType)
            ?: throw ResourceNotFoundException("No charge configuration found for patient type $patientType")
        return charge.toResponse()
    }

    @Transactional
    fun update(patientType: PatientType, request: UpdatePatientTypeChargeRequest, actor: String): PatientTypeChargeResponse {
        val charge = patientTypeChargeRepository.findByPatientType(patientType)
            ?: throw ResourceNotFoundException("No charge configuration found for patient type $patientType")

        val oldAmount = charge.amount
        charge.amount = request.amount!!
        charge.enabled = request.enabled
        charge.updatedAt = java.time.LocalDateTime.now()

        val saved = patientTypeChargeRepository.save(charge)
        log.info(
            "Charge for patient type {} updated from {} to {} by {} (enabled: {})",
            patientType,
            oldAmount,
            saved.amount,
            actor,
            saved.enabled
        )
        return saved.toResponse()
    }

    @Transactional(readOnly = true)
    fun getChargeForPatientType(patientType: PatientType): BigDecimal {
        val charge = patientTypeChargeRepository.findByPatientType(patientType)
            ?: throw BusinessValidationException(
                "No registration charge is configured for patient type $patientType",
                mapOf("patientType" to "No registration charge is configured for patient type $patientType")
            )

        if (!charge.enabled) {
            log.info("Charge for patient type {} is disabled, no automatic billing will occur", patientType)
            throw BusinessValidationException(
                "Registration charge is disabled for patient type $patientType",
                mapOf("patientType" to "Registration charge is disabled for patient type $patientType")
            )
        }

        return charge.amount
    }

    @Transactional(readOnly = true)
    fun tryGetChargeForPatientType(patientType: PatientType): BigDecimal? {
        val charge = patientTypeChargeRepository.findByPatientType(patientType) ?: return null
        return if (charge.enabled) charge.amount else null
    }

    private fun PatientTypeCharge.toResponse() = PatientTypeChargeResponse(
        id = id!!,
        patientType = patientType,
        amount = amount,
        enabled = enabled
    )
}
