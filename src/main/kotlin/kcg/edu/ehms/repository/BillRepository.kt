package kcg.edu.ehms.repository

import kcg.edu.ehms.entity.Bill
import org.springframework.data.jpa.repository.JpaRepository

interface BillRepository : JpaRepository<Bill, Long> {
    fun findAllByPatientIdOrderByBillDateDesc(patientId: Long): List<Bill>
}
