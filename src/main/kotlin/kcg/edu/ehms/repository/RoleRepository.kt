package kcg.edu.ehms.repository

import kcg.edu.ehms.entity.Role
import org.springframework.data.jpa.repository.JpaRepository

/**
 * Repository for Role entity.
 * Provides database access methods for role-related operations.
 */
interface RoleRepository : JpaRepository<Role, Long> {
    /**
     * Finds a role by name.
     */
    fun findByName(name: String): Role?
}
