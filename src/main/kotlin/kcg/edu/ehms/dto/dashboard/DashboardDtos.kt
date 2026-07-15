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

    // All-time patient counts. Kept for API compatibility.
    val paying: GenderCount,
    val insurance: GenderCount,
    val general: GenderCount,

    // Patients registered today.
    val todayPatients: Long,
    val todayPaying: GenderCount,
    val todayInsurance: GenderCount,
    val todayGeneral: GenderCount,

    // Last 12 months registration trend.
    val monthlyRegistrations: List<MonthlyRegistrationResponse> = emptyList()
)
