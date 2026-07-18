package kcg.edu.ehms.repository

import kcg.edu.ehms.entity.Gender
import kcg.edu.ehms.entity.PatientType
import kcg.edu.ehms.entity.PatientVisit
import kcg.edu.ehms.entity.VisitPatientStatus
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.LocalDate

interface VisitCountProjection {
    fun getPatientType(): PatientType
    fun getGender(): Gender
    fun getCount(): Long
}

interface VisitStatusCountProjection {
    fun getPatientType(): PatientType
    fun getPatientStatus(): VisitPatientStatus
    fun getGender(): Gender
    fun getCount(): Long
}

interface PatientVisitRepository :
    JpaRepository<PatientVisit, Long>,
    JpaSpecificationExecutor<PatientVisit> {

    fun findAllByPatientIdOrderByVisitDateDescCreatedAtDesc(patientId: Long): List<PatientVisit>

    fun findFirstByPatientIdOrderByVisitDateDescCreatedAtDescIdDesc(patientId: Long): PatientVisit?

    fun findAllByVisitDateGreaterThanEqualAndVisitDateLessThan(
        startDate: LocalDate,
        endDate: LocalDate
    ): List<PatientVisit>

    fun countByPatientStatus(patientStatus: VisitPatientStatus): Long

    @Query(
        """
        select v.patientType as patientType,
               v.patient.gender as gender,
               count(v) as count
        from PatientVisit v
        group by v.patientType, v.patient.gender
        """
    )
    fun countGroupedByTypeAndGender(): List<VisitCountProjection>

    @Query(
        """
        select v.patientType as patientType,
               v.patient.gender as gender,
               count(v) as count
        from PatientVisit v
        where v.visitDate >= :startDate
          and v.visitDate < :endDate
        group by v.patientType, v.patient.gender
        """
    )
    fun countGroupedByTypeAndGenderBetween(
        @Param("startDate") startDate: LocalDate,
        @Param("endDate") endDate: LocalDate
    ): List<VisitCountProjection>

    @Query(
        """
        select v.patientType as patientType,
               v.patientStatus as patientStatus,
               v.patient.gender as gender,
               count(v) as count
        from PatientVisit v
        group by v.patientType, v.patientStatus, v.patient.gender
        """
    )
    fun countGroupedByTypeStatusAndGender(): List<VisitStatusCountProjection>

    @Query(
        """
        select v.patientType as patientType,
               v.patientStatus as patientStatus,
               v.patient.gender as gender,
               count(v) as count
        from PatientVisit v
        where v.visitDate >= :startDate
          and v.visitDate < :endDate
        group by v.patientType, v.patientStatus, v.patient.gender
        """
    )
    fun countGroupedByTypeStatusAndGenderBetween(
        @Param("startDate") startDate: LocalDate,
        @Param("endDate") endDate: LocalDate
    ): List<VisitStatusCountProjection>
}
