package kcg.edu.ehms.exception

class ResourceNotFoundException(message: String) : RuntimeException(message)
class DuplicateEntryException(message: String) : RuntimeException(message)
class BusinessValidationException(
    message: String,
    val fieldErrors: Map<String, String> = emptyMap()
) : RuntimeException(message)
