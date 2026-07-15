package kcg.edu.ehms.dto.dashboard

data class GenderCount(
    val male: Long = 0,
    val female: Long = 0
) {
    val total: Long
        get() = male + female
}

data class MonthlyRegistrationResponse(
    val month: String,
    val count: Long
)

data class DashboardSummaryResponse(
    val totalPatients: Long,
    val paying: GenderCount,
    val insurance: GenderCount,
    val general: GenderCount,
    val monthlyRegistrations: List<MonthlyRegistrationResponse> = emptyList()
)
