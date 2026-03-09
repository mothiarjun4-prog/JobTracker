package com.ak.jobtracker.service;

import com.ak.jobtracker.entities.Company;
import com.ak.jobtracker.repository.CompanyRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepo companyRepo;

    public Company getOrCreateCompany(String name) {
        return companyRepo.findByNameIgnoreCase(name)
                .orElseGet(() -> {
                    Company newCompany = new Company();
                    newCompany.setName(name);
                    return companyRepo.save(newCompany);
                });
    }
}