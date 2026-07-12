package kcg.edu.ehms.dto.setup

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size
import java.time.LocalDateTime

data class DepartmentRequest(
    @field:NotBlank(message = "Department name is required")
    @field:Size(max = 100, message = "Department name must not exceed 100 characters")
    val name: String = "",

    @field:NotBlank(message = "Description is required")
    @field:Size(max = 500, message = "Description must not exceed 500 characters")
    val description: String = ""
)

data class DepartmentResponse(val id: Long, val name: String, val description: String)

data class DoctorRequest(
    @field:NotBlank(message = "Doctor name is required")
    @field:Size(max = 150, message = "Doctor name must not exceed 150 characters")
    val fullName: String = "",

    @field:NotBlank(message = "Specialization is required")
    @field:Size(max = 150, message = "Specialization must not exceed 150 characters")
    val specialization: String = "",

    @field:NotBlank(message = "Contact number is required")
    @field:Pattern(regexp = "^[0-9+()\\-\\s]{7,25}$", message = "Contact number format is invalid")
    val contactNumber: String = "",

    val departmentIds: Set<Long> = emptySet()
)

data class DoctorResponse(
    val id: Long,
    val fullName: String,
    val specialization: String,
    val contactNumber: String,
    val departments: List<DepartmentResponse>
)

data class SystemSettingRequest(
    @field:NotBlank(message = "Setting key is required")
    @field:Size(max = 100, message = "Setting key must not exceed 100 characters")
    val settingKey: String = "",

    @field:NotBlank(message = "Setting value is required")
    @field:Size(max = 1000, message = "Setting value must not exceed 1000 characters")
    val settingValue: String = "",

    @field:Size(max = 300, message = "Description must not exceed 300 characters")
    val description: String? = null
)

data class SystemSettingResponse(
    val id: Long,
    val settingKey: String,
    val settingValue: String,
    val description: String?,
    val updatedAt: LocalDateTime
)
