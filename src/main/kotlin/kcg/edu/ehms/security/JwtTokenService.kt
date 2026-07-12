package kcg.edu.ehms.security

import org.springframework.beans.factory.annotation.Value
import org.springframework.security.core.Authentication
import org.springframework.security.oauth2.jose.jws.MacAlgorithm
import org.springframework.security.oauth2.jwt.JwtClaimsSet
import org.springframework.security.oauth2.jwt.JwtEncoder
import org.springframework.security.oauth2.jwt.JwtEncoderParameters
import org.springframework.security.oauth2.jwt.JwsHeader
import org.springframework.stereotype.Service
import java.time.Instant
import java.time.temporal.ChronoUnit

/**
 * Service for generating and managing JWT tokens for authentication.
 * Creates JWT tokens with user identity and roles based on Spring Security authentication.
 */
@Service
class JwtTokenService(
    private val jwtEncoder: JwtEncoder,

    @Value("\${app.jwt.expiration-minutes}")
    private val expirationMinutes: Long
) {

    /**
     * Data class representing an issued JWT token with its value and expiration time.
     */
    data class IssuedToken(
        val value: String,
        val expiresAt: Instant
    )

    /**
     * Issues a new JWT token for the authenticated user.
     * Embeds user identity, roles, and expiration time in the token.
     * Uses HMAC-SHA256 algorithm for signing.
     */
    fun issue(authentication: Authentication): IssuedToken {
        val now = Instant.now()

        val expiresAt = now.plus(
            expirationMinutes,
            ChronoUnit.MINUTES
        )

        val roles: List<String> = authentication.authorities
            .mapNotNull { grantedAuthority ->
                grantedAuthority.authority
                    ?.trim()
                    ?.takeIf { authorityName ->
                        authorityName.isNotEmpty()
                    }
            }
            .sorted()

        val claims = JwtClaimsSet.builder()
            .issuer("hms-api")
            .issuedAt(now)
            .expiresAt(expiresAt)
            .subject(authentication.requiredUsername())
            .claim("roles", roles)
            .build()

        val header = JwsHeader
            .with(MacAlgorithm.HS256)
            .type("JWT")
            .build()

        val encoderParameters = JwtEncoderParameters.from(
            header,
            claims
        )

        val encodedJwt = jwtEncoder.encode(encoderParameters)

        return IssuedToken(
            value = encodedJwt.tokenValue,
            expiresAt = expiresAt
        )
    }
}