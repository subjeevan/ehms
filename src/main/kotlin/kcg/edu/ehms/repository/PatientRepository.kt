package kcg.edu.ehms.repository

import kcg.edu.ehms.entity.Gender
import kcg.edu.ehms.entity.Patient
import kcg.edu.ehms.entity.PatientType
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.LocalDateTime

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

    @Query(
        """
        select p.patientType as patientType,
               p.gender as gender,
               count(p) as count
        from Patient p
        where p.registeredAt >= :startDateTime
          and p.registeredAt < :endDateTime
        group by p.patientType, p.gender
        """
    )
    fun countGroupedByTypeAndGenderBetween(
        @Param("startDateTime") startDateTime: LocalDateTime,
        @Param("endDateTime") endDateTime: LocalDateTime
    ): List<PatientCountProjection>

    fun findAllByRegisteredAtGreaterThanEqualAndRegisteredAtLessThan(
        startDateTime: LocalDateTime,
        endDateTime: LocalDateTime
    ): List<Patient>
}
