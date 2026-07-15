package kcg.edu.ehms.service

import kcg.edu.ehms.dto.auth.*
import kcg.edu.ehms.dto.user.UserDepartmentResponse
import kcg.edu.ehms.exception.BusinessValidationException
import kcg.edu.ehms.exception.ResourceNotFoundException
import kcg.edu.ehms.repository.UserRepository
import kcg.edu.ehms.security.JwtTokenService
import kcg.edu.ehms.security.requiredUsername
import org.slf4j.LoggerFactory
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class AuthService(
    private val authenticationManager: AuthenticationManager,
    private val jwtTokenService: JwtTokenService,
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder
) {
    private val log = LoggerFactory.getLogger(javaClass)

    fun login(request: LoginRequest): LoginResponse {
        val authentication = authenticationManager.authenticate(
            UsernamePasswordAuthenticationToken(
                request.username.trim(),
                request.password
            )
        )

        val issuedToken = jwtTokenService.issue(authentication)
        val username = authentication.requiredUsername()
        val roles = authentication.authorities
            .mapNotNull { it.authority?.trim() }
            .filter { it.isNotEmpty() }
            .sorted()

        log.info("Successful login for user {}", username)

        return LoginResponse(
            token = issuedToken.value,
            expiresAt = issuedToken.expiresAt,
            username = username,
            roles = roles
        )
    }

    @Transactional(readOnly = true)
    fun currentUser(authentication: Authentication): CurrentUserResponse {
        val username = authentication.requiredUsername()
        val user = userRepository.findByUsername(username)
            ?: throw ResourceNotFoundException(
                "Authenticated user was not found"
            )

        val departmentResponse = user.department?.let {
            UserDepartmentResponse(
                id = requireNotNull(it.id),
                name = it.name
            )
        }

        return CurrentUserResponse(
            id = requireNotNull(user.id),
            username = user.username,
            firstName = user.firstName,
            lastName = user.lastName,
            contactNumber = user.contactNumber,
            gender = user.gender,
            dateOfBirth = user.dateOfBirth,
            department = departmentResponse,
            enabled = user.enabled,
            roles = user.roles.map { it.name }.sorted()
        )
    }

    @Transactional
    fun changePassword(
        username: String,
        request: ChangePasswordRequest
    ): MessageResponse {
        val user = userRepository.findByUsername(username)
            ?: throw ResourceNotFoundException("User not found")

        val validationErrors = mutableMapOf<String, String>()

        if (!passwordEncoder.matches(request.currentPassword, user.password)) {
            validationErrors["currentPassword"] =
                "Current password is incorrect"
        }

        if (request.currentPassword == request.newPassword) {
            validationErrors["newPassword"] =
                "New password must be different from the current password"
        }

        if (request.newPassword != request.confirmNewPassword) {
            validationErrors["confirmNewPassword"] =
                "Password confirmation does not match"
        }

        if (validationErrors.isNotEmpty()) {
            throw BusinessValidationException(
                message = "Password change validation failed",
                fieldErrors = validationErrors
            )
        }

        user.password = requireNotNull(
            passwordEncoder.encode(request.newPassword)
        ) {
            "Password encoder returned a null value"
        }

        userRepository.save(user)
        log.info("Password changed for user {}", username)

        return MessageResponse(
            "Password changed successfully. Please log in again."
        )
    }
}
