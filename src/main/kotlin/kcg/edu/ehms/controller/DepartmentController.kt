package kcg.edu.ehms.controller

import kcg.edu.ehms.dto.setup.DepartmentRequest
import kcg.edu.ehms.dto.setup.DepartmentResponse
import kcg.edu.ehms.service.DepartmentService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

/**
 * REST controller for managing hospital departments.
 * Handles CRUD operations for department creation, retrieval, updating, and deletion.
 * All endpoints require ADMIN role authorization.
 */
@RestController
@RequestMapping("/api/departments")
@PreAuthorize("hasRole('ADMIN')")
class DepartmentController(
    private val service: DepartmentService
) {
    /**
     * Retrieves a list of all departments.
     */
    @GetMapping
    fun list(): ResponseEntity<List<DepartmentResponse>> = ResponseEntity.ok(service.list())

    /**
     * Creates a new department with name and description.
     */
    @PostMapping
    fun create(@Valid @RequestBody request: DepartmentRequest): ResponseEntity<DepartmentResponse> =
        ResponseEntity.status(HttpStatus.CREATED).body(service.create(request))

    /**
     * Updates an existing department's information.
     */
    @PutMapping("/{id}")
    fun update(@PathVariable id: Long, @Valid @RequestBody request: DepartmentRequest): ResponseEntity<DepartmentResponse> =
        ResponseEntity.ok(service.update(id, request))

    /**
     * Deletes a department permanently.
     */
    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long): ResponseEntity<Void> {
        service.delete(id)
        return ResponseEntity.noContent().build()
    }
}
