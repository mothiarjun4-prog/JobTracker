package com.ak.jobtracker.repository;

import com.ak.jobtracker.entities.Resume;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ResumeRepo extends JpaRepository<Resume,Long> {

    List<Resume> findByUserId(Long userId);

    Optional<Resume> findFirstByUserIdOrderByUploadedAtDesc(Long userId);

}
