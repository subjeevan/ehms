package kcg.edu.ehms.controller

import kcg.edu.ehms.dto.setup.DepartmentRequest
import kcg.edu.ehms.dto.setup.DepartmentResponse
import kcg.edu.ehms.service.DepartmentService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/departments")
@PreAuthorize("hasRole('ADMIN')")
class DepartmentController(
    private val service: DepartmentService
) {
    @GetMapping
    fun list(): ResponseEntity<List<DepartmentResponse>> = ResponseEntity.ok(service.list())

    @PostMapping
    fun create(@Valid @RequestBody request: DepartmentRequest): ResponseEntity<DepartmentResponse> =
        ResponseEntity.status(HttpStatus.CREATED).body(service.create(request))

    @PutMapping("/{id}")
    fun update(@PathVariable id: Long, @Valid @RequestBody request: DepartmentRequest): ResponseEntity<DepartmentResponse> =
        ResponseEntity.ok(service.update(id, request))

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long): ResponseEntity<Void> {
        service.delete(id)
        return ResponseEntity.noContent().build()
    }
}
