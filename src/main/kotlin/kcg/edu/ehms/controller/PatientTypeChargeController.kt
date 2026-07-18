package kcg.edu.ehms.controller

import jakarta.validation.Valid
import kcg.edu.ehms.dto.charge.PatientTypeChargeResponse
import kcg.edu.ehms.dto.charge.UpdatePatientTypeChargeRequest
import kcg.edu.ehms.entity.PatientType
import kcg.edu.ehms.service.PatientTypeChargeService
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

/**
 * Registration charges may be read by authenticated ADMIN and USER accounts
 * so the selected charge can be displayed during patient registration.
 * Only ADMIN may modify the configured charge.
 */
@RestController
@RequestMapping("/api/setup/charges")
class PatientTypeChargeController(
    private val patientTypeChargeService: PatientTypeChargeService
) {
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    fun listAll(): ResponseEntity<List<PatientTypeChargeResponse>> =
        ResponseEntity.ok(patientTypeChargeService.listAll())

    @GetMapping("/{patientType}")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    fun getByPatientType(
        @PathVariable patientType: PatientType
    ): ResponseEntity<PatientTypeChargeResponse> =
        ResponseEntity.ok(patientTypeChargeService.getByPatientType(patientType))

    @PutMapping("/{patientType}")
    @PreAuthorize("hasRole('ADMIN')")
    fun update(
        @PathVariable patientType: PatientType,
        @Valid @RequestBody request: UpdatePatientTypeChargeRequest,
        authentication: Authentication
    ): ResponseEntity<PatientTypeChargeResponse> =
        ResponseEntity.ok(patientTypeChargeService.update(patientType, request, authentication.name))
}
