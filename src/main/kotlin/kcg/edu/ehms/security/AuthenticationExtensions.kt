package kcg.edu.ehms.security

import org.springframework.security.core.Authentication

fun Authentication.requiredUsername(): String =
    name?.trim()?.takeIf { it.isNotEmpty() }
        ?: throw IllegalStateException(
            "Authenticated principal name is missing"
        )