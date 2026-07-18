package kcg.edu.ehms.repository

import kcg.edu.ehms.entity.Patient
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param

interface PatientRepository :
    JpaRepository<Patient, Long>,
    JpaSpecificationExecutor<Patient> {

    fun findByMedicalRecordNumberIgnoreCase(medicalRecordNumber: String): Patient?

    fun existsByMedicalRecordNumberIgnoreCase(medicalRecordNumber: String): Boolean

    fun findAllByContactNumberOrderByFullNameAsc(contactNumber: String): List<Patient>

    @Query(
        """
        select distinct p
        from Patient p
        join p.visits v
        join v.insuranceDetail detail
        where lower(detail.policyNumber) = lower(:policyNumber)
        order by p.fullName asc
        """
    )
    fun findDistinctByInsurancePolicyNumber(
        @Param("policyNumber") policyNumber: String
    ): List<Patient>
}
