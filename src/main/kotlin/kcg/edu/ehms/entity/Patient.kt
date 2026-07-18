package kcg.edu.ehms.entity

import jakarta.persistence.*
import java.time.LocalDate
import java.time.LocalDateTime

/**
 * Patient entity representing a patient record in the EHMS system.
 * Stores comprehensive patient information including personal details, contact info,
 * patient type, assigned doctor, insurance details, and associated bills.
 */
@Entity
@Table(
    name = "patients",
    indexes = [
        Index(name = "idx_patient_name", columnList = "full_name"),
        Index(name = "idx_patient_contact", columnList = "contact_number"),
        Index(name = "idx_patient_type_gender", columnList = "patient_type,gender"),
        Index(name = "idx_patient_doctor", columnList = "doctor_id")
    ]
)
class Patient(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

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

    @Enumerated(EnumType.STRING)
    @Column(name = "patient_type", nullable = false, length = 20)
    var patientType: PatientType = PatientType.GENERAL,

    @Column(name = "registered_at", nullable = false, updatable = false)
    var registeredAt: LocalDateTime = LocalDateTime.now(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "doctor_id",
        foreignKey = ForeignKey(name = "fk_patient_doctor")
    )
    var assignedDoctor: Doctor? = null,

    @OneToOne(cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "insurance_detail_id", unique = true)
    var insuranceDetail: InsuranceDetail? = null,

    @OneToMany(mappedBy = "patient", cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.LAZY)
    var bills: MutableList<Bill> = mutableListOf()
)
