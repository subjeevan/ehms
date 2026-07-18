package kcg.edu.ehms.entity

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDate

/** Insurance information recorded for an insurance visit. */
@Entity
@Table(name = "insurance_details")
class InsuranceDetail(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @Column(nullable = false, length = 120)
    var provider: String = "",

    @Column(nullable = false, length = 100)
    var policyNumber: String = "",

    @Column(nullable = false, precision = 12, scale = 2)
    var coverageAmount: BigDecimal = BigDecimal.ZERO,

    @Column(nullable = false)
    var expiryDate: LocalDate = LocalDate.now()
)
