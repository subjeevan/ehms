package kcg.edu.ehms.controller

import kcg.edu.ehms.dto.dashboard.DashboardSummaryResponse
import kcg.edu.ehms.dto.dashboard.EarningsOverviewResponse
import kcg.edu.ehms.service.DashboardService
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

/**
 * REST controller for dashboard functionality.
 * Provides summary statistics and metrics for the EHMS system.
 */
@RestController
@RequestMapping("/api/dashboard")
class DashboardController(
    private val dashboardService: DashboardService
) {
    /**
     * Retrieves dashboard summary with key metrics like total patients, doctors, and bills.
     * Requires ADMIN or USER role.
     */
    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    fun summary(): ResponseEntity<DashboardSummaryResponse> = ResponseEntity.ok(dashboardService.summary())

    /**
     * Retrieves earnings overview with daily, monthly, and total earnings broken down by patient type.
     * Requires ADMIN role.
     */
    @GetMapping("/earnings")
    @PreAuthorize("hasRole('ADMIN')")
    fun earnings(): ResponseEntity<EarningsOverviewResponse> = ResponseEntity.ok(dashboardService.earningsOverview())
}

