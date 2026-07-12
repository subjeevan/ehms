package kcg.edu.ehms.entity

import jakarta.persistence.*

@Entity
@Table(name = "doctors")
class Doctor(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @Column(name = "full_name", nullable = false, length = 150)
    var fullName: String = "",

    @Column(nullable = false, length = 150)
    var specialization: String = "",

    @Column(name = "contact_number", nullable = false, length = 25)
    var contactNumber: String = "",

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "doctor_departments",
        joinColumns = [JoinColumn(name = "doctor_id")],
        inverseJoinColumns = [JoinColumn(name = "department_id")]
    )
    var departments: MutableSet<Department> = mutableSetOf()
)
