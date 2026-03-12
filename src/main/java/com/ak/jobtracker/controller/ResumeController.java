package com.ak.jobtracker.controller;

import com.ak.jobtracker.entities.Resume;
import com.ak.jobtracker.entities.User;
import com.ak.jobtracker.service.ResumeService;
import com.ak.jobtracker.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/resumes")
public class ResumeController {

    private final ResumeService resumeService;
    private final UserService userService;

    public ResumeController(ResumeService resumeService, UserService userService) {
        this.resumeService = resumeService;
        this.userService = userService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Resume>> getResumes(@PathVariable Long userId) {
        return ResponseEntity.ok(resumeService.getResumesForUser(userId));
    }

    @PostMapping("/user/{userId}/upload")
    public ResponseEntity<Resume> upload(
            @PathVariable Long userId,
            @RequestParam String fileName,
            @RequestParam String version) {
        User user = userService.getUserById(userId);
        return new ResponseEntity<>(
                resumeService.uploadResume(user, fileName, version),
                HttpStatus.CREATED
        );
    }
}