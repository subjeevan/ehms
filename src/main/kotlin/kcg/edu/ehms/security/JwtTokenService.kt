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

@Service
class JwtTokenService(
    private val jwtEncoder: JwtEncoder,

    @Value("\${app.jwt.expiration-minutes}")
    private val expirationMinutes: Long
) {

    data class IssuedToken(
        val value: String,
        val expiresAt: Instant
    )

    fun issue(authentication: Authentication): IssuedToken {
        val now = Instant.now()

        val expiresAt = now.plus(
            expirationMinutes,
            ChronoUnit.MINUTES
        )

        /*
         * GrantedAuthority.authority may be treated as String?
         * by Kotlin. mapNotNull removes any null or blank values
         * before sorting.
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