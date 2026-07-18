package kcg.edu.ehms.controller

import jakarta.validation.Valid
import kcg.edu.ehms.dto.common.PageResponse
import kcg.edu.ehms.dto.patient.PatientLookupType
import kcg.edu.ehms.dto.patient.PatientRequest
import kcg.edu.ehms.dto.patient.PatientResponse
import kcg.edu.ehms.dto.visit.VisitResponse
import kcg.edu.ehms.service.PatientService
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/patients")
class PatientController(
    private val patientService: PatientService
) {
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

    @GetMapping("/lookup")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    fun lookup(
        @RequestParam type: PatientLookupType,
        @RequestParam value: String
    ): ResponseEntity<List<PatientResponse>> =
        ResponseEntity.ok(patientService.lookup(type, value))

    @GetMapping("/by-mrn/{mrn}")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    fun getByMrn(@PathVariable mrn: String): ResponseEntity<PatientResponse> =
        ResponseEntity.ok(patientService.getByMrn(mrn))

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    fun get(@PathVariable id: Long): ResponseEntity<PatientResponse> =
        ResponseEntity.ok(patientService.get(id))

    @GetMapping("/{id}/visits")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    fun visits(@PathVariable id: Long): ResponseEntity<List<VisitResponse>> =
        ResponseEntity.ok(patientService.visits(id))

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
