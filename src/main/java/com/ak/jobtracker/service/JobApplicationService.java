package com.ak.jobtracker.service;

import com.ak.jobtracker.entities.ApplicationStatus;
import com.ak.jobtracker.entities.Company;
import com.ak.jobtracker.entities.JobApplication;
import com.ak.jobtracker.entities.User;
import com.ak.jobtracker.repository.JobApplicationRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class JobApplicationService {

    private final JobApplicationRepo applicationRepository;
    private final CompanyService companyService;
    private final UserService userService;

    public JobApplication createApplication(Long userId, String companyName, JobApplication app) {
        User user = userService.getUserById(userId);
        Company company = companyService.getOrCreateCompany(companyName);

        app.setUser(user);
        app.setCompany(company);

        if (app.getAppliedDate() == null) {
            app.setAppliedDate(LocalDate.now());
        }

        return applicationRepository.save(app);
    }

    public List<JobApplication> getUserApplications(Long userId) {
        return applicationRepository.findByUserId(userId);
    }

    public JobApplication updateStatus(Long applicationId, ApplicationStatus newStatus) {
        JobApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        app.setStatus(newStatus);
        return applicationRepository.save(app);
    }
}