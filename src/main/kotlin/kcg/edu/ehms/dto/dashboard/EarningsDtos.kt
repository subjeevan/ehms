package kcg.edu.ehms.dto.dashboard

import java.math.BigDecimal
import java.time.LocalDate

data class EarningsByPatientType(
    val patientType: String,
    val amount: BigDecimal
)

data class DailyEarningsResponse(
    val date: LocalDate,
    val earnings: List<EarningsByPatientType>,
    val total: BigDecimal
)

data class MonthlyEarningsResponse(
    val month: String, // "2026-07"
    val earnings: List<EarningsByPatientType>,
    val total: BigDecimal
)

data class TotalEarningsResponse(
    val earnings: List<EarningsByPatientType>,
    val total: BigDecimal,
    val paidCount: Long,
    val pendingCount: Long
)

data class EarningsOverviewResponse(
    val today: DailyEarningsResponse,
    val thisMonth: MonthlyEarningsResponse,
    val total: TotalEarningsResponse
)
