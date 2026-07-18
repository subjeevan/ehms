package kcg.edu.ehms.dto.patient

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Past
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size
import kcg.edu.ehms.entity.Gender
import kcg.edu.ehms.entity.PatientType
import kcg.edu.ehms.entity.VisitPatientStatus
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

enum class PatientLookupType {
    PATIENT_ID,
    MRN,
    MOBILE,
    INSURANCE_NUMBER
}

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
    @field:Pattern(regexp = "^[0-9]{8,10}$", message = "Contact number must contain between 8 and 10 digits")
    val contactNumber: String = "",

    @field:NotBlank(message = "Address is required")
    @field:Size(max = 300, message = "Address must not exceed 300 characters")
    val address: String = ""
)

data class InsuranceDetailResponse(
    val id: Long,
    val provider: String,
    val policyNumber: String,
    val coverageAmount: BigDecimal,
    val expiryDate: LocalDate
)

data class AssignedDoctorResponse(
    val id: Long,
    val fullName: String,
    val specialization: String,
    val departments: List<String>
)

data class AssignedDepartmentResponse(
    val id: Long,
    val name: String
)

/**
 * Permanent patient data plus a summary of the latest visit.
 * Latest-visit fields are retained so existing patient list screens continue to work.
 */
data class PatientResponse(
    val id: Long,
    val medicalRecordNumber: String,
    val fullName: String,
    val gender: Gender,
    val dateOfBirth: LocalDate,
    val contactNumber: String,
    val address: String,
    val registeredAt: LocalDateTime,
    val updatedAt: LocalDateTime,
    val patientType: PatientType? = null,
    val latestVisitId: Long? = null,
    val latestVisitDate: LocalDate? = null,
    val patientStatus: VisitPatientStatus? = null,
    val department: AssignedDepartmentResponse? = null,
    val assignedDoctor: AssignedDoctorResponse? = null,
    val insuranceDetail: InsuranceDetailResponse? = null,
    val visitCount: Int = 0,
    val amountPaid: BigDecimal = BigDecimal.ZERO
)
