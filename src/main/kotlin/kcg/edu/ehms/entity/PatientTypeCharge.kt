package kcg.edu.ehms.entity

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDateTime

/**
 * Entity representing the registration charge configuration for each patient type.
 * Stores default charges that are applied when a patient of a specific type is registered.
 * These charges can be modified by administrators and are historially preserved in bills.
 */
@Entity
@Table(
    name = "patient_type_charges",
    uniqueConstraints = [
        UniqueConstraint(
            name = "uk_patient_type_charge",
            columnNames = ["patient_type"]
        )
    ]
)
class PatientTypeCharge(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @Enumerated(EnumType.STRING)
    @Column(name = "patient_type", nullable = false, unique = true, length = 20)
    var patientType: PatientType,

    @Column(nullable = false, precision = 12, scale = 2)
    var amount: BigDecimal,

    @Column(nullable = false)
    var enabled: Boolean = true,

    @Column(name = "created_at", nullable = false, updatable = false)
    var createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()
)
