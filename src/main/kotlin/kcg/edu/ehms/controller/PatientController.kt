package kcg.edu.ehms.controller

import kcg.edu.ehms.dto.charge.PatientRegistrationResponse
import kcg.edu.ehms.dto.common.PageResponse
import kcg.edu.ehms.dto.patient.PatientRequest
import kcg.edu.ehms.dto.patient.PatientResponse
import kcg.edu.ehms.service.PatientService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

/**
 * REST controller for managing patient records.
 * Handles creation, retrieval, updating, and deletion of patient information.
 * Supports pagination and search functionality for patient listings.
 * Automatic bill creation is available via the /api/patients/with-billing endpoint.
 */
@RestController
@RequestMapping("/api/patients")
class PatientController(
    private val patientService: PatientService
) {
    /**
     * Creates a new patient record.
     * Requires ADMIN or USER role. Tracks the user who created the record.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    fun create(
        authentication: Authentication,
        @Valid @RequestBody request: PatientRequest
    ): ResponseEntity<PatientResponse> =
        ResponseEntity.status(HttpStatus.CREATED).body(patientService.create(request, authentication.name))

    /**
     * Creates a new patient record with automatic registration bill creation based on patient type charge configuration.
     * Requires ADMIN or USER role. Returns both patient and bill information.
     * Bill creation is automatic if enabled in charge configuration, otherwise skipped gracefully.
     */
    @PostMapping("/with-billing")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    fun createWithBilling(
        authentication: Authentication,
        @Valid @RequestBody request: PatientRequest
    ): ResponseEntity<PatientRegistrationResponse> =
        ResponseEntity.status(HttpStatus.CREATED).body(patientService.createWithBilling(request, authentication.name))

    /**
     * Retrieves a paginated list of patients with optional search and sorting.
     * Supports filtering by patient name, contact number, and address.
     * Default sort is by registration date in descending order.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    fun list(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "10") size: Int,
        @RequestParam(required = false, defaultValue = "") search: String,
        @RequestParam(defaultValue = "registeredAt") sortBy: String,
        @RequestParam(defaultValue = "desc") sortDir: String
    ): ResponseEntity<PageResponse<PatientResponse>> =
        ResponseEntity.ok(patientService.list(page, size, search, sortBy, sortDir))

    /**
     * Retrieves details of a specific patient by ID.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    fun get(@PathVariable id: Long): ResponseEntity<PatientResponse> = ResponseEntity.ok(patientService.get(id))

    /**
     * Updates an existing patient record.
     * Requires ADMIN role. Tracks the user who performed the update.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun update(
        authentication: Authentication,
        @PathVariable id: Long,
        @Valid @RequestBody request: PatientRequest
    ): ResponseEntity<PatientResponse> =
        ResponseEntity.ok(patientService.update(id, request, authentication.name))

    /**
     * Deletes a patient record permanently.
     * Requires ADMIN role. Tracks the user who performed the deletion.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun delete(authentication: Authentication, @PathVariable id: Long): ResponseEntity<Void> {
        patientService.delete(id, authentication.name)
        return ResponseEntity.noContent().build()
    }
}
