package kcg.edu.ehms.entity

import jakarta.persistence.*
import java.time.LocalDate
import java.time.LocalDateTime

/** One row for every hospital visit made by a patient. */
@Entity
@Table(
    name = "patient_visits",
    indexes = [
        Index(name = "idx_visit_patient", columnList = "patient_id"),
        Index(name = "idx_visit_date", columnList = "visit_date"),
        Index(name = "idx_visit_department", columnList = "department_id"),
        Index(name = "idx_visit_doctor", columnList = "doctor_id"),
        Index(name = "idx_visit_type_status", columnList = "patient_type,patient_status")
    ]
)
class PatientVisit(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false, foreignKey = ForeignKey(name = "fk_visit_patient"))
    var patient: Patient? = null,

    @Column(name = "visit_date", nullable = false)
    var visitDate: LocalDate = LocalDate.now(),

    @Enumerated(EnumType.STRING)
    @Column(name = "patient_status", nullable = false, length = 20)
    var patientStatus: VisitPatientStatus = VisitPatientStatus.NEW,

    @Enumerated(EnumType.STRING)
    @Column(name = "patient_type", nullable = false, length = 20)
    var patientType: PatientType = PatientType.GENERAL,

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "department_id", nullable = false, foreignKey = ForeignKey(name = "fk_visit_department"))
    var department: Department? = null,

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "doctor_id", nullable = false, foreignKey = ForeignKey(name = "fk_visit_doctor"))
    var doctor: Doctor? = null,

    @Column(name = "reason_for_visit", length = 500)
    var reasonForVisit: String? = null,

    @Column(name = "created_by", nullable = false, length = 100)
    var createdBy: String = "system",

    @Column(name = "created_at", nullable = false, updatable = false)
    var createdAt: LocalDateTime = LocalDateTime.now(),

    @OneToOne(cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "insurance_detail_id", unique = true)
    var insuranceDetail: InsuranceDetail? = null,

    @OneToMany(mappedBy = "visit", cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.LAZY)
    var bills: MutableList<Bill> = mutableListOf()
)
