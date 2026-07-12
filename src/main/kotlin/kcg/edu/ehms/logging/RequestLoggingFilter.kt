package kcg.edu.ehms.logging

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.core.Ordered
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

/**
 * HTTP request logging filter that logs all incoming HTTP requests with their response status and execution time.
 * This filter intercepts every HTTP request to capture metrics like method, URI, response status, and duration.
 * It executes early in the filter chain to ensure all requests are logged.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
class RequestLoggingFilter : OncePerRequestFilter() {
    private val log = LoggerFactory.getLogger(javaClass)

    /**
     * Filters the HTTP request/response and logs request details with response status and duration.
     * Measures the time taken to process the request and logs the HTTP method, URI, response status,
     * execution time in milliseconds, and the client's IP address.
     */
    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val started = System.currentTimeMillis()
        try {
            filterChain.doFilter(request, response)
        } finally {
            val duration = System.currentTimeMillis() - started
            log.info(
                "HTTP {} {} -> {} ({} ms) from {}",
                request.method,
                request.requestURI,
                response.status,
                duration,
                request.remoteAddr
            )
        }
    }
}
