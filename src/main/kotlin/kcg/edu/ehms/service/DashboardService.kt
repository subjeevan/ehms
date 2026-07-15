package kcg.edu.ehms.service

import kcg.edu.ehms.dto.dashboard.DailyEarningsResponse
import kcg.edu.ehms.dto.dashboard.DashboardSummaryResponse
import kcg.edu.ehms.dto.dashboard.EarningsByPatientType
import kcg.edu.ehms.dto.dashboard.EarningsOverviewResponse
import kcg.edu.ehms.dto.dashboard.GenderCount
import kcg.edu.ehms.dto.dashboard.MonthlyEarningsResponse
import kcg.edu.ehms.dto.dashboard.MonthlyRegistrationResponse
import kcg.edu.ehms.dto.dashboard.TotalEarningsResponse
import kcg.edu.ehms.entity.Bill
import kcg.edu.ehms.entity.Gender
import kcg.edu.ehms.entity.PatientType
import kcg.edu.ehms.entity.PaymentStatus
import kcg.edu.ehms.repository.BillRepository
import kcg.edu.ehms.repository.PatientCountProjection
import kcg.edu.ehms.repository.PatientRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.LocalDate
import java.time.YearMonth

@Service
class DashboardService(
    private val patientRepository: PatientRepository,
    private val billRepository: BillRepository
) {

    private val dashboardPatientTypes = listOf(
        PatientType.GENERAL,
        PatientType.PAYING,
        PatientType.INSURANCE
    )

    @Transactional(readOnly = true)
    fun summary(): DashboardSummaryResponse {
        val allTimeCounts = toCountMap(
            patientRepository.countGroupedByTypeAndGender()
        )

        val today = LocalDate.now()
        val todayStart = today.atStartOfDay()
        val tomorrowStart = today.plusDays(1).atStartOfDay()

        val todayCounts = toCountMap(
            patientRepository.countGroupedByTypeAndGenderBetween(
                todayStart,
                tomorrowStart
            )
        )

        val paying = countFor(allTimeCounts, PatientType.PAYING)
        val insurance = countFor(allTimeCounts, PatientType.INSURANCE)
        val general = countFor(allTimeCounts, PatientType.GENERAL)

        val todayPaying = countFor(todayCounts, PatientType.PAYING)
        val todayInsurance = countFor(todayCounts, PatientType.INSURANCE)
        val todayGeneral = countFor(todayCounts, PatientType.GENERAL)

        return DashboardSummaryResponse(
            totalPatients = patientRepository.count(),
            paying = paying,
            insurance = insurance,
            general = general,
            todayPatients =
                todayPaying.total + todayInsurance.total + todayGeneral.total,
            todayPaying = todayPaying,
            todayInsurance = todayInsurance,
            todayGeneral = todayGeneral,
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
        rows: List<PatientCountProjection>
    ): Map<Pair<PatientType, Gender>, Long> {
        return rows.associate {
            (it.getPatientType() to it.getGender()) to it.getCount()
        }
    }

    private fun countFor(
        groupedCounts: Map<Pair<PatientType, Gender>, Long>,
        patientType: PatientType
    ): GenderCount {
        return GenderCount(
            male = groupedCounts[patientType to Gender.MALE] ?: 0L,
            female = groupedCounts[patientType to Gender.FEMALE] ?: 0L
        )
    }

    private fun calculateMonthlyRegistrations(): List<MonthlyRegistrationResponse> {
        val currentMonth = YearMonth.now()
        val firstMonth = currentMonth.minusMonths(11)

        val startDateTime = firstMonth
            .atDay(1)
            .atStartOfDay()

        val endDateTime = currentMonth
            .plusMonths(1)
            .atDay(1)
            .atStartOfDay()

        val countsByMonth = patientRepository
            .findAllByRegisteredAtGreaterThanEqualAndRegisteredAtLessThan(
                startDateTime,
                endDateTime
            )
            .groupingBy { YearMonth.from(it.registeredAt) }
            .eachCount()

        return (0L..11L).map { offset ->
            val month = firstMonth.plusMonths(offset)

            MonthlyRegistrationResponse(
                month = month.toString(),
                count = countsByMonth[month]?.toLong() ?: 0L
            )
        }
    }

    private fun calculateDailyEarnings(
        date: LocalDate
    ): DailyEarningsResponse {
        val earnings = calculateEarnings(
            billRepository.findByDateAndStatus(
                date,
                PaymentStatus.PAID
            )
        )

        return DailyEarningsResponse(
            date = date,
            earnings = earnings,
            total = sumEarnings(earnings)
        )
    }

    private fun calculateMonthlyEarnings(
        monthStart: LocalDate,
        today: LocalDate
    ): MonthlyEarningsResponse {
        val earnings = calculateEarnings(
            billRepository.findByDateRangeAndStatus(
                monthStart,
                today,
                PaymentStatus.PAID
            )
        )

        return MonthlyEarningsResponse(
            month = YearMonth.from(today).toString(),
            earnings = earnings,
            total = sumEarnings(earnings)
        )
    }

    private fun calculateTotalEarnings(): TotalEarningsResponse {
        val earnings = calculateEarnings(
            billRepository.findAllByPaymentStatus(PaymentStatus.PAID)
        )

        return TotalEarningsResponse(
            earnings = earnings,
            total = sumEarnings(earnings),
            paidCount = billRepository.countByPaymentStatus(PaymentStatus.PAID),
            pendingCount = billRepository.countByPaymentStatus(PaymentStatus.PENDING)
        )
    }

    /**
     * Always returns GENERAL, PAYING and INSURANCE rows.
     * A missing patient type is returned with amount 0.
     */
    private fun calculateEarnings(
        bills: List<Bill>
    ): List<EarningsByPatientType> {
        val totalsByType = bills
            .groupBy { it.patient?.patientType }
            .mapValues { (_, patientBills) ->
                patientBills.fold(BigDecimal.ZERO) { total, bill ->
                    total + bill.amount
                }
            }

        return dashboardPatientTypes.map { patientType ->
            EarningsByPatientType(
                patientType = patientType.name,
                amount = totalsByType[patientType] ?: BigDecimal.ZERO
            )
        }
    }

    private fun sumEarnings(
        earnings: List<EarningsByPatientType>
    ): BigDecimal {
        return earnings.fold(BigDecimal.ZERO) { total, earning ->
            total + earning.amount
        }
    }
}
