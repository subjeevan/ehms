package kcg.edu.ehms.service

import kcg.edu.ehms.dto.setup.DepartmentResponse
import kcg.edu.ehms.dto.setup.DoctorRequest
import kcg.edu.ehms.dto.setup.DoctorResponse
import kcg.edu.ehms.entity.Doctor
import kcg.edu.ehms.exception.ResourceNotFoundException
import kcg.edu.ehms.repository.DepartmentRepository
import kcg.edu.ehms.repository.DoctorRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class DoctorService(
    private val doctorRepository: DoctorRepository,
    private val departmentRepository: DepartmentRepository
) {
    private val log = LoggerFactory.getLogger(javaClass)

    @Transactional(readOnly = true)
    fun list(): List<DoctorResponse> = doctorRepository.findAll()
        .sortedBy { it.fullName.lowercase() }
        .map { it.toResponse() }

    @Transactional
    fun create(request: DoctorRequest): DoctorResponse {
        val doctor = Doctor()
        applyRequest(doctor, request)
        val saved = doctorRepository.save(doctor)
        log.info("Doctor {} created", saved.id)
        return saved.toResponse()
    }

    @Transactional
    fun update(id: Long, request: DoctorRequest): DoctorResponse {
        val doctor = find(id)
        applyRequest(doctor, request)
        return doctorRepository.save(doctor).toResponse()
    }

    @Transactional
    fun delete(id: Long) {
        doctorRepository.delete(find(id))
        log.warn("Doctor {} deleted", id)
    }

    private fun applyRequest(doctor: Doctor, request: DoctorRequest) {
        val departments = departmentRepository.findAllById(request.departmentIds)
        if (departments.size != request.departmentIds.size) {
            throw ResourceNotFoundException("One or more selected departments were not found")
        }
        doctor.fullName = request.fullName.trim()
        doctor.specialization = request.specialization.trim()
        doctor.contactNumber = request.contactNumber.trim()
        doctor.departments.clear()
        doctor.departments.addAll(departments)
    }

    private fun find(id: Long) = doctorRepository.findById(id)
        .orElseThrow { ResourceNotFoundException("Doctor with ID $id was not found") }

    private fun Doctor.toResponse() = DoctorResponse(
        id = id!!,
        fullName = fullName,
        specialization = specialization,
        contactNumber = contactNumber,
        departments = departments.sortedBy { it.name }.map { DepartmentResponse(it.id!!, it.name, it.description) }
    )
}
