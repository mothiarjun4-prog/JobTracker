package com.ak.jobtracker.controller;

import com.ak.jobtracker.entities.Resume;
import com.ak.jobtracker.entities.User;
import com.ak.jobtracker.service.ResumeService;
import com.ak.jobtracker.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/resumes")
public class ResumeController {

    @Autowired
    private ResumeService resumeService;
    @Autowired
    private UserService userService;


    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Resume>> getResumes(@PathVariable Long userId) {
        return ResponseEntity.ok(resumeService.getResumesForUser(userId));
    }

    @PostMapping("/user/{userId}/upload")
    public ResponseEntity<Resume> upload(
            @PathVariable Long userId,
            @RequestParam("file") MultipartFile file) { // Matches React formData.append('file', ...)

        User user = userService.getUserById(userId);
        return new ResponseEntity<>(
                resumeService.uploadResume(user, file),
                HttpStatus.CREATED
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteResume(@PathVariable Long id) {
        boolean isDeleted = resumeService.deleteResume(id);
        if (isDeleted) {
            return ResponseEntity.ok("Resume deleted successfully");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Resume not found");
        }
    }
}