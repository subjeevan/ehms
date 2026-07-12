package kcg.edu.ehms.repository

import kcg.edu.ehms.entity.SystemSetting
import org.springframework.data.jpa.repository.JpaRepository

interface SystemSettingRepository : JpaRepository<SystemSetting, Long> {
    fun existsBySettingKeyIgnoreCase(settingKey: String): Boolean
    fun existsBySettingKeyIgnoreCaseAndIdNot(settingKey: String, id: Long): Boolean
}
