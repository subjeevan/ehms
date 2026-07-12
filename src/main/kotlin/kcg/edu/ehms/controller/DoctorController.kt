package kcg.edu.ehms.controller

import kcg.edu.ehms.dto.setup.DoctorRequest
import kcg.edu.ehms.dto.setup.DoctorResponse
import kcg.edu.ehms.service.DoctorService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

/**
 * REST controller for managing doctor information and assignments.
 * Handles CRUD operations for doctor profiles including specialization and department assignments.
 * All endpoints require ADMIN role authorization.
 */
@RestController
@RequestMapping("/api/doctors")
@PreAuthorize("hasRole('ADMIN')")
class DoctorController(
    private val service: DoctorService
) {
    /**
     * Retrieves a list of all doctors.
     */
    @GetMapping
    fun list(): ResponseEntity<List<DoctorResponse>> = ResponseEntity.ok(service.list())

    /**
     * Creates a new doctor profile with specialization and department assignments.
     */
    @PostMapping
    fun create(@Valid @RequestBody request: DoctorRequest): ResponseEntity<DoctorResponse> =
        ResponseEntity.status(HttpStatus.CREATED).body(service.create(request))

    /**
     * Updates an existing doctor's information including specialization and department assignments.
     */
    @PutMapping("/{id}")
    fun update(@PathVariable id: Long, @Valid @RequestBody request: DoctorRequest): ResponseEntity<DoctorResponse> =
        ResponseEntity.ok(service.update(id, request))

    /**
     * Deletes a doctor profile permanently.
     */
    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long): ResponseEntity<Void> {
        service.delete(id)
        return ResponseEntity.noContent().build()
    }
}
