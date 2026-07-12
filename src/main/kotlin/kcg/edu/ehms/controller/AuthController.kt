package kcg.edu.ehms.controller

import kcg.edu.ehms.dto.auth.*
import kcg.edu.ehms.service.AuthService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val authService: AuthService
) {
    @PostMapping("/login")
    fun login(@Valid @RequestBody request: LoginRequest): ResponseEntity<LoginResponse> =
        ResponseEntity.ok(authService.login(request))

    @GetMapping("/me")
    fun me(authentication: Authentication): ResponseEntity<CurrentUserResponse> =
        ResponseEntity.ok(authService.currentUser(authentication))

    @PostMapping("/change-password")
    fun changePassword(
        authentication: Authentication,
        @Valid @RequestBody request: ChangePasswordRequest
    ): ResponseEntity<MessageResponse> =
        ResponseEntity.ok(authService.changePassword(authentication.name, request))

    @PostMapping("/logout")
    fun logout(): ResponseEntity<MessageResponse> =
        ResponseEntity.ok(MessageResponse("Logged out successfully. Remove the token on the client."))
}
