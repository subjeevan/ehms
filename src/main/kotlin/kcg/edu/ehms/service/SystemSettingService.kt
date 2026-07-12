package kcg.edu.ehms.service

import kcg.edu.ehms.dto.setup.SystemSettingRequest
import kcg.edu.ehms.dto.setup.SystemSettingResponse
import kcg.edu.ehms.entity.SystemSetting
import kcg.edu.ehms.exception.DuplicateEntryException
import kcg.edu.ehms.exception.ResourceNotFoundException
import kcg.edu.ehms.repository.SystemSettingRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
class SystemSettingService(
    private val repository: SystemSettingRepository
) {
    @Transactional(readOnly = true)
    fun list(): List<SystemSettingResponse> = repository.findAll().sortedBy { it.settingKey }.map { it.toResponse() }

    @Transactional
    fun create(request: SystemSettingRequest): SystemSettingResponse {
        if (repository.existsBySettingKeyIgnoreCase(request.settingKey.trim())) {
            throw DuplicateEntryException("Setting key already exists")
        }
        return repository.save(
            SystemSetting(
                settingKey = request.settingKey.trim(),
                settingValue = request.settingValue.trim(),
                description = request.description?.trim()
            )
        ).toResponse()
    }

    @Transactional
    fun update(id: Long, request: SystemSettingRequest): SystemSettingResponse {
        if (repository.existsBySettingKeyIgnoreCaseAndIdNot(request.settingKey.trim(), id)) {
            throw DuplicateEntryException("Setting key already exists")
        }
        val setting = find(id)
        setting.settingKey = request.settingKey.trim()
        setting.settingValue = request.settingValue.trim()
        setting.description = request.description?.trim()
        setting.updatedAt = LocalDateTime.now()
        return repository.save(setting).toResponse()
    }

    @Transactional
    fun delete(id: Long) = repository.delete(find(id))

    private fun find(id: Long) = repository.findById(id)
        .orElseThrow { ResourceNotFoundException("System setting with ID $id was not found") }

    private fun SystemSetting.toResponse() = SystemSettingResponse(
        id!!, settingKey, settingValue, description, updatedAt
    )
}
