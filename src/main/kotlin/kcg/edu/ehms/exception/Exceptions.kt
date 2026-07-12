package kcg.edu.ehms.exception

/**
 * Custom exceptions used throughout the EHMS application.
 * ResourceNotFoundException: Thrown when a requested resource is not found in the database.
 * DuplicateEntryException: Thrown when attempting to create a duplicate record.
 * BusinessValidationException: Thrown for business logic validation failures with optional field-level errors.
 */

class ResourceNotFoundException(message: String) : RuntimeException(message)
class DuplicateEntryException(message: String) : RuntimeException(message)
class BusinessValidationException(
    message: String,
    val fieldErrors: Map<String, String> = emptyMap()
) : RuntimeException(message)
