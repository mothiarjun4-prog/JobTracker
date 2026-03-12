package com.ak.jobtracker.controller;

import com.ak.jobtracker.entities.ApplicationStatus;
import com.ak.jobtracker.entities.JobApplication;
import com.ak.jobtracker.service.JobApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/applications")
public class JobApplicationController {

    @Autowired
    JobApplicationService applicationService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<JobApplication>> getByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(applicationService.getUserApplications(userId));
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<JobApplication> create(
            @PathVariable Long userId,
            @RequestBody JobApplication application) {
        // Take companyName directly from the application object
        return new ResponseEntity<>(
                applicationService.createApplication(userId, application.getCompanyName(), application),
                HttpStatus.CREATED
        );
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<JobApplication> updateStatus(
            @PathVariable Long id,
            @RequestParam ApplicationStatus status) {
        return ResponseEntity.ok(applicationService.updateStatus(id, status));
    }
}