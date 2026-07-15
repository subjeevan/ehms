package kcg.edu.ehms.entity

import jakarta.persistence.*

/**
 * Hospital department configured from the Setup menu.
 */
@Entity
@Table(name = "departments")
class Department(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @Column(nullable = false, unique = true, length = 100)
    var name: String = "",

    @Column(nullable = false, length = 500)
    var description: String = "",

    @ManyToMany(mappedBy = "departments", fetch = FetchType.LAZY)
    var doctors: MutableSet<Doctor> = mutableSetOf(),

    @OneToMany(mappedBy = "department", fetch = FetchType.LAZY)
    var users: MutableSet<User> = mutableSetOf()
)
