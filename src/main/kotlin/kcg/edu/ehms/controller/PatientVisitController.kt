package kcg.edu.ehms.controller

import kcg.edu.ehms.dto.common.PageResponse
import kcg.edu.ehms.dto.visit.PatientVisitListResponse
import kcg.edu.ehms.service.PatientService
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/visits")
class PatientVisitController(
    private val patientService: PatientService
) {
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    fun list(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "10") size: Int,
        @RequestParam(required = false) search: String?,
        @RequestParam(defaultValue = "visitDate") sortBy: String,
        @RequestParam(defaultValue = "desc") sortDir: String
    ): ResponseEntity<PageResponse<PatientVisitListResponse>> =
        ResponseEntity.ok(patientService.listVisits(page, size, search, sortBy, sortDir))

    @GetMapping("/export")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    fun export(
        @RequestParam(required = false) search: String?,
        @RequestParam(defaultValue = "visitDate") sortBy: String,
        @RequestParam(defaultValue = "desc") sortDir: String
    ): ResponseEntity<List<PatientVisitListResponse>> =
        ResponseEntity.ok(patientService.exportVisits(search, sortBy, sortDir))
}
