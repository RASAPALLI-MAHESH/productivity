package com.productivity.controller;

import com.productivity.dto.ApiResponse;
import com.productivity.dto.DashboardDTO;
import com.productivity.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/v1/dashboard")
@Tag(name = "Dashboard", description = "Dashboard aggregation endpoint")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    @Operation(summary = "Get dashboard data (tasks, habits, streaks, stats)")
    public ResponseEntity<ApiResponse<DashboardDTO>> getDashboard(Authentication auth)
            throws ExecutionException, InterruptedException {
        String userId = (String) auth.getPrincipal();
        DashboardDTO dashboard = dashboardService.getDashboard(userId);
        return ResponseEntity.ok(ApiResponse.success(dashboard));
    }
}
