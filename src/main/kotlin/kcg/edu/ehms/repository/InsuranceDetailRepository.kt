package kcg.edu.ehms.repository

import kcg.edu.ehms.entity.InsuranceDetail
import org.springframework.data.jpa.repository.JpaRepository

/**
 * Repository for InsuranceDetail entity.
 * Provides database access methods for insurance-related operations.
 */
interface InsuranceDetailRepository : JpaRepository<InsuranceDetail, Long> {
    /**
     * Checks if an insurance policy with the given policy number exists.
     */
    fun existsByPolicyNumber(policyNumber: String): Boolean

    /**
     * Checks if an insurance policy with the given policy number exists excluding the specified policy ID.
     * Used for validating unique policy numbers during updates.
     */
    fun existsByPolicyNumberAndIdNot(policyNumber: String, id: Long): Boolean
}
