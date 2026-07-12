package kcg.edu.ehms.dto.dashboard

data class GenderCount(val male: Long = 0, val female: Long = 0) {
    val total: Long get() = male + female
}

data class DashboardSummaryResponse(
    val totalPatients: Long,
    val paying: GenderCount,
    val insurance: GenderCount,
    val general: GenderCount
)
