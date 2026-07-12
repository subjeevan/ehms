package kcg.edu.ehms.exception

import java.time.Instant

/**
 * Standard API error response data class used across the application.
 * Contains HTTP status, error type, message, request path, and optional field-level validation errors.
 */
data class ApiError(
    val timestamp: Instant = Instant.now(),
    val status: Int,
    val error: String,
    val message: String,
    val path: String,
    val fieldErrors: Map<String, String>? = null
)
