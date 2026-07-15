package kcg.edu.ehms.dto.user

import jakarta.validation.constraints.*
import kcg.edu.ehms.entity.Gender
import java.time.LocalDate
import java.time.LocalDateTime

data class CreateUserRequest(
    @field:NotBlank(message = "First name is required")
    @field:Size(min = 2, max = 80, message = "First name must be between 2 and 80 characters")
    val firstName: String = "",

    @field:NotBlank(message = "Last name is required")
    @field:Size(min = 1, max = 80, message = "Last name must be between 1 and 80 characters")
    val lastName: String = "",

    @field:NotBlank(message = "Contact number is required")
    @field:Pattern(
        regexp = "^[0-9]{8,10}$",
        message = "Contact number must contain between 8 and 10 digits"
    )
    val contactNumber: String = "",

    @field:NotNull(message = "Gender is required")
    val gender: Gender? = null,

    @field:NotNull(message = "Date of birth is required")
    @field:Past(message = "Date of birth must be in the past")
    val dateOfBirth: LocalDate? = null,

    @field:NotNull(message = "Department is required")
    @field:Positive(message = "Select a valid department")
    val departmentId: Long? = null,

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

data class UserDepartmentResponse(
    val id: Long,
    val name: String
)

data class UserResponse(
    val id: Long,
    val username: String,
    val firstName: String?,
    val lastName: String?,
    val contactNumber: String?,
    val gender: Gender?,
    val dateOfBirth: LocalDate?,
    val department: UserDepartmentResponse?,
    val enabled: Boolean,
    val createdAt: LocalDateTime,
    val roles: List<String>
)

data class UserStatusRequest(val enabled: Boolean)
