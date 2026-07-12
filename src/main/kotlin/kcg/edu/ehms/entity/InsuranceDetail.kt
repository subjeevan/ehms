package kcg.edu.ehms.entity

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDate

/**
 * InsuranceDetail entity storing patient insurance information.
 * Maintains one-to-one relationship with Patient entity.
 */
@Entity
@Table(name = "insurance_details")
class InsuranceDetail(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @Column(nullable = false, length = 120)
    var provider: String = "",

    @Column(nullable = false, unique = true, length = 100)
    var policyNumber: String = "",

    @Column(nullable = false, precision = 12, scale = 2)
    var coverageAmount: BigDecimal = BigDecimal.ZERO,

    @Column(nullable = false)
    var expiryDate: LocalDate = LocalDate.now()
)
