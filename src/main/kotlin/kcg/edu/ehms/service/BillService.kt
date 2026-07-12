package kcg.edu.ehms.service

import kcg.edu.ehms.dto.bill.BillRequest
import kcg.edu.ehms.dto.bill.BillResponse
import kcg.edu.ehms.entity.Bill
import kcg.edu.ehms.exception.ResourceNotFoundException
import kcg.edu.ehms.repository.BillRepository
import kcg.edu.ehms.repository.PatientRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class BillService(
    private val billRepository: BillRepository,
    private val patientRepository: PatientRepository
) {
    @Transactional(readOnly = true)
    fun listForPatient(patientId: Long): List<BillResponse> {
        ensurePatient(patientId)
        return billRepository.findAllByPatientIdOrderByBillDateDesc(patientId).map { it.toResponse() }
    }

    @Transactional
    fun create(patientId: Long, request: BillRequest): BillResponse {
        val patient = ensurePatient(patientId)
        return billRepository.save(
            Bill(
                patient = patient,
                amount = request.amount!!,
                billDate = request.billDate!!,
                paymentStatus = request.paymentStatus!!
            )
        ).toResponse()
    }

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

    private fun ensurePatient(id: Long) = patientRepository.findById(id)
        .orElseThrow { ResourceNotFoundException("Patient with ID $id was not found") }

    private fun find(id: Long) = billRepository.findById(id)
        .orElseThrow { ResourceNotFoundException("Bill with ID $id was not found") }

    private fun Bill.toResponse() = BillResponse(
        id = id!!,
        patientId = patient!!.id!!,
        patientName = patient!!.fullName,
        amount = amount,
        billDate = billDate,
        paymentStatus = paymentStatus
    )
}
