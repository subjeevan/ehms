package kcg.edu.ehms.config

import kcg.edu.ehms.entity.*
import kcg.edu.ehms.repository.*
import org.slf4j.LoggerFactory
import org.springframework.boot.ApplicationArguments
import org.springframework.boot.ApplicationRunner
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.LocalDate

@Component
class DataInitializer(
    private val roleRepository: RoleRepository,
    private val userRepository: UserRepository,
    private val departmentRepository: DepartmentRepository,
    private val doctorRepository: DoctorRepository,
    private val patientRepository: PatientRepository,
    private val settingRepository: SystemSettingRepository,
    private val passwordEncoder: PasswordEncoder
) : ApplicationRunner {
    private val log = LoggerFactory.getLogger(javaClass)

    @Transactional
    override fun run(args: ApplicationArguments) {
        val adminRole = roleRepository.findByName("ROLE_ADMIN")
            ?: roleRepository.save(Role(name = "ROLE_ADMIN"))
        val userRole = roleRepository.findByName("ROLE_USER")
            ?: roleRepository.save(Role(name = "ROLE_USER"))

        if (!userRepository.existsByUsername("admin")) {
            userRepository.save(
                User(
                    username = "admin",
                    password = requireNotNull(passwordEncoder.encode("Admin@123")) {
                        "Failed to encode administrator password"
                    },                    roles = mutableSetOf(adminRole, userRole)
                )
            )
            log.info("Created default administrator account: admin")
        }
        if (!userRepository.existsByUsername("user")) {
            userRepository.save(
                User(
                    username = "user",
                    password = requireNotNull(passwordEncoder.encode("User@123")) {
                        "Failed to encode user password"
                    },                    roles = mutableSetOf(userRole)
                )
            )
        }

        if (departmentRepository.count() == 0L) {
            val outpatient = departmentRepository.save(
                Department(name = "Outpatient Department", description = "General outpatient consultations")
            )
            val emergency = departmentRepository.save(
                Department(name = "Emergency", description = "Emergency and urgent care services")
            )
            val ophthalmology = departmentRepository.save(
                Department(name = "Ophthalmology", description = "Eye care and ophthalmic procedures")
            )
            doctorRepository.save(
                Doctor(
                    fullName = "Dr. Asha Sharma",
                    specialization = "Ophthalmologist",
                    contactNumber = "+81 75 555 0101",
                    departments = mutableSetOf(outpatient, ophthalmology)
                )
            )
            doctorRepository.save(
                Doctor(
                    fullName = "Dr. Kenji Sato",
                    specialization = "Emergency Medicine",
                    contactNumber = "+81 75 555 0102",
                    departments = mutableSetOf(emergency)
                )
            )
        }

        if (patientRepository.count() == 0L) {
            val general = Patient(
                fullName = "Sita Karki",
                gender = Gender.FEMALE,
                dateOfBirth = LocalDate.of(1992, 4, 18),
                contactNumber = "+977 9841000001",
                address = "Kathmandu, Nepal",
                patientType = PatientType.GENERAL
            )
            general.bills += Bill(
                patient = general,
                amount = BigDecimal("2500.00"),
                billDate = LocalDate.now(),
                paymentStatus = PaymentStatus.PAID
            )
            patientRepository.save(general)

            patientRepository.save(
                Patient(
                    fullName = "Ramesh Thapa",
                    gender = Gender.MALE,
                    dateOfBirth = LocalDate.of(1986, 8, 12),
                    contactNumber = "+977 9841000002",
                    address = "Pokhara, Nepal",
                    patientType = PatientType.PAYING
                )
            )

            patientRepository.save(
                Patient(
                    fullName = "Maya Gurung",
                    gender = Gender.FEMALE,
                    dateOfBirth = LocalDate.of(1979, 1, 7),
                    contactNumber = "+977 9841000003",
                    address = "Bharatpur, Nepal",
                    patientType = PatientType.INSURANCE,
                    insuranceDetail = InsuranceDetail(
                        provider = "National Health Insurance",
                        policyNumber = "NHI-DEMO-1001",
                        coverageAmount = BigDecimal("100000.00"),
                        expiryDate = LocalDate.now().plusYears(1)
                    )
                )
            )
        }

        if (settingRepository.count() == 0L) {
            settingRepository.save(
                SystemSetting(
                    settingKey = "hospital.name",
                    settingValue = "Vision HMS Demo Hospital",
                    description = "Hospital name displayed by the application"
                )
            )
            settingRepository.save(
                SystemSetting(
                    settingKey = "hospital.timezone",
                    settingValue = "Asia/Tokyo",
                    description = "Default application timezone"
                )
            )
        }
    }
}
