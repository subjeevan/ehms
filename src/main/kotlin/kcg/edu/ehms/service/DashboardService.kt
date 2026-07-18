package kcg.edu.ehms.service

import kcg.edu.ehms.dto.dashboard.*
import kcg.edu.ehms.entity.*
import kcg.edu.ehms.repository.BillRepository
import kcg.edu.ehms.repository.PatientRepository
import kcg.edu.ehms.repository.PatientVisitRepository
import kcg.edu.ehms.repository.VisitStatusCountProjection
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.LocalDate
import java.time.YearMonth

@Service
class DashboardService(
    private val patientRepository: PatientRepository,
    private val patientVisitRepository: PatientVisitRepository,
    private val billRepository: BillRepository
) {
    private val dashboardPatientTypes = listOf(
        PatientType.GENERAL,
        PatientType.PAYING,
        PatientType.INSURANCE
    )

    @Transactional(readOnly = true)
    fun summary(): DashboardSummaryResponse {
        val allTimeRows = patientVisitRepository.countGroupedByTypeStatusAndGender()
        val allTimeCounts = toCountMap(allTimeRows)

        val today = LocalDate.now()
        val todayRows = patientVisitRepository.countGroupedByTypeStatusAndGenderBetween(
            today,
            today.plusDays(1)
        )
        val todayCounts = toCountMap(todayRows)

        val totalRegistrations = allTimeRows.sumOf { it.getCount() }
        val newRegistrations = allTimeRows
            .filter { it.getPatientStatus() == VisitPatientStatus.NEW }
            .sumOf { it.getCount() }
        val returningRegistrations = allTimeRows
            .filter { it.getPatientStatus() == VisitPatientStatus.RETURNING }
            .sumOf { it.getCount() }

        val todayNewPatients = todayRows
            .filter { it.getPatientStatus() == VisitPatientStatus.NEW }
            .sumOf { it.getCount() }
        val todayReturningPatients = todayRows
            .filter { it.getPatientStatus() == VisitPatientStatus.RETURNING }
            .sumOf { it.getCount() }

        return DashboardSummaryResponse(
            totalPatients = patientRepository.count(),
            totalRegistrations = totalRegistrations,
            newRegistrations = newRegistrations,
            returningRegistrations = returningRegistrations,
            paying = countForType(allTimeCounts, PatientType.PAYING),
            insurance = countForType(allTimeCounts, PatientType.INSURANCE),
            general = countForType(allTimeCounts, PatientType.GENERAL),
            todayPatients = todayNewPatients + todayReturningPatients,
            todayNewPatients = todayNewPatients,
            todayReturningPatients = todayReturningPatients,
            todayPaying = statusCountForType(todayCounts, PatientType.PAYING),
            todayInsurance = statusCountForType(todayCounts, PatientType.INSURANCE),
            todayGeneral = statusCountForType(todayCounts, PatientType.GENERAL),
            monthlyRegistrations = calculateMonthlyRegistrations()
        )
    }

    @Transactional(readOnly = true)
    fun earningsOverview(): EarningsOverviewResponse {
        val today = LocalDate.now()
        val monthStart = today.withDayOfMonth(1)
        return EarningsOverviewResponse(
            today = calculateDailyEarnings(today),
            thisMonth = calculateMonthlyEarnings(monthStart, today),
            total = calculateTotalEarnings()
        )
    }

    private fun toCountMap(
        rows: List<VisitStatusCountProjection>
    ): Map<Triple<PatientType, VisitPatientStatus, Gender>, Long> =
        rows.associate {
            Triple(it.getPatientType(), it.getPatientStatus(), it.getGender()) to it.getCount()
        }

    private fun genderCount(
        groupedCounts: Map<Triple<PatientType, VisitPatientStatus, Gender>, Long>,
        type: PatientType,
        status: VisitPatientStatus
    ) = GenderCount(
        male = groupedCounts[Triple(type, status, Gender.MALE)] ?: 0L,
        female = groupedCounts[Triple(type, status, Gender.FEMALE)] ?: 0L
    )

    private fun statusCountForType(
        groupedCounts: Map<Triple<PatientType, VisitPatientStatus, Gender>, Long>,
        type: PatientType
    ) = VisitStatusGenderCount(
        newPatients = genderCount(groupedCounts, type, VisitPatientStatus.NEW),
        returningPatients = genderCount(groupedCounts, type, VisitPatientStatus.RETURNING)
    )

    private fun countForType(
        groupedCounts: Map<Triple<PatientType, VisitPatientStatus, Gender>, Long>,
        type: PatientType
    ): GenderCount {
        val statusCounts = statusCountForType(groupedCounts, type)
        return GenderCount(
            male = statusCounts.newPatients.male + statusCounts.returningPatients.male,
            female = statusCounts.newPatients.female + statusCounts.returningPatients.female
        )
    }

    private fun calculateMonthlyRegistrations(): List<MonthlyRegistrationResponse> {
        val currentMonth = YearMonth.now()
        val firstMonth = currentMonth.minusMonths(11)
        val startDate = firstMonth.atDay(1)
        val endDate = currentMonth.plusMonths(1).atDay(1)
        val countsByMonth = patientVisitRepository
            .findAllByVisitDateGreaterThanEqualAndVisitDateLessThan(startDate, endDate)
            .groupingBy { YearMonth.from(it.visitDate) }
            .eachCount()

        return (0L..11L).map { offset ->
            val month = firstMonth.plusMonths(offset)
            MonthlyRegistrationResponse(month.toString(), countsByMonth[month]?.toLong() ?: 0L)
        }
    }

    private fun calculateDailyEarnings(date: LocalDate): DailyEarningsResponse {
        val earnings = calculateEarnings(billRepository.findByDateAndStatus(date, PaymentStatus.PAID))
        return DailyEarningsResponse(date, earnings, sumEarnings(earnings))
    }

    private fun calculateMonthlyEarnings(start: LocalDate, today: LocalDate): MonthlyEarningsResponse {
        val earnings = calculateEarnings(
            billRepository.findByDateRangeAndStatus(start, today, PaymentStatus.PAID)
        )
        return MonthlyEarningsResponse(YearMonth.from(today).toString(), earnings, sumEarnings(earnings))
    }

    private fun calculateTotalEarnings(): TotalEarningsResponse {
        val earnings = calculateEarnings(billRepository.findAllByPaymentStatus(PaymentStatus.PAID))
        return TotalEarningsResponse(
            earnings = earnings,
            total = sumEarnings(earnings),
            paidCount = billRepository.countByPaymentStatus(PaymentStatus.PAID),
            pendingCount = billRepository.countByPaymentStatus(PaymentStatus.PENDING)
        )
    }

    private fun calculateEarnings(bills: List<Bill>): List<EarningsByPatientType> {
        val totals = bills.groupBy { it.visit?.patientType }.mapValues { (_, values) ->
            values.fold(BigDecimal.ZERO) { total, bill -> total + bill.amount }
        }
        return dashboardPatientTypes.map {
            EarningsByPatientType(it.name, totals[it] ?: BigDecimal.ZERO)
        }
    }

    private fun sumEarnings(earnings: List<EarningsByPatientType>) =
        earnings.fold(BigDecimal.ZERO) { total, item -> total + item.amount }
}
