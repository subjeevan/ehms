package kcg.edu.ehms.dto.charge

import kcg.edu.ehms.entity.PatientType
import kcg.edu.ehms.dto.bill.BillResponse
import kcg.edu.ehms.dto.patient.PatientResponse
import jakarta.validation.constraints.DecimalMin
import jakarta.validation.constraints.NotNull
import java.math.BigDecimal

data class PatientTypeChargeResponse(
    val id: Long,
    val patientType: PatientType,
    val amount: BigDecimal,
    val enabled: Boolean
)

data class UpdatePatientTypeChargeRequest(
    @field:NotNull(message = "Charge amount is required")
    @field:DecimalMin(
        value = "0.00",
        inclusive = true,
        message = "Charge amount cannot be negative"
    )
    val amount: BigDecimal?,

    val enabled: Boolean = true
)

data class PatientRegistrationResponse(
    val patient: PatientResponse,
    val bill: BillResponse?,
    val message: String
)
