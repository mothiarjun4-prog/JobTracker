package com.ak.jobtracker.repository;

import com.ak.jobtracker.entities.ApplicationStatus;
import com.ak.jobtracker.entities.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface JobApplicationRepo extends JpaRepository<JobApplication,Long> {

    List<JobApplication> findByUserId(Long userId);

    List<JobApplication> findByUserIdAndStatus(Long userId, ApplicationStatus status);

    long countByUserId(Long userId);

    // Search applications by job title or company name
    @Query("SELECT j FROM JobApplication j WHERE j.user.id = :userId AND " +
            "(LOWER(j.jobTitle) LIKE LOWER(concat('%', :keyword, '%')) OR " +
            "LOWER(j.company.name) LIKE LOWER(concat('%', :keyword, '%')))")
    List<JobApplication> searchApplications(Long userId, String keyword);


}
