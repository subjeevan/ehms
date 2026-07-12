package kcg.edu.ehms.service

import kcg.edu.ehms.dto.user.CreateUserRequest
import kcg.edu.ehms.dto.user.UserResponse
import kcg.edu.ehms.entity.User
import kcg.edu.ehms.exception.BusinessValidationException
import kcg.edu.ehms.exception.DuplicateEntryException
import kcg.edu.ehms.exception.ResourceNotFoundException
import kcg.edu.ehms.repository.RoleRepository
import kcg.edu.ehms.repository.UserRepository
import org.slf4j.LoggerFactory
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class UserService(
    private val userRepository: UserRepository,
    private val roleRepository: RoleRepository,
    private val passwordEncoder: PasswordEncoder
) {

    private val log = LoggerFactory.getLogger(javaClass)

    private val allowedRoles: Set<String> = setOf(
        "ROLE_ADMIN",
        "ROLE_USER"
    )

    @Transactional(readOnly = true)
    fun list(): List<UserResponse> {
        return userRepository.findAll()
            .sortedBy { user ->
                user.username.lowercase()
            }
            .map { user ->
                user.toResponse()
            }
    }

    @Transactional
    fun create(request: CreateUserRequest): UserResponse {
        val username = request.username.trim()

        if (username.isBlank()) {
            throw BusinessValidationException(
                message = "Username is required",
                fieldErrors = mapOf(
                    "username" to "Username cannot be blank"
                )
            )
        }

        if (userRepository.existsByUsername(username)) {
            throw DuplicateEntryException(
                "Username already exists"
            )
        }

        val roleNames: Set<String> = request.roles
            .ifEmpty {
                setOf("ROLE_USER")
            }
            .map { roleName ->
                roleName.trim().uppercase()
            }
            .filter { roleName ->
                roleName.isNotEmpty()
            }
            .toSet()

        if (!allowedRoles.containsAll(roleNames)) {
            throw BusinessValidationException(
                message = "Invalid roles",
                fieldErrors = mapOf(
                    "roles" to
                            "Only ROLE_ADMIN and ROLE_USER are allowed"
                )
            )
        }

        val roles = roleNames
            .map { roleName ->
                roleRepository.findByName(roleName)
                    ?: throw ResourceNotFoundException(
                        "Role $roleName was not found"
                    )
            }
            .toMutableSet()

        val encodedPassword = requireNotNull(
            passwordEncoder.encode(request.password)
        ) {
            "Password encoder returned a null value"
        }

        val user = User(
            username = username,
            password = encodedPassword,
            roles = roles
        )

        val savedUser = userRepository.save(user)

        log.info(
            "User {} created with roles {}",
            username,
            roleNames
        )

        return savedUser.toResponse()
    }

    @Transactional
    fun setEnabled(
        id: Long,
        enabled: Boolean,
        actor: String
    ): UserResponse {
        val user = find(id)

        if (user.username == actor && !enabled) {
            throw BusinessValidationException(
                "You cannot disable your own account"
            )
        }

        user.enabled = enabled

        val savedUser = userRepository.save(user)

        log.info(
            "User {} enabled status changed to {} by {}",
            user.username,
            enabled,
            actor
        )

        return savedUser.toResponse()
    }

    @Transactional
    fun delete(
        id: Long,
        actor: String
    ) {
        val user = find(id)

        if (user.username == actor) {
            throw BusinessValidationException(
                "You cannot delete your own account"
            )
        }

        if (user.username == "admin") {
            throw BusinessValidationException(
                "The default admin account cannot be deleted"
            )
        }

        userRepository.delete(user)

        log.warn(
            "User {} deleted by {}",
            user.username,
            actor
        )
    }

    private fun find(id: Long): User {
        return userRepository.findById(id)
            .orElseThrow {
                ResourceNotFoundException(
                    "User with ID $id was not found"
                )
            }
    }

    private fun User.toResponse(): UserResponse {
        val userId = requireNotNull(id) {
            "User ID is missing"
        }

        val roleNames: List<String> = roles
            .map { role ->
                role.name
            }
            .filter { roleName ->
                roleName.isNotBlank()
            }
            .sorted()

        return UserResponse(
            id = userId,
            username = username,
            enabled = enabled,
            createdAt = createdAt,
            roles = roleNames
        )
    }
}