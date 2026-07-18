package kcg.edu.ehms.repository

import kcg.edu.ehms.entity.Bill
import kcg.edu.ehms.entity.PaymentStatus
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.LocalDate

interface BillRepository : JpaRepository<Bill, Long> {
    fun findAllByVisitPatientIdOrderByBillDateDesc(patientId: Long): List<Bill>
    fun findAllByVisitIdOrderByBillDateDesc(visitId: Long): List<Bill>
    fun findAllByPaymentStatus(paymentStatus: PaymentStatus): List<Bill>

    @Query("select b from Bill b where b.paymentStatus = :status and b.billDate = :date")
    fun findByDateAndStatus(
        @Param("date") date: LocalDate,
        @Param("status") status: PaymentStatus
    ): List<Bill>

    @Query(
        """
        select b from Bill b
        where b.paymentStatus = :status
          and b.billDate between :startDate and :endDate
        """
    )
    fun findByDateRangeAndStatus(
        @Param("startDate") startDate: LocalDate,
        @Param("endDate") endDate: LocalDate,
        @Param("status") status: PaymentStatus
    ): List<Bill>

    fun countByPaymentStatus(status: PaymentStatus): Long
}
