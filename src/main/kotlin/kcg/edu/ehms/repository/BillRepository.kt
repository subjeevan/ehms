package kcg.edu.ehms.repository

import kcg.edu.ehms.entity.Bill
import kcg.edu.ehms.entity.PaymentStatus
import kcg.edu.ehms.entity.PatientType
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.LocalDate
import java.math.BigDecimal

/**
 * Repository for Bill entity.
 * Provides database access methods for billing-related operations.
 */
interface BillRepository : JpaRepository<Bill, Long> {
    /**
     * Retrieves all bills for a specific patient, ordered by bill date in descending order (newest first).
     */
    fun findAllByPatientIdOrderByBillDateDesc(patientId: Long): List<Bill>

    /**
     * Retrieves all bills with PAID status.
     */
    fun findAllByPaymentStatus(paymentStatus: PaymentStatus): List<Bill>

    /**
     * Retrieves all paid bills for a specific date.
     */
    @Query("SELECT b FROM Bill b WHERE b.paymentStatus = :status AND DATE(b.billDate) = :date")
    fun findByDateAndStatus(@Param("date") date: LocalDate, @Param("status") status: PaymentStatus): List<Bill>

    /**
     * Retrieves paid bills for a date range.
     */
    @Query("SELECT b FROM Bill b WHERE b.paymentStatus = :status AND DATE(b.billDate) BETWEEN :startDate AND :endDate")
    fun findByDateRangeAndStatus(
        @Param("startDate") startDate: LocalDate,
        @Param("endDate") endDate: LocalDate,
        @Param("status") status: PaymentStatus
    ): List<Bill>

    /**
     * Count paid and pending bills.
     */
    fun countByPaymentStatus(status: PaymentStatus): Long
}

