package kcg.edu.ehms.service

import kcg.edu.ehms.dto.bill.BillRequest
import kcg.edu.ehms.dto.bill.BillResponse
import kcg.edu.ehms.entity.Bill
import kcg.edu.ehms.exception.ResourceNotFoundException
import kcg.edu.ehms.repository.BillRepository
import kcg.edu.ehms.repository.PatientRepository
import kcg.edu.ehms.repository.PatientVisitRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class BillService(
    private val billRepository: BillRepository,
    private val patientRepository: PatientRepository,
    private val patientVisitRepository: PatientVisitRepository
) {
    @Transactional(readOnly = true)
    fun listForPatient(patientId: Long): List<BillResponse> {
        ensurePatient(patientId)
        return billRepository.findAllByVisitPatientIdOrderByBillDateDesc(patientId).map { it.toResponse() }
    }

    @Transactional(readOnly = true)
    fun listForVisit(visitId: Long): List<BillResponse> {
        ensureVisit(visitId)
        return billRepository.findAllByVisitIdOrderByBillDateDesc(visitId).map { it.toResponse() }
    }

    /** Existing patient-level endpoint creates a bill against that patient's latest visit. */
    @Transactional
    fun create(patientId: Long, request: BillRequest): BillResponse {
        ensurePatient(patientId)
        val visit = patientVisitRepository.findFirstByPatientIdOrderByVisitDateDescCreatedAtDescIdDesc(patientId)
            ?: throw ResourceNotFoundException("Patient with ID $patientId has no visit")
        return saveForVisit(visit.id!!, request)
    }

    @Transactional
    fun createForVisit(visitId: Long, request: BillRequest): BillResponse = saveForVisit(visitId, request)

    @Transactional
    fun update(id: Long, request: BillRequest): BillResponse {
        val bill = find(id)
        bill.amount = request.amount!!
        bill.billDate = request.billDate!!
        bill.paymentStatus = request.paymentStatus!!
        return billRepository.save(bill).toResponse()
    }

    @Transactional
    fun delete(id: Long) = billRepository.delete(find(id))

    private fun saveForVisit(visitId: Long, request: BillRequest): BillResponse {
        val visit = ensureVisit(visitId)
        return billRepository.save(
            Bill(
                visit = visit,
                amount = request.amount!!,
                billDate = request.billDate!!,
                paymentStatus = request.paymentStatus!!
            )
        ).toResponse()
    }

    private fun ensurePatient(id: Long) = patientRepository.findById(id)
        .orElseThrow { ResourceNotFoundException("Patient with ID $id was not found") }

    private fun ensureVisit(id: Long) = patientVisitRepository.findById(id)
        .orElseThrow { ResourceNotFoundException("Visit with ID $id was not found") }

    private fun find(id: Long) = billRepository.findById(id)
        .orElseThrow { ResourceNotFoundException("Bill with ID $id was not found") }

    private fun Bill.toResponse(): BillResponse {
        val visit = visit!!
        val patient = visit.patient!!
        return BillResponse(
            id = id!!,
            visitId = visit.id!!,
            patientId = patient.id!!,
            medicalRecordNumber = patient.medicalRecordNumber,
            patientName = patient.fullName,
            amount = amount,
            billDate = billDate,
            paymentStatus = paymentStatus,
            billType = billType,
            description = description
        )
    }
}
