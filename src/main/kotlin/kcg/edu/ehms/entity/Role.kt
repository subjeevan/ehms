package kcg.edu.ehms.entity

import jakarta.persistence.*

/**
 * Role entity representing a user role/permission in the EHMS system.
 * Defines different access levels such as ADMIN, USER, etc.
 */
@Entity
@Table(name = "roles")
class Role(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @Column(nullable = false, unique = true, length = 50)
    var name: String = ""
)
