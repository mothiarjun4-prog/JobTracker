package com.ak.jobtracker.service;

import com.ak.jobtracker.entities.ApplicationStatus;
import com.ak.jobtracker.entities.JobApplication;
import com.ak.jobtracker.entities.User;
import com.ak.jobtracker.repository.JobApplicationRepo;
import com.ak.jobtracker.repository.UserRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class JobApplicationService {

    private final UserRepo userRepo;
    private final JobApplicationRepo applicationRepo;
    private final CompanyService companyService;
    private final UserService userService;

    public JobApplication createApplication(Long userId, String companyName, JobApplication application) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        application.setUser(user);
        application.setCompanyName(companyName);
        application.setAppliedDate(LocalDate.now());

        // Fallback if status isn't sent from frontend
        if (application.getStatus() == null) {
            application.setStatus(ApplicationStatus.PENDING);
        }

        return applicationRepo.save(application);
    }
    public List<JobApplication> getUserApplications(Long userId) {
        return applicationRepo.findByUserId(userId);
    }

    public JobApplication updateStatus(Long applicationId, ApplicationStatus newStatus) {
        JobApplication app = applicationRepo.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        app.setStatus(newStatus);
        return applicationRepo.save(app);
    }
}