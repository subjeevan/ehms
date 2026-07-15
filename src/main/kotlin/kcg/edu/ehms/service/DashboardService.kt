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

    @Transactional(readOnly = true)
    fun summary(): DashboardSummaryResponse {
        val groupedCounts = patientRepository
            .countGroupedByTypeAndGender()
            .associate {
                (it.getPatientType() to it.getGender()) to it.getCount()
            }

        fun countFor(patientType: PatientType): GenderCount {
            return GenderCount(
                male = groupedCounts[patientType to Gender.MALE] ?: 0L,
                female = groupedCounts[patientType to Gender.FEMALE] ?: 0L
            )
        }

        return DashboardSummaryResponse(
            totalPatients = patientRepository.count(),
            paying = countFor(PatientType.PAYING),
            insurance = countFor(PatientType.INSURANCE),
            general = countFor(PatientType.GENERAL),
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

    private fun calculateEarnings(
        bills: List<Bill>
    ): List<EarningsByPatientType> {
        return bills
            .groupBy { it.patient?.patientType }
            .map { (patientType, patientBills) ->
                EarningsByPatientType(
                    patientType = patientType?.name ?: "UNKNOWN",
                    amount = patientBills.fold(BigDecimal.ZERO) { total, bill ->
                        total + bill.amount
                    }
                )
            }
            .sortedBy { it.patientType }
    }

    private fun sumEarnings(
        earnings: List<EarningsByPatientType>
    ): BigDecimal {
        return earnings.fold(BigDecimal.ZERO) { total, earning ->
            total + earning.amount
        }
    }
}
