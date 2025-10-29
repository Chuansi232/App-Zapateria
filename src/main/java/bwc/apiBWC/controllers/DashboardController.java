package bwc.apiBWC.controllers;

import bwc.apiBWC.dtos.DashboardStatsDto;
import bwc.apiBWC.services.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('VENDEDOR') or hasRole('ALMACENISTA')")
    public DashboardStatsDto getDashboardStats() {
        return dashboardService.getDashboardStats();
    }
}