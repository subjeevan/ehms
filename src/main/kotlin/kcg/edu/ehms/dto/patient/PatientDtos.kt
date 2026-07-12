package kcg.edu.ehms.dto.patient

import kcg.edu.ehms.entity.Gender
import kcg.edu.ehms.entity.PatientType
import jakarta.validation.Valid
import jakarta.validation.constraints.*
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

data class InsuranceDetailRequest(
    @field:NotBlank(message = "Insurance provider is required")
    @field:Size(max = 120, message = "Provider must not exceed 120 characters")
    val provider: String = "",

    @field:NotBlank(message = "Policy number is required")
    @field:Size(max = 100, message = "Policy number must not exceed 100 characters")
    val policyNumber: String = "",

    @field:NotNull(message = "Coverage amount is required")
    @field:DecimalMin(value = "0.01", message = "Coverage amount must be greater than zero")
    val coverageAmount: BigDecimal? = null,

    @field:NotNull(message = "Expiry date is required")
    @field:Future(message = "Insurance expiry date must be in the future")
    val expiryDate: LocalDate? = null
)

data class PatientRequest(
    @field:NotBlank(message = "Full name is required")
    @field:Size(min = 2, max = 150, message = "Full name must be between 2 and 150 characters")
    val fullName: String = "",

    @field:NotNull(message = "Gender is required")
    val gender: Gender? = null,

    @field:NotNull(message = "Date of birth is required")
    @field:Past(message = "Date of birth must be in the past")
    val dateOfBirth: LocalDate? = null,

    @field:NotBlank(message = "Contact number is required")
    @field:Pattern(regexp = "^[0-9+()\\-\\s]{7,25}$", message = "Contact number format is invalid")
    val contactNumber: String = "",

    @field:NotBlank(message = "Address is required")
    @field:Size(max = 300, message = "Address must not exceed 300 characters")
    val address: String = "",

    @field:NotNull(message = "Patient type is required")
    val patientType: PatientType? = null,

    @field:Valid
    val insuranceDetail: InsuranceDetailRequest? = null
)

data class InsuranceDetailResponse(
    val id: Long,
    val provider: String,
    val policyNumber: String,
    val coverageAmount: BigDecimal,
    val expiryDate: LocalDate
)

data class PatientResponse(
    val id: Long,
    val fullName: String,
    val gender: Gender,
    val dateOfBirth: LocalDate,
    val contactNumber: String,
    val address: String,
    val patientType: PatientType,
    val registeredAt: LocalDateTime,
    val insuranceDetail: InsuranceDetailResponse?
)
