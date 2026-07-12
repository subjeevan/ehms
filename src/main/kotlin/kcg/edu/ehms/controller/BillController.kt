package kcg.edu.ehms.controller

import kcg.edu.ehms.dto.bill.BillRequest
import kcg.edu.ehms.dto.bill.BillResponse
import kcg.edu.ehms.service.BillService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

/**
 * REST controller for managing patient billing.
 * Handles CRUD operations for creating, updating, and deleting patient bills.
 * Supports filtering bills by patient ID.
 */
@RestController
@RequestMapping("/api")
class BillController(
    private val service: BillService
) {
    /**
     * Retrieves all bills for a specific patient.
     * Requires ADMIN or USER role.
     */
    @GetMapping("/patients/{patientId}/bills")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    fun list(@PathVariable patientId: Long): ResponseEntity<List<BillResponse>> =
        ResponseEntity.ok(service.listForPatient(patientId))

    /**
     * Creates a new bill for a patient with amount and payment status.
     * Requires ADMIN role.
     */
    @PostMapping("/patients/{patientId}/bills")
    @PreAuthorize("hasRole('ADMIN')")
    fun create(
        @PathVariable patientId: Long,
        @Valid @RequestBody request: BillRequest
    ): ResponseEntity<BillResponse> =
        ResponseEntity.status(HttpStatus.CREATED).body(service.create(patientId, request))

    /**
     * Updates an existing bill's amount and payment status.
     * Requires ADMIN role.
     */
    @PutMapping("/bills/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun update(@PathVariable id: Long, @Valid @RequestBody request: BillRequest): ResponseEntity<BillResponse> =
        ResponseEntity.ok(service.update(id, request))

    /**
     * Deletes a bill permanently.
     * Requires ADMIN role.
     */
    @DeleteMapping("/bills/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun delete(@PathVariable id: Long): ResponseEntity<Void> {
        service.delete(id)
        return ResponseEntity.noContent().build()
    }
}
