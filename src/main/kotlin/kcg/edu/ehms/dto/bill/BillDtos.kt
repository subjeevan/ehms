package kcg.edu.ehms.dto.bill

import kcg.edu.ehms.entity.PaymentStatus
import jakarta.validation.constraints.DecimalMin
import jakarta.validation.constraints.NotNull
import java.math.BigDecimal
import java.time.LocalDate

data class BillRequest(
    @field:NotNull(message = "Amount is required")
    @field:DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    val amount: BigDecimal? = null,

    @field:NotNull(message = "Bill date is required")
    val billDate: LocalDate? = null,

    @field:NotNull(message = "Payment status is required")
    val paymentStatus: PaymentStatus? = null
)

data class BillResponse(
    val id: Long,
    val patientId: Long,
    val patientName: String,
    val amount: BigDecimal,
    val billDate: LocalDate,
    val paymentStatus: PaymentStatus
)
