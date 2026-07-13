package kcg.edu.ehms.repository

import kcg.edu.ehms.entity.PatientType
import kcg.edu.ehms.entity.PatientTypeCharge
import org.springframework.data.jpa.repository.JpaRepository

/**
 * Repository for PatientTypeCharge entity.
 * Provides database access methods for charge configuration management.
 */
interface PatientTypeChargeRepository : JpaRepository<PatientTypeCharge, Long> {
    /**
     * Retrieves the charge configuration for a specific patient type.
     */
    fun findByPatientType(patientType: PatientType): PatientTypeCharge?
}
