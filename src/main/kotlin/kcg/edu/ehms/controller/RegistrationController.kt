package kcg.edu.ehms.controller

import jakarta.validation.Valid
import kcg.edu.ehms.dto.charge.PatientRegistrationResponse
import kcg.edu.ehms.dto.visit.NewPatientRegistrationRequest
import kcg.edu.ehms.dto.visit.ReturningPatientRegistrationRequest
import kcg.edu.ehms.service.RegistrationService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/registrations")
class RegistrationController(
    private val registrationService: RegistrationService
) {
    @PostMapping("/new")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    fun registerNew(
        authentication: Authentication,
        @Valid @RequestBody request: NewPatientRegistrationRequest
    ): ResponseEntity<PatientRegistrationResponse> =
        ResponseEntity.status(HttpStatus.CREATED)
            .body(registrationService.registerNew(request, authentication.name))

    @PostMapping("/returning")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    fun registerReturning(
        authentication: Authentication,
        @Valid @RequestBody request: ReturningPatientRegistrationRequest
    ): ResponseEntity<PatientRegistrationResponse> =
        ResponseEntity.status(HttpStatus.CREATED)
            .body(registrationService.registerReturning(request, authentication.name))
}
