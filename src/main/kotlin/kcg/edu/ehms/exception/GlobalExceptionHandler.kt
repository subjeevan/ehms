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

@RestControllerAdvice
class GlobalExceptionHandler {

    private val log = LoggerFactory.getLogger(javaClass)

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