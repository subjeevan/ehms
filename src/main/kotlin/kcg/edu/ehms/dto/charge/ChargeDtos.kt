package kcg.edu.ehms.dto.charge

import jakarta.validation.constraints.DecimalMin
import jakarta.validation.constraints.NotNull
import kcg.edu.ehms.dto.bill.BillResponse
import kcg.edu.ehms.dto.patient.PatientResponse
import kcg.edu.ehms.dto.visit.VisitResponse
import kcg.edu.ehms.entity.PatientType
import java.math.BigDecimal

data class PatientTypeChargeResponse(
    val id: Long,
    val patientType: PatientType,
    val amount: BigDecimal,
    val enabled: Boolean
)

data class UpdatePatientTypeChargeRequest(
    @field:NotNull(message = "Charge amount is required")
    @field:DecimalMin(value = "0.00", inclusive = true, message = "Charge amount cannot be negative")
    val amount: BigDecimal?,
    val enabled: Boolean = true
)

data class PatientRegistrationResponse(
    val patient: PatientResponse,
    val visit: VisitResponse,
    val bill: BillResponse?,
    val message: String
)
