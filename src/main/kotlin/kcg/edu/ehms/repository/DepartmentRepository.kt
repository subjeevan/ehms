package kcg.edu.ehms.repository

import kcg.edu.ehms.entity.Department
import org.springframework.data.jpa.repository.JpaRepository

/**
 * Repository for Department entity.
 * Provides database access methods for department-related operations.
 */
interface DepartmentRepository : JpaRepository<Department, Long> {
    /**
     * Checks if a department with the given name exists (case-insensitive).
     */
    fun existsByNameIgnoreCase(name: String): Boolean

    /**
     * Checks if a department with the given name exists excluding the specified department ID (case-insensitive).
     * Used for validating unique department names during updates.
     */
    fun existsByNameIgnoreCaseAndIdNot(name: String, id: Long): Boolean
}
