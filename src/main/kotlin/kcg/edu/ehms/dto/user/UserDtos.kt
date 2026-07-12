package kcg.edu.ehms.dto.user

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size
import java.time.LocalDateTime

data class CreateUserRequest(
    @field:NotBlank(message = "Username is required")
    @field:Size(min = 3, max = 80, message = "Username must be between 3 and 80 characters")
    val username: String = "",

    @field:NotBlank(message = "Password is required")
    @field:Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,64}$",
        message = "Password must be 8-64 characters and include uppercase, lowercase, number, and special character"
    )
    val password: String = "",

    val roles: Set<String> = setOf("ROLE_USER")
)

data class UserResponse(
    val id: Long,
    val username: String,
    val enabled: Boolean,
    val createdAt: LocalDateTime,
    val roles: List<String>
)

data class UserStatusRequest(val enabled: Boolean)
