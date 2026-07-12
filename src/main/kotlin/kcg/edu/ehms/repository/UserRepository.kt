package kcg.edu.ehms.repository

import kcg.edu.ehms.entity.User
import org.springframework.data.jpa.repository.JpaRepository

/**
 * Repository for User entity.
 * Provides database access methods for user account operations.
 */
interface UserRepository : JpaRepository<User, Long> {
    /**
     * Finds a user by username.
     */
    fun findByUsername(username: String): User?

    /**
     * Checks if a user with the given username exists.
     */
    fun existsByUsername(username: String): Boolean
}
