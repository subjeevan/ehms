package kcg.edu.ehms.exception

import jakarta.servlet.http.HttpServletRequest
import jakarta.validation.ConstraintViolationException
import org.slf4j.LoggerFactory
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.core.AuthenticationException
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

/**
 * Global exception handler for the entire EHMS application.
 * Catches and handles various exceptions, returning consistent JSON error responses.
 * Provides proper HTTP status codes and logging for different error scenarios.
 */
@RestControllerAdvice
class GlobalExceptionHandler {

    private val log = LoggerFactory.getLogger(javaClass)

    /**
     * Handles request validation failures (missing/invalid fields).
     * Returns 400 Bad Request with field-level error details.
     */
    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidation(
        exception: MethodArgumentNotValidException,
        request: HttpServletRequest
    ): ResponseEntity<ApiError> {
        val fieldErrors = exception.bindingResult
            .fieldErrors
            .associate { fieldError ->
                fieldError.field to (
                        fieldError.defaultMessage
                            ?: "Invalid value"
                        )
            }

        return createErrorResponse(
            status = HttpStatus.BAD_REQUEST,
            message = "Validation failed",
            request = request,
            fieldErrors = fieldErrors
        )
    }

    /**
     * Handles JSR-303 bean validation constraint violations.
     * Returns 400 Bad Request with constraint violation details.
     */
    @ExceptionHandler(ConstraintViolationException::class)
    fun handleConstraintViolation(
        exception: ConstraintViolationException,
        request: HttpServletRequest
    ): ResponseEntity<ApiError> {
        val fieldErrors = exception.constraintViolations
            .associate { violation ->
                violation.propertyPath.toString() to
                        violation.message
            }

        return createErrorResponse(
            status = HttpStatus.BAD_REQUEST,
            message = "Validation failed",
            request = request,
            fieldErrors = fieldErrors
        )
    }

    /**
     * Handles malformed request bodies (invalid JSON, etc).
     * Returns 400 Bad Request with a generic message about malformed content.
     */
    @ExceptionHandler(HttpMessageNotReadableException::class)
    fun handleUnreadableMessage(
        exception: HttpMessageNotReadableException,
        request: HttpServletRequest
    ): ResponseEntity<ApiError> {
        log.warn(
            "Malformed request body at {}: {}",
            request.requestURI,
            exception.message
        )

        return createErrorResponse(
            status = HttpStatus.BAD_REQUEST,
            message = "Malformed or invalid request body",
            request = request
        )
    }

    /**
     * Handles custom business validation exceptions.
     * Returns 400 Bad Request with optional field-level error details.
     */
    @ExceptionHandler(BusinessValidationException::class)
    fun handleBusinessValidation(
        exception: BusinessValidationException,
        request: HttpServletRequest
    ): ResponseEntity<ApiError> {
        return createErrorResponse(
            status = HttpStatus.BAD_REQUEST,
            message = exception.message
                ?: "Validation failed",
            request = request,
            fieldErrors = exception.fieldErrors
        )
    }

    /**
     * Handles resource not found exceptions.
     * Returns 404 Not Found when a requested resource doesn't exist.
     */
    @ExceptionHandler(ResourceNotFoundException::class)
    fun handleNotFound(
        exception: ResourceNotFoundException,
        request: HttpServletRequest
    ): ResponseEntity<ApiError> {
        return createErrorResponse(
            status = HttpStatus.NOT_FOUND,
            message = exception.message
                ?: "Resource not found",
            request = request
        )
    }

    /**
     * Handles duplicate entry exceptions.
     * Returns 409 Conflict when attempting to create a duplicate record.
     */
    @ExceptionHandler(DuplicateEntryException::class)
    fun handleDuplicate(
        exception: DuplicateEntryException,
        request: HttpServletRequest
    ): ResponseEntity<ApiError> {
        return createErrorResponse(
            status = HttpStatus.CONFLICT,
            message = exception.message
                ?: "Duplicate entry",
            request = request
        )
    }

    /**
     * Handles authentication failures.
     * Returns 401 Unauthorized and logs the authentication attempt.
     */
    @ExceptionHandler(AuthenticationException::class)
    fun handleAuthentication(
        exception: AuthenticationException,
        request: HttpServletRequest
    ): ResponseEntity<ApiError> {
        log.warn(
            "Authentication failed at {} from {}: {}",
            request.requestURI,
            request.remoteAddr,
            exception.javaClass.simpleName
        )

        return createErrorResponse(
            status = HttpStatus.UNAUTHORIZED,
            message = "Invalid username or password",
            request = request
        )
    }

    /**
     * Handles access denied exceptions (insufficient permissions).
     * Returns 403 Forbidden and logs the access denial.
     */
    @ExceptionHandler(AccessDeniedException::class)
    fun handleAccessDenied(
        exception: AccessDeniedException,
        request: HttpServletRequest
    ): ResponseEntity<ApiError> {
        log.warn(
            "Access denied at {}: {}",
            request.requestURI,
            exception.message
        )

        return createErrorResponse(
            status = HttpStatus.FORBIDDEN,
            message =
                "You do not have permission to perform this action",
            request = request
        )
    }

    /**
     * Handles database constraint violations.
     * Returns 409 Conflict when database constraints are violated.
     */
    @ExceptionHandler(DataIntegrityViolationException::class)
    fun handleDataIntegrityViolation(
        exception: DataIntegrityViolationException,
        request: HttpServletRequest
    ): ResponseEntity<ApiError> {
        log.warn(
            "Database constraint violation at {}: {}",
            request.requestURI,
            exception.mostSpecificCause.message
        )

        return createErrorResponse(
            status = HttpStatus.CONFLICT,
            message =
                "The operation conflicts with existing data",
            request = request
        )
    }

    /**
     * Catch-all handler for unexpected exceptions.
     * Returns 500 Internal Server Error and logs the full exception stack trace.
     */
    @ExceptionHandler(Exception::class)
    fun handleUnexpected(
        exception: Exception,
        request: HttpServletRequest
    ): ResponseEntity<ApiError> {
        log.error(
            "Unexpected error at {}",
            request.requestURI,
            exception
        )

        return createErrorResponse(
            status = HttpStatus.INTERNAL_SERVER_ERROR,
            message = "An unexpected error occurred",
            request = request
        )
    }

    /**
     * Helper method to create a consistent error response with proper HTTP status and message formatting.
     */
    private fun createErrorResponse(
        status: HttpStatus,
        message: String,
        request: HttpServletRequest,
        fieldErrors: Map<String, String>? = null
    ): ResponseEntity<ApiError> {
        val response = ApiError(
            status = status.value(),
            error = status.reasonPhrase,
            message = message,
            path = request.requestURI,
            fieldErrors = fieldErrors
                ?.takeIf { it.isNotEmpty() }
        )

        return ResponseEntity
            .status(status)
            .body(response)
    }
}