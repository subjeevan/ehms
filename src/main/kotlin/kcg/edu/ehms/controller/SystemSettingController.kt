package kcg.edu.ehms.controller

import kcg.edu.ehms.dto.setup.SystemSettingRequest
import kcg.edu.ehms.dto.setup.SystemSettingResponse
import kcg.edu.ehms.service.SystemSettingService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/settings")
@PreAuthorize("hasRole('ADMIN')")
class SystemSettingController(
    private val service: SystemSettingService
) {
    @GetMapping
    fun list(): ResponseEntity<List<SystemSettingResponse>> = ResponseEntity.ok(service.list())

    @PostMapping
    fun create(@Valid @RequestBody request: SystemSettingRequest): ResponseEntity<SystemSettingResponse> =
        ResponseEntity.status(HttpStatus.CREATED).body(service.create(request))

    @PutMapping("/{id}")
    fun update(@PathVariable id: Long, @Valid @RequestBody request: SystemSettingRequest): ResponseEntity<SystemSettingResponse> =
        ResponseEntity.ok(service.update(id, request))

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long): ResponseEntity<Void> {
        service.delete(id)
        return ResponseEntity.noContent().build()
    }
}
