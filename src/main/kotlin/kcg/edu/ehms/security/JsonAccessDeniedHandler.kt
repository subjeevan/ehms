package kcg.edu.ehms.security

import kcg.edu.ehms.exception.ApiError
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.http.MediaType
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.web.access.AccessDeniedHandler
import org.springframework.stereotype.Component
import tools.jackson.databind.json.JsonMapper

@Component
class JsonAccessDeniedHandler(
    private val jsonMapper: JsonMapper
) : AccessDeniedHandler {

    override fun handle(
        request: HttpServletRequest,
        response: HttpServletResponse,
        accessDeniedException: AccessDeniedException
    ) {
        response.status =
            HttpServletResponse.SC_FORBIDDEN

        response.contentType =
            MediaType.APPLICATION_JSON_VALUE

        response.characterEncoding =
            Charsets.UTF_8.name()

        val apiError = ApiError(
            status = HttpServletResponse.SC_FORBIDDEN,
            error = "Forbidden",
            message =
                "You do not have permission to perform this action",
            path = request.requestURI
        )

        jsonMapper.writeValue(
            response.outputStream,
            apiError
        )
    }
}