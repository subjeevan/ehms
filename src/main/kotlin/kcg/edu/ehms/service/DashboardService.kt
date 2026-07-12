package kcg.edu.ehms.service

import kcg.edu.ehms.dto.dashboard.*
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
        val grouped = patientRepository.countGroupedByTypeAndGender()
            .associate { (it.getPatientType() to it.getGender()) to it.getCount() }

        fun counts(type: PatientType) = GenderCount(
            male = grouped[type to Gender.MALE] ?: 0,
            female = grouped[type to Gender.FEMALE] ?: 0
        )

        val paying = counts(PatientType.PAYING)
        val insurance = counts(PatientType.INSURANCE)
        val general = counts(PatientType.GENERAL)
        return DashboardSummaryResponse(
            totalPatients = paying.total + insurance.total + general.total,
            paying = paying,
            insurance = insurance,
            general = general
        )
    }

    @Transactional(readOnly = true)
    fun earningsOverview(): EarningsOverviewResponse {
        val today = LocalDate.now()
        val monthStart = today.withDayOfMonth(1)
        
        val dailyEarnings = calculateDailyEarnings(today)
        val monthlyEarnings = calculateMonthlyEarnings(monthStart, today)
        val totalEarnings = calculateTotalEarnings()

        return EarningsOverviewResponse(
            today = dailyEarnings,
            thisMonth = monthlyEarnings,
            total = totalEarnings
        )
    }

    private fun calculateDailyEarnings(date: LocalDate): DailyEarningsResponse {
        val bills = billRepository.findByDateAndStatus(date, PaymentStatus.PAID)
        val earnings = bills
            .groupBy { it.patient?.patientType }
            .map { (type, bills) ->
                EarningsByPatientType(
                    patientType = type?.name ?: "UNKNOWN",
                    amount = bills.fold(BigDecimal.ZERO) { acc, bill -> acc + bill.amount }
                )
            }
            .sortedBy { it.patientType }

        val total = earnings.fold(BigDecimal.ZERO) { acc, earning -> acc + earning.amount }

        return DailyEarningsResponse(
            date = date,
            earnings = earnings,
            total = total
        )
    }

    private fun calculateMonthlyEarnings(monthStart: LocalDate, today: LocalDate): MonthlyEarningsResponse {
        val monthEnd = today
        val bills = billRepository.findByDateRangeAndStatus(monthStart, monthEnd, PaymentStatus.PAID)
        
        val earnings = bills
            .groupBy { it.patient?.patientType }
            .map { (type, bills) ->
                EarningsByPatientType(
                    patientType = type?.name ?: "UNKNOWN",
                    amount = bills.fold(BigDecimal.ZERO) { acc, bill -> acc + bill.amount }
                )
            }
            .sortedBy { it.patientType }

        val total = earnings.fold(BigDecimal.ZERO) { acc, earning -> acc + earning.amount }

        return MonthlyEarningsResponse(
            month = YearMonth.from(today).toString(),
            earnings = earnings,
            total = total
        )
    }

    private fun calculateTotalEarnings(): TotalEarningsResponse {
        val allBills = billRepository.findAll()
        
        val earnings = allBills
            .filter { it.paymentStatus == PaymentStatus.PAID }
            .groupBy { it.patient?.patientType }
            .map { (type, bills) ->
                EarningsByPatientType(
                    patientType = type?.name ?: "UNKNOWN",
                    amount = bills.fold(BigDecimal.ZERO) { acc, bill -> acc + bill.amount }
                )
            }
            .sortedBy { it.patientType }

        val paidCount = billRepository.countByPaymentStatus(PaymentStatus.PAID)
        val pendingCount = billRepository.countByPaymentStatus(PaymentStatus.PENDING)
        val total = earnings.fold(BigDecimal.ZERO) { acc, earning -> acc + earning.amount }

        return TotalEarningsResponse(
            earnings = earnings,
            total = total,
            paidCount = paidCount,
            pendingCount = pendingCount
        )
    }
}

