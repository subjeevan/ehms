package kcg.edu.ehms.entity

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDate

/**
 * Bill entity representing a patient billing record in the EHMS system.
 * Stores billing information including amount, date, payment status, bill type and description for each patient.
 */
@Entity
@Table(name = "bills", indexes = [Index(name = "idx_bill_patient", columnList = "patient_id")])
class Bill(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    var patient: Patient? = null,

    @Column(nullable = false, precision = 12, scale = 2)
    var amount: BigDecimal = BigDecimal.ZERO,

    @Column(name = "bill_date", nullable = false)
    var billDate: LocalDate = LocalDate.now(),

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 20)
    var paymentStatus: PaymentStatus = PaymentStatus.PENDING,

    @Enumerated(EnumType.STRING)
    @Column(name = "bill_type", nullable = false, length = 20)
    var billType: BillType = BillType.OTHER,

    @Column(nullable = true, length = 500)
    var description: String? = null
)
