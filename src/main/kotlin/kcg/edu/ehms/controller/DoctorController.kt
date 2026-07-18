package kcg.edu.ehms.controller

import jakarta.validation.Valid
import kcg.edu.ehms.dto.setup.DoctorRequest
import kcg.edu.ehms.dto.setup.DoctorResponse
import kcg.edu.ehms.service.DoctorService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

/**
 * REST controller for managing doctor information and assignments.
 * ADMIN and USER may read the doctor list for patient registration.
 * Only ADMIN may create, update, or delete doctor records.
 */
@RestController
@RequestMapping("/api/doctors")
class DoctorController(
    private val service: DoctorService
) {
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    fun list(): ResponseEntity<List<DoctorResponse>> =
        ResponseEntity.ok(service.list())

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    fun create(
        @Valid @RequestBody request: DoctorRequest
    ): ResponseEntity<DoctorResponse> =
        ResponseEntity.status(HttpStatus.CREATED).body(service.create(request))

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun update(
        @PathVariable id: Long,
        @Valid @RequestBody request: DoctorRequest
    ): ResponseEntity<DoctorResponse> =
        ResponseEntity.ok(service.update(id, request))

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun delete(@PathVariable id: Long): ResponseEntity<Void> {
        service.delete(id)
        return ResponseEntity.noContent().build()
    }
}
