package kcg.edu.ehms.controller

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

@RestController
@RequestMapping("/api/patients")
class PatientController(
    private val patientService: PatientService
) {
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    fun create(
        authentication: Authentication,
        @Valid @RequestBody request: PatientRequest
    ): ResponseEntity<PatientResponse> =
        ResponseEntity.status(HttpStatus.CREATED).body(patientService.create(request, authentication.name))

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

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    fun get(@PathVariable id: Long): ResponseEntity<PatientResponse> = ResponseEntity.ok(patientService.get(id))

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun update(
        authentication: Authentication,
        @PathVariable id: Long,
        @Valid @RequestBody request: PatientRequest
    ): ResponseEntity<PatientResponse> =
        ResponseEntity.ok(patientService.update(id, request, authentication.name))

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun delete(authentication: Authentication, @PathVariable id: Long): ResponseEntity<Void> {
        patientService.delete(id, authentication.name)
        return ResponseEntity.noContent().build()
    }
}
