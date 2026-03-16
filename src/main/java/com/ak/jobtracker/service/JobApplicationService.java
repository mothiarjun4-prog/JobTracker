package com.ak.jobtracker.service;

import com.ak.jobtracker.entities.ApplicationStatus;
import com.ak.jobtracker.entities.JobApplication;
import com.ak.jobtracker.entities.User;
import com.ak.jobtracker.repository.JobApplicationRepo;
import com.ak.jobtracker.repository.UserRepo;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class JobApplicationService {

    @Autowired
    private JobApplicationRepo applicationRepo;

    @Autowired
    private UserRepo userRepo;

    public List<JobApplication> getUserApplications(Long userId) {
        return applicationRepo.findByUserId(userId);
    }

    public JobApplication createApplication(Long userId, String companyName, JobApplication application) {
        // 1. Fetch the user or throw an error if not found
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        // 2. Map the data from the React frontend
        application.setUser(user);
        application.setCompanyName(companyName);

        // 3. Set defaults for new applications
        if (application.getStatus() == null) {
            application.setStatus(ApplicationStatus.PENDING);
        }
        if (application.getAppliedDate() == null) {
            application.setAppliedDate(LocalDate.now());
        }

        return applicationRepo.save(application);
    }

    @Transactional
    public JobApplication updateStatus(Long id, ApplicationStatus newStatus) {
        JobApplication application = applicationRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        application.setStatus(newStatus);
        return applicationRepo.save(application);
    }

    public void deleteApplication(Long id) {
        if (!applicationRepo.existsById(id)) {
            throw new RuntimeException("Cannot delete: Application does not exist");
        }
        applicationRepo.deleteById(id);
    }
}