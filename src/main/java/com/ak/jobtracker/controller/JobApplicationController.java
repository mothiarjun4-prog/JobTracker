package com.ak.jobtracker.controller;

import com.ak.jobtracker.entities.ApplicationStatus;
import com.ak.jobtracker.entities.JobApplication;
import com.ak.jobtracker.service.JobApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/applications")
public class JobApplicationController {

    @Autowired
    private JobApplicationService applicationService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<JobApplication>> getByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(applicationService.getUserApplications(userId));
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<JobApplication> create(
            @PathVariable Long userId,
            @RequestBody JobApplication application) {
        return new ResponseEntity<>(
                applicationService.createApplication(userId, application.getCompanyName(), application),
                HttpStatus.CREATED
        );
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusUpdate) {

        String statusStr = statusUpdate.get("status");

        // Log for debugging
        System.out.println("Received status update request for ID: " + id);
        System.out.println("Status string received: [" + statusStr + "]");

        if (statusStr == null) return ResponseEntity.badRequest().body("Key 'status' missing");

        try {
            // Convert to uppercase to prevent case-sensitive mismatches
            ApplicationStatus status = ApplicationStatus.valueOf(statusStr.toUpperCase());
            return ResponseEntity.ok(applicationService.updateStatus(id, status));
        } catch (IllegalArgumentException e) {
            System.err.println("Failed to map status: " + statusStr);
            return ResponseEntity.badRequest().body("Invalid status: " + statusStr);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplication(@PathVariable Long id) {
        applicationService.deleteApplication(id);
        return ResponseEntity.noContent().build();
    }
}