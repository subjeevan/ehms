package kcg.edu.ehms.repository

import kcg.edu.ehms.entity.Gender
import kcg.edu.ehms.entity.Patient
import kcg.edu.ehms.entity.PatientType
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Query

/**
 * Projection interface for patient count statistics.
 * Groups patients by type and gender.
 */
interface PatientCountProjection {
    fun getPatientType(): PatientType
    fun getGender(): Gender
    fun getCount(): Long
}

/**
 * Repository for Patient entity.
 * Provides database access methods and supports specifications-based search functionality.
 */
interface PatientRepository : JpaRepository<Patient, Long>, JpaSpecificationExecutor<Patient> {
    /**
     * Retrieves patient count statistics grouped by patient type and gender.
     * Used for dashboard analytics.
     */
    @Query(
        """
        select p.patientType as patientType, p.gender as gender, count(p) as count
        from Patient p
        group by p.patientType, p.gender
        """
    )
    fun countGroupedByTypeAndGender(): List<PatientCountProjection>
}
