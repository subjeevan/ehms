package kcg.edu.ehms.entity

import jakarta.persistence.*
import java.time.LocalDate
import java.time.LocalDateTime

/**
 * System user account and employee profile.
 *
 * Profile columns are nullable so existing databases can be upgraded safely.
 * New users are still required to provide all profile fields through validation.
 */
@Entity
@Table(name = "users")
class User(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @Column(nullable = false, unique = true, length = 80)
    var username: String = "",

    @Column(nullable = false, length = 100)
    var password: String = "",

    @Column(name = "first_name", length = 80)
    var firstName: String? = null,

    @Column(name = "last_name", length = 80)
    var lastName: String? = null,

    @Column(name = "contact_number", length = 10)
    var contactNumber: String? = null,

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    var gender: Gender? = null,

    @Column(name = "date_of_birth")
    var dateOfBirth: LocalDate? = null,

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id")
    var department: Department? = null,

    @Column(nullable = false)
    var enabled: Boolean = true,

    @Column(nullable = false, updatable = false)
    var createdAt: LocalDateTime = LocalDateTime.now(),

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",
        joinColumns = [JoinColumn(name = "user_id")],
        inverseJoinColumns = [JoinColumn(name = "role_id")]
    )
    var roles: MutableSet<Role> = mutableSetOf()
)
