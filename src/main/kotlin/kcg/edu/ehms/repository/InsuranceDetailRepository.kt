package kcg.edu.ehms.repository

import kcg.edu.ehms.entity.InsuranceDetail
import org.springframework.data.jpa.repository.JpaRepository

interface InsuranceDetailRepository : JpaRepository<InsuranceDetail, Long> {
    fun existsByPolicyNumber(policyNumber: String): Boolean
    fun existsByPolicyNumberAndIdNot(policyNumber: String, id: Long): Boolean
}
