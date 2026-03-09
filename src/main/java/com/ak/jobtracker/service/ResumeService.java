package com.ak.jobtracker.service;

import com.ak.jobtracker.entities.Resume;
import com.ak.jobtracker.entities.User;
import com.ak.jobtracker.repository.ResumeRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ResumeService {

    private final ResumeRepo resumeRepository;

    public Resume uploadResume(User user, String fileName, String version) {
        Resume resume = new Resume();
        resume.setUser(user);
        resume.setFileName(fileName);
        resume.setVersionTag(version);
        resume.setUploadedAt(LocalDateTime.now());
        return resumeRepository.save(resume);
    }

    public List<Resume> getResumesForUser(Long userId) {
        return resumeRepository.findByUserId(userId);
    }
}