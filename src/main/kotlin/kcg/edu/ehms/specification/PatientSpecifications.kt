package kcg.edu.ehms.specification

import kcg.edu.ehms.entity.Patient
import org.springframework.data.jpa.domain.Specification

object PatientSpecifications {
    fun search(search: String?): Specification<Patient> = Specification { root, _, cb ->
        val term = search?.trim()?.lowercase().orEmpty()
        if (term.isBlank()) {
            cb.conjunction()
        } else {
            val pattern = "%$term%"
            val predicates = mutableListOf(
                cb.like(cb.lower(root.get<String>("medicalRecordNumber")), pattern),
                cb.like(cb.lower(root.get<String>("fullName")), pattern),
                cb.like(cb.lower(root.get<String>("contactNumber")), pattern),
                cb.like(cb.lower(root.get<String>("address")), pattern)
            )
            term.toLongOrNull()?.let { id -> predicates += cb.equal(root.get<Long>("id"), id) }
            cb.or(*predicates.toTypedArray())
        }
    }
}
