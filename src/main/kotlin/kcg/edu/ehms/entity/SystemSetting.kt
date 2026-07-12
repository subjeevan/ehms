package kcg.edu.ehms.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "system_settings")
class SystemSetting(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @Column(name = "setting_key", nullable = false, unique = true, length = 100)
    var settingKey: String = "",

    @Column(name = "setting_value", nullable = false, length = 1000)
    var settingValue: String = "",

    @Column(length = 300)
    var description: String? = null,

    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()
)
