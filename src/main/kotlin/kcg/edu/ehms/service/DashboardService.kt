package kcg.edu.ehms.service

import kcg.edu.ehms.dto.dashboard.DashboardSummaryResponse
import kcg.edu.ehms.dto.dashboard.GenderCount
import kcg.edu.ehms.entity.Gender
import kcg.edu.ehms.entity.PatientType
import kcg.edu.ehms.repository.PatientRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class DashboardService(
    private val patientRepository: PatientRepository
) {
    @Transactional(readOnly = true)
    fun summary(): DashboardSummaryResponse {
        val grouped = patientRepository.countGroupedByTypeAndGender()
            .associate { (it.getPatientType() to it.getGender()) to it.getCount() }

        fun counts(type: PatientType) = GenderCount(
            male = grouped[type to Gender.MALE] ?: 0,
            female = grouped[type to Gender.FEMALE] ?: 0
        )

        val paying = counts(PatientType.PAYING)
        val insurance = counts(PatientType.INSURANCE)
        val general = counts(PatientType.GENERAL)
        return DashboardSummaryResponse(
            totalPatients = paying.total + insurance.total + general.total,
            paying = paying,
            insurance = insurance,
            general = general
        )
    }
}
