package kcg.edu.ehms.entity

import jakarta.persistence.*
import java.time.LocalDate
import java.time.LocalDateTime

/** Permanent patient demographic information. One patient keeps one MRN. */
@Entity
@Table(
    name = "patients",
    uniqueConstraints = [
        UniqueConstraint(name = "uk_patients_medical_record_number", columnNames = ["medical_record_number"])
    ],
    indexes = [
        Index(name = "idx_patient_name", columnList = "full_name"),
        Index(name = "idx_patient_contact", columnList = "contact_number")
    ]
)
class Patient(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @Column(name = "medical_record_number", nullable = false, length = 30)
    var medicalRecordNumber: String = "",

    @Column(name = "full_name", nullable = false, length = 150)
    var fullName: String = "",

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    var gender: Gender = Gender.MALE,

    @Column(name = "date_of_birth", nullable = false)
    var dateOfBirth: LocalDate = LocalDate.now(),

    @Column(name = "contact_number", nullable = false, length = 25)
    var contactNumber: String = "",

    @Column(nullable = false, length = 300)
    var address: String = "",

    @Column(name = "registered_at", nullable = false, updatable = false)
    var registeredAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now(),

    @OneToMany(mappedBy = "patient", cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.LAZY)
    var visits: MutableList<PatientVisit> = mutableListOf()
) {
    @PreUpdate
    fun updateTimestamp() {
        updatedAt = LocalDateTime.now()
    }
}
