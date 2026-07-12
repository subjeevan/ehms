package kcg.edu.ehms.service

import kcg.edu.ehms.dto.auth.ChangePasswordRequest
import kcg.edu.ehms.dto.auth.CurrentUserResponse
import kcg.edu.ehms.dto.auth.LoginRequest
import kcg.edu.ehms.dto.auth.LoginResponse
import kcg.edu.ehms.dto.auth.MessageResponse
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
        val loginToken = UsernamePasswordAuthenticationToken(
            request.username.trim(),
            request.password
        )

        val authentication = authenticationManager.authenticate(
            loginToken
        )

        val issuedToken = jwtTokenService.issue(authentication)

        val username = authentication.requiredUsername()

        /*
         * authority can be nullable, so remove null and blank
         * values before calling sorted().
         */
        val roles: List<String> = authentication.authorities
            .mapNotNull { grantedAuthority ->
                grantedAuthority.authority
                    ?.trim()
                    ?.takeIf { authorityName ->
                        authorityName.isNotEmpty()
                    }
            }
            .sorted()

        log.info(
            "Successful login for user {}",
            username
        )

        return LoginResponse(
            token = issuedToken.value,
            expiresAt = issuedToken.expiresAt,
            username = username,
            roles = roles
        )
    }

    @Transactional(readOnly = true)
    fun currentUser(
        authentication: Authentication
    ): CurrentUserResponse {
        val username = authentication.requiredUsername()

        val user = userRepository.findByUsername(username)
            ?: throw ResourceNotFoundException(
                "Authenticated user was not found"
            )

        val userId = requireNotNull(user.id) {
            "Authenticated user ID is missing"
        }

        val roles: List<String> = user.roles
            .map { role ->
                role.name
            }
            .sorted()

        return CurrentUserResponse(
            id = userId,
            username = user.username,
            enabled = user.enabled,
            roles = roles
        )
    }

    @Transactional
    fun changePassword(
        username: String,
        request: ChangePasswordRequest
    ): MessageResponse {
        val user = userRepository.findByUsername(username)
            ?: throw ResourceNotFoundException(
                "User not found"
            )

        val validationErrors = mutableMapOf<String, String>()

        val currentPasswordMatches = passwordEncoder.matches(
            request.currentPassword,
            user.password
        )

        if (!currentPasswordMatches) {
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

        val encodedPassword = requireNotNull(
            passwordEncoder.encode(request.newPassword)
        ) {
            "Password encoder returned a null value"
        }

        user.password = encodedPassword

        userRepository.save(user)

        log.info(
            "Password changed for user {}",
            username
        )

        return MessageResponse(
            message = "Password changed successfully. Please log in again."
        )
    }
}