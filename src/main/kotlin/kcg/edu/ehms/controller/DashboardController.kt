package kcg.edu.ehms.controller

import kcg.edu.ehms.dto.dashboard.DashboardSummaryResponse
import kcg.edu.ehms.service.DashboardService
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/dashboard")
class DashboardController(
    private val dashboardService: DashboardService
) {
    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    fun summary(): ResponseEntity<DashboardSummaryResponse> = ResponseEntity.ok(dashboardService.summary())
}
