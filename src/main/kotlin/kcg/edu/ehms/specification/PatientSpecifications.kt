package kcg.edu.ehms.specification

import kcg.edu.ehms.entity.Patient
import org.springframework.data.jpa.domain.Specification

/**
 * Query specifications for Patient entity search.
 * Provides dynamic query building for flexible patient search functionality.
 */
object PatientSpecifications {
    /**
     * Creates a specification to search patients by multiple fields.
     * Searches across patient full name, contact number, address, and ID.
     * Returns all patients if search term is empty.
     */
    fun search(search: String?): Specification<Patient> = Specification { root, _, cb ->
        val term = search?.trim()?.lowercase().orEmpty()
        if (term.isBlank()) {
            cb.conjunction()
        } else {
            val pattern = "%$term%"
            val predicates = mutableListOf(
                cb.like(cb.lower(root.get<String>("fullName")), pattern),
                cb.like(cb.lower(root.get<String>("contactNumber")), pattern),
                cb.like(cb.lower(root.get<String>("address")), pattern)
            )
            term.toLongOrNull()?.let { id -> predicates += cb.equal(root.get<Long>("id"), id) }
            cb.or(*predicates.toTypedArray())
        }
    }
}
