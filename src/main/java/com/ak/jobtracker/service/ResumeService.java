package com.ak.jobtracker.service;

import com.ak.jobtracker.entities.Resume;
import com.ak.jobtracker.entities.User;
import com.ak.jobtracker.repository.ResumeRepo;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class ResumeService {

    @Autowired
    private ResumeRepo resumeRepo;


    public List<Resume> getResumesForUser(Long userId) {
        return resumeRepo.findByUserId(userId);
    }

    public Resume uploadResume(User user, MultipartFile file) {
        // 1. Calculate version based on existing user records
        long count = resumeRepo.countByUserId(user.getId());
        String version = "v" + (count + 1);

        Resume resume = Resume.builder()
                .fileName(file.getOriginalFilename())
                .versionTag(version)
                .user(user)
                .build();

        return resumeRepo.save(resume);
    }

    @Transactional
    public boolean deleteResume(Long id) {
        return resumeRepo.findById(id).map(resume -> {
            resumeRepo.delete(resume);
            return true;
        }).orElse(false);
    }
}