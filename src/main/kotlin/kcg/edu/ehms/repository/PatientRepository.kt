package kcg.edu.ehms.repository

import kcg.edu.ehms.entity.Gender
import kcg.edu.ehms.entity.Patient
import kcg.edu.ehms.entity.PatientType
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Query
import java.time.LocalDateTime

/**
 * Projection used for dashboard patient counts.
 */
interface PatientCountProjection {
    fun getPatientType(): PatientType
    fun getGender(): Gender
    fun getCount(): Long
}

interface PatientRepository :
    JpaRepository<Patient, Long>,
    JpaSpecificationExecutor<Patient> {

    @Query(
        """
        select p.patientType as patientType,
               p.gender as gender,
               count(p) as count
        from Patient p
        group by p.patientType, p.gender
        """
    )
    fun countGroupedByTypeAndGender(): List<PatientCountProjection>

    /**
     * Returns patients registered in the supplied half-open date range.
     * The service groups their registeredAt values by month.
     */
    fun findAllByRegisteredAtGreaterThanEqualAndRegisteredAtLessThan(
        startDateTime: LocalDateTime,
        endDateTime: LocalDateTime
    ): List<Patient>
}
