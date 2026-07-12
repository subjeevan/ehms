package kcg.edu.ehms.controller

import kcg.edu.ehms.dto.user.CreateUserRequest
import kcg.edu.ehms.dto.user.UserResponse
import kcg.edu.ehms.dto.user.UserStatusRequest
import kcg.edu.ehms.service.UserService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

/**
 * REST controller for managing user accounts.
 * Handles operations for listing, creating, updating user status, and deleting users.
 * All endpoints require ADMIN role authorization.
 */
@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('ADMIN')")
class UserController(
    private val service: UserService
) {
    /**
     * Retrieves a list of all users.
     */
    @GetMapping
    fun list(): ResponseEntity<List<UserResponse>> = ResponseEntity.ok(service.list())

    /**
     * Creates a new user account with the provided credentials and role assignments.
     */
    @PostMapping
    fun create(@Valid @RequestBody request: CreateUserRequest): ResponseEntity<UserResponse> =
        ResponseEntity.status(HttpStatus.CREATED).body(service.create(request))

    /**
     * Updates the enabled/disabled status of a user account.
     * Tracks which admin user performed the action.
     */
    @PatchMapping("/{id}/status")
    fun setStatus(
        authentication: Authentication,
        @PathVariable id: Long,
        @RequestBody request: UserStatusRequest
    ): ResponseEntity<UserResponse> =
        ResponseEntity.ok(service.setEnabled(id, request.enabled, authentication.name))

    /**
     * Deletes a user account permanently.
     * Tracks which admin user performed the deletion.
     */
    @DeleteMapping("/{id}")
    fun delete(authentication: Authentication, @PathVariable id: Long): ResponseEntity<Void> {
        service.delete(id, authentication.name)
        return ResponseEntity.noContent().build()
    }
}
