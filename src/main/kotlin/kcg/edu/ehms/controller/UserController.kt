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

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('ADMIN')")
class UserController(
    private val service: UserService
) {
    @GetMapping
    fun list(): ResponseEntity<List<UserResponse>> = ResponseEntity.ok(service.list())

    @PostMapping
    fun create(@Valid @RequestBody request: CreateUserRequest): ResponseEntity<UserResponse> =
        ResponseEntity.status(HttpStatus.CREATED).body(service.create(request))

    @PatchMapping("/{id}/status")
    fun setStatus(
        authentication: Authentication,
        @PathVariable id: Long,
        @RequestBody request: UserStatusRequest
    ): ResponseEntity<UserResponse> =
        ResponseEntity.ok(service.setEnabled(id, request.enabled, authentication.name))

    @DeleteMapping("/{id}")
    fun delete(authentication: Authentication, @PathVariable id: Long): ResponseEntity<Void> {
        service.delete(id, authentication.name)
        return ResponseEntity.noContent().build()
    }
}
