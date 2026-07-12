package kcg.edu.ehms.service

import kcg.edu.ehms.dto.setup.DepartmentRequest
import kcg.edu.ehms.dto.setup.DepartmentResponse
import kcg.edu.ehms.entity.Department
import kcg.edu.ehms.exception.DuplicateEntryException
import kcg.edu.ehms.exception.ResourceNotFoundException
import kcg.edu.ehms.repository.DepartmentRepository
import kcg.edu.ehms.repository.DoctorRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class DepartmentService(
    private val departmentRepository: DepartmentRepository,
    private val doctorRepository: DoctorRepository
) {
    private val log = LoggerFactory.getLogger(javaClass)

    @Transactional(readOnly = true)
    fun list(): List<DepartmentResponse> = departmentRepository.findAll()
        .sortedBy { it.name.lowercase() }
        .map { it.toResponse() }

    @Transactional
    fun create(request: DepartmentRequest): DepartmentResponse {
        if (departmentRepository.existsByNameIgnoreCase(request.name.trim())) {
            throw DuplicateEntryException("Department name already exists")
        }
        val saved = departmentRepository.save(Department(name = request.name.trim(), description = request.description.trim()))
        log.info("Department {} created", saved.id)
        return saved.toResponse()
    }

    @Transactional
    fun update(id: Long, request: DepartmentRequest): DepartmentResponse {
        if (departmentRepository.existsByNameIgnoreCaseAndIdNot(request.name.trim(), id)) {
            throw DuplicateEntryException("Department name already exists")
        }
        val department = find(id)
        department.name = request.name.trim()
        department.description = request.description.trim()
        return departmentRepository.save(department).toResponse()
    }

    @Transactional
    fun delete(id: Long) {
        val department = find(id)
        department.doctors.toList().forEach { doctor ->
            doctor.departments.removeIf { it.id == id }
            doctorRepository.save(doctor)
        }
        departmentRepository.delete(department)
        log.warn("Department {} deleted", id)
    }

    private fun find(id: Long) = departmentRepository.findById(id)
        .orElseThrow { ResourceNotFoundException("Department with ID $id was not found") }

    private fun Department.toResponse() = DepartmentResponse(id!!, name, description)
}
