package kcg.edu.ehms.security

import kcg.edu.ehms.repository.UserRepository
import org.slf4j.LoggerFactory
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.User
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class CustomUserDetailsService(
    private val userRepository: UserRepository
) : UserDetailsService {

    private val log = LoggerFactory.getLogger(javaClass)

    @Transactional(readOnly = true)
    override fun loadUserByUsername(
        username: String
    ): UserDetails {
        val normalizedUsername = username.trim()

        val appUser = userRepository
            .findByUsername(normalizedUsername)
            ?: run {
                log.warn(
                    "Authentication failed: user {} was not found",
                    normalizedUsername
                )

                throw UsernameNotFoundException(
                    "Invalid username or password"
                )
            }

        val authorities = appUser.roles
            .mapNotNull { role ->
                role.name
                    .trim()
                    .takeIf { roleName ->
                        roleName.isNotEmpty()
                    }
            }
            .distinct()
            .sorted()
            .map { roleName ->
                SimpleGrantedAuthority(roleName)
            }

        if (authorities.isEmpty()) {
            log.warn(
                "Authentication failed: user {} has no assigned roles",
                normalizedUsername
            )

            throw UsernameNotFoundException(
                "User has no assigned roles"
            )
        }

        log.debug(
            "Loaded user {} with authorities {}",
            appUser.username,
            authorities.map { authority ->
                authority.authority
            }
        )

        return User
            .withUsername(appUser.username)
            .password(appUser.password)
            .disabled(!appUser.enabled)
            .accountExpired(false)
            .accountLocked(false)
            .credentialsExpired(false)
            .authorities(authorities)
            .build()
    }
}