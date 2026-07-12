package kcg.edu.ehms.repository

import kcg.edu.ehms.entity.Doctor
import org.springframework.data.jpa.repository.JpaRepository

/**
 * Repository for Doctor entity.
 * Provides database access methods for doctor-related operations.
 */
interface DoctorRepository : JpaRepository<Doctor, Long>
