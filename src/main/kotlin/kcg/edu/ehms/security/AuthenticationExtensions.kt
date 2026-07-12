package kcg.edu.ehms.security

import org.springframework.security.core.Authentication

/**
 * Extension function to safely extract username from Spring Security Authentication object.
 * Throws IllegalStateException if the username is missing or empty.
 */
fun Authentication.requiredUsername(): String =
    name?.trim()?.takeIf { it.isNotEmpty() }
        ?: throw IllegalStateException(
            "Authenticated principal name is missing"
        )