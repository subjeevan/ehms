package kcg.edu.ehms.security

import kcg.edu.ehms.exception.ApiError
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.http.MediaType
import org.springframework.security.core.AuthenticationException
import org.springframework.security.web.AuthenticationEntryPoint
import org.springframework.stereotype.Component
import tools.jackson.databind.json.JsonMapper

@Component
class JsonAuthenticationEntryPoint(
    private val jsonMapper: JsonMapper
) : AuthenticationEntryPoint {

    override fun commence(
        request: HttpServletRequest,
        response: HttpServletResponse,
        authException: AuthenticationException
    ) {
        response.status =
            HttpServletResponse.SC_UNAUTHORIZED

        response.contentType =
            MediaType.APPLICATION_JSON_VALUE

        response.characterEncoding =
            Charsets.UTF_8.name()

        val apiError = ApiError(
            status = HttpServletResponse.SC_UNAUTHORIZED,
            error = "Unauthorized",
            message =
                "Authentication is required or the token has expired",
            path = request.requestURI
        )

        jsonMapper.writeValue(
            response.outputStream,
            apiError
        )
    }
}