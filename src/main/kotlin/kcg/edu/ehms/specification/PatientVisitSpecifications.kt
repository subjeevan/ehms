package kcg.edu.ehms.specification

import jakarta.persistence.criteria.Join
import jakarta.persistence.criteria.JoinType
import jakarta.persistence.criteria.Predicate
import kcg.edu.ehms.entity.Department
import kcg.edu.ehms.entity.Doctor
import kcg.edu.ehms.entity.Gender
import kcg.edu.ehms.entity.InsuranceDetail
import kcg.edu.ehms.entity.Patient
import kcg.edu.ehms.entity.PatientType
import kcg.edu.ehms.entity.PatientVisit
import kcg.edu.ehms.entity.VisitPatientStatus
import org.springframework.data.jpa.domain.Specification
import java.time.LocalDate

object PatientVisitSpecifications {
    fun search(search: String?): Specification<PatientVisit> =
        Specification { root, query, cb ->
            val term = search?.trim()?.lowercase().orEmpty()

            if (term.isBlank()) {
                cb.conjunction()
            } else {
                query?.distinct(true)

                val patient: Join<PatientVisit, Patient> =
                    root.join("patient", JoinType.INNER)
                val department: Join<PatientVisit, Department> =
                    root.join("department", JoinType.INNER)
                val doctor: Join<PatientVisit, Doctor> =
                    root.join("doctor", JoinType.INNER)
                val insurance: Join<PatientVisit, InsuranceDetail> =
                    root.join("insuranceDetail", JoinType.LEFT)

                val pattern = "%$term%"
                val predicates = mutableListOf<Predicate>()

                predicates.add(
                    cb.like(
                        cb.lower(patient.get("medicalRecordNumber")),
                        pattern
                    )
                )
                predicates.add(
                    cb.like(cb.lower(patient.get("fullName")), pattern)
                )
                predicates.add(
                    cb.like(cb.lower(patient.get("contactNumber")), pattern)
                )
                predicates.add(
                    cb.like(cb.lower(patient.get("address")), pattern)
                )
                predicates.add(
                    cb.like(cb.lower(department.get("name")), pattern)
                )
                predicates.add(
                    cb.like(cb.lower(doctor.get("fullName")), pattern)
                )
                predicates.add(
                    cb.like(cb.lower(root.get("createdBy")), pattern)
                )
                predicates.add(
                    cb.like(cb.lower(insurance.get("policyNumber")), pattern)
                )

                term.toLongOrNull()?.let { number ->
                    predicates.add(cb.equal(root.get<Long>("id"), number))
                    predicates.add(cb.equal(patient.get<Long>("id"), number))
                }

                runCatching { LocalDate.parse(term) }
                    .getOrNull()
                    ?.let { date ->
                        predicates.add(
                            cb.equal(root.get<LocalDate>("visitDate"), date)
                        )
                    }

                PatientType.entries
                    .firstOrNull { it.name == term.uppercase() }
                    ?.let { patientType ->
                        predicates.add(
                            cb.equal(
                                root.get<PatientType>("patientType"),
                                patientType
                            )
                        )
                    }

                Gender.entries
                    .firstOrNull { it.name == term.uppercase() }
                    ?.let { gender ->
                        predicates.add(
                            cb.equal(patient.get<Gender>("gender"), gender)
                        )
                    }

                val patientStatus = when (
                    term.replace("-", "").replace(" ", "")
                ) {
                    "new" -> VisitPatientStatus.NEW
                    "old", "returning", "followup" ->
                        VisitPatientStatus.RETURNING
                    else -> null
                }

                patientStatus?.let { status ->
                    predicates.add(
                        cb.equal(
                            root.get<VisitPatientStatus>("patientStatus"),
                            status
                        )
                    )
                }

                cb.or(*predicates.toTypedArray())
            }
        }
}
