package com.ak.jobtracker.repository;

import com.ak.jobtracker.entities.Company;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.*;

public interface CompanyRepo extends JpaRepository<Company, Long> {

    Optional<Company> findByNameIgnoreCase(String name);

    List<Company> findByNameContaining(String name);

}
