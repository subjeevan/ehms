package kcg.edu.ehms.controller

import kcg.edu.ehms.dto.auth.*
import kcg.edu.ehms.service.AuthService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

/**
 * REST controller for handling authentication operations.
 * Provides endpoints for user login, logout, password changes, and retrieving current user information.
 */
@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val authService: AuthService
) {
    /**
     * Authenticates user with username and password, returns JWT token for subsequent requests.
     */
    @PostMapping("/login")
    fun login(@Valid @RequestBody request: LoginRequest): ResponseEntity<LoginResponse> =
        ResponseEntity.ok(authService.login(request))

    /**
     * Retrieves information about the currently authenticated user.
     */
    @GetMapping("/me")
    fun me(authentication: Authentication): ResponseEntity<CurrentUserResponse> =
        ResponseEntity.ok(authService.currentUser(authentication))

    /**
     * Allows an authenticated user to change their password.
     * Validates old password before updating to new password.
     */
    @PostMapping("/change-password")
    fun changePassword(
        authentication: Authentication,
        @Valid @RequestBody request: ChangePasswordRequest
    ): ResponseEntity<MessageResponse> =
        ResponseEntity.ok(authService.changePassword(authentication.name, request))

    /**
     * Logs out the current user by invalidating their session/token on the client side.
     */
    @PostMapping("/logout")
    fun logout(): ResponseEntity<MessageResponse> =
        ResponseEntity.ok(MessageResponse("Logged out successfully. Remove the token on the client."))
}
