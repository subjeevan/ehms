package kcg.edu.ehms.repository

import kcg.edu.ehms.entity.SystemSetting
import org.springframework.data.jpa.repository.JpaRepository

/**
 * Repository for SystemSetting entity.
 * Provides database access methods for system configuration-related operations.
 */
interface SystemSettingRepository : JpaRepository<SystemSetting, Long> {
    /**
     * Checks if a setting with the given key exists (case-insensitive).
     */
    fun existsBySettingKeyIgnoreCase(settingKey: String): Boolean

    /**
     * Checks if a setting with the given key exists excluding the specified setting ID (case-insensitive).
     * Used for validating unique setting keys during updates.
     */
    fun existsBySettingKeyIgnoreCaseAndIdNot(settingKey: String, id: Long): Boolean
}
