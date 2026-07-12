package kcg.edu.ehms.dto.auth

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size
import java.time.Instant

data class LoginRequest(
    @field:NotBlank(message = "Username is required")
    @field:Size(min = 3, max = 80, message = "Username must be between 3 and 80 characters")
    val username: String = "",

    @field:NotBlank(message = "Password is required")
    @field:Size(min = 6, max = 100, message = "Password must be at least 6 characters")
    val password: String = ""
)

data class LoginResponse(
    val token: String,
    val tokenType: String = "Bearer",
    val expiresAt: Instant,
    val username: String,
    val roles: List<String>
)

data class CurrentUserResponse(
    val id: Long,
    val username: String,
    val enabled: Boolean,
    val roles: List<String>
)

data class ChangePasswordRequest(
    @field:NotBlank(message = "Current password is required")
    val currentPassword: String = "",

    @field:NotBlank(message = "New password is required")
    @field:Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,64}$",
        message = "Password must be 8-64 characters and include uppercase, lowercase, number, and special character"
    )
    val newPassword: String = "",

    @field:NotBlank(message = "Password confirmation is required")
    val confirmNewPassword: String = ""
)

data class MessageResponse(val message: String)
