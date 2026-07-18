package kcg.edu.ehms.dto.visit

import jakarta.validation.Valid
import jakarta.validation.constraints.DecimalMin
import jakarta.validation.constraints.Future
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Positive
import jakarta.validation.constraints.Size
import kcg.edu.ehms.dto.patient.AssignedDepartmentResponse
import kcg.edu.ehms.dto.patient.AssignedDoctorResponse
import kcg.edu.ehms.dto.patient.InsuranceDetailResponse
import kcg.edu.ehms.dto.patient.PatientRequest
import kcg.edu.ehms.entity.Gender
import kcg.edu.ehms.entity.PatientType
import kcg.edu.ehms.entity.VisitPatientStatus
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

data class InsuranceVisitRequest(
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

data class VisitRegistrationRequest(
    @field:NotNull(message = "Patient type is required")
    val patientType: PatientType? = null,

    @field:NotNull(message = "Department is required")
    @field:Positive(message = "Select a valid department")
    val departmentId: Long? = null,

    @field:NotNull(message = "Doctor is required")
    @field:Positive(message = "Select a valid doctor")
    val doctorId: Long? = null,

    @field:Size(max = 500, message = "Reason for visit must not exceed 500 characters")
    val reasonForVisit: String? = null,

    @field:Valid
    val insuranceDetail: InsuranceVisitRequest? = null
)

data class NewPatientRegistrationRequest(
    @field:NotNull(message = "Patient information is required")
    @field:Valid
    val patient: PatientRequest? = null,

    @field:NotNull(message = "Visit information is required")
    @field:Valid
    val visit: VisitRegistrationRequest? = null
)

data class ReturningPatientRegistrationRequest(
    @field:NotBlank(message = "Medical record number is required")
    @field:Size(max = 30, message = "Medical record number must not exceed 30 characters")
    val medicalRecordNumber: String = "",

    @field:NotNull(message = "Visit information is required")
    @field:Valid
    val visit: VisitRegistrationRequest? = null
)

data class VisitResponse(
    val id: Long,
    val patientId: Long,
    val medicalRecordNumber: String,
    val patientName: String,
    val visitDate: LocalDate,
    val patientStatus: VisitPatientStatus,
    val patientType: PatientType,
    val department: AssignedDepartmentResponse,
    val doctor: AssignedDoctorResponse,
    val reasonForVisit: String?,
    val insuranceDetail: InsuranceDetailResponse?,
    val createdBy: String,
    val createdAt: LocalDateTime
)

/**
 * One row in the visit-based Patient List and Excel confirmation export.
 * Permanent patient information is repeated intentionally so each exported row
 * is self-contained and can be checked against that specific visit.
 */
data class PatientVisitListResponse(
    val visitId: Long,
    val patientId: Long,
    val medicalRecordNumber: String,
    val fullName: String,
    val gender: Gender,
    val dateOfBirth: LocalDate,
    val contactNumber: String,
    val address: String,
    val visitDate: LocalDate,
    val patientStatus: VisitPatientStatus,
    val patientType: PatientType,
    val departmentName: String,
    val doctorName: String,
    val reasonForVisit: String?,
    val insuranceProvider: String?,
    val insuranceNumber: String?,
    val registeredBy: String,
    val registeredAt: LocalDateTime,
    val billIds: List<Long>,
    val billedAmount: BigDecimal,
    val paidAmount: BigDecimal,
    val billingStatus: String
)
