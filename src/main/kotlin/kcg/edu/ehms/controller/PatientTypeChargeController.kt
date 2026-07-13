package kcg.edu.ehms.controller

import kcg.edu.ehms.dto.charge.PatientTypeChargeResponse
import kcg.edu.ehms.dto.charge.UpdatePatientTypeChargeRequest
import kcg.edu.ehms.entity.PatientType
import kcg.edu.ehms.service.PatientTypeChargeService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

/**
 * REST controller for managing patient type charge configurations.
 * Allows administrators to view and modify the default registration charges for each patient type.
 * Requires ROLE_ADMIN for all operations.
 */
@RestController
@RequestMapping("/api/setup/charges")
@PreAuthorize("hasRole('ADMIN')")
class PatientTypeChargeController(
    private val patientTypeChargeService: PatientTypeChargeService
) {
    /**
     * Retrieves all patient type charge configurations.
     * Admin-only operation.
     */
    @GetMapping
    fun listAll(): ResponseEntity<List<PatientTypeChargeResponse>> =
        ResponseEntity.ok(patientTypeChargeService.listAll())

    /**
     * Retrieves the charge configuration for a specific patient type.
     * Admin-only operation.
     */
    @GetMapping("/{patientType}")
    fun getByPatientType(@PathVariable patientType: PatientType): ResponseEntity<PatientTypeChargeResponse> =
        ResponseEntity.ok(patientTypeChargeService.getByPatientType(patientType))

    /**
     * Updates the charge configuration for a specific patient type.
     * Admin-only operation. Tracks who made the change.
     */
    @PutMapping("/{patientType}")
    fun update(
        @PathVariable patientType: PatientType,
        @Valid @RequestBody request: UpdatePatientTypeChargeRequest,
        authentication: Authentication
    ): ResponseEntity<PatientTypeChargeResponse> =
        ResponseEntity.ok(patientTypeChargeService.update(patientType, request, authentication.name))
}
