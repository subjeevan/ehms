package kcg.edu.ehms.dto.dashboard

data class GenderCount(
    val male: Long = 0,
    val female: Long = 0
) {
    val total: Long
        get() = male + female
}

/** New and returning/follow-up counts for one patient type. */
data class VisitStatusGenderCount(
    val newPatients: GenderCount = GenderCount(),
    val returningPatients: GenderCount = GenderCount()
) {
    val total: Long
        get() = newPatients.total + returningPatients.total
}

data class MonthlyRegistrationResponse(
    val month: String,
    val count: Long
)

data class DashboardSummaryResponse(
    /** Unique permanent patient records. */
    val totalPatients: Long,

    /** All visit registrations, including first visits and follow-up visits. */
    val totalRegistrations: Long,
    val newRegistrations: Long,
    val returningRegistrations: Long,

    /** All-time gender totals by patient type, retained for API compatibility. */
    val paying: GenderCount,
    val insurance: GenderCount,
    val general: GenderCount,

    /** Today's total and New/Follow-up totals. */
    val todayPatients: Long,
    val todayNewPatients: Long,
    val todayReturningPatients: Long,

    /** Today's patient-type breakdown by New/Follow-up and gender. */
    val todayPaying: VisitStatusGenderCount,
    val todayInsurance: VisitStatusGenderCount,
    val todayGeneral: VisitStatusGenderCount,

    /** Last 12 months visit-registration trend. */
    val monthlyRegistrations: List<MonthlyRegistrationResponse> = emptyList()
)
