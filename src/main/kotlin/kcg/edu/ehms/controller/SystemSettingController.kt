package kcg.edu.ehms.controller

import kcg.edu.ehms.dto.setup.SystemSettingRequest
import kcg.edu.ehms.dto.setup.SystemSettingResponse
import kcg.edu.ehms.service.SystemSettingService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

/**
 * REST controller for managing system-wide settings and configurations.
 * Handles CRUD operations for system settings like hospital name, contact info, etc.
 * All endpoints require ADMIN role authorization.
 */
@RestController
@RequestMapping("/api/settings")
@PreAuthorize("hasRole('ADMIN')")
class SystemSettingController(
    private val service: SystemSettingService
) {
    /**
     * Retrieves all system settings.
     */
    @GetMapping
    fun list(): ResponseEntity<List<SystemSettingResponse>> = ResponseEntity.ok(service.list())

    /**
     * Creates a new system setting with key and value.
     */
    @PostMapping
    fun create(@Valid @RequestBody request: SystemSettingRequest): ResponseEntity<SystemSettingResponse> =
        ResponseEntity.status(HttpStatus.CREATED).body(service.create(request))

    /**
     * Updates an existing system setting's value.
     */
    @PutMapping("/{id}")
    fun update(@PathVariable id: Long, @Valid @RequestBody request: SystemSettingRequest): ResponseEntity<SystemSettingResponse> =
        ResponseEntity.ok(service.update(id, request))

    /**
     * Deletes a system setting permanently.
     */
    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long): ResponseEntity<Void> {
        service.delete(id)
        return ResponseEntity.noContent().build()
    }
}
