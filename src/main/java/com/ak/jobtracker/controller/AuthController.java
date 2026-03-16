package com.ak.jobtracker.controller;

import com.ak.jobtracker.component.JwtUtils;
import com.ak.jobtracker.dto.AuthResponse;
import com.ak.jobtracker.dto.LoginRequest;
import com.ak.jobtracker.entities.User;
import com.ak.jobtracker.repository.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173") // Ensure React can connect
public class AuthController {

    private final UserRepo userRepo;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User savedUser = userRepo.save(user);

        // Generate token using the saved user entity
        String token = jwtUtils.generateToken(savedUser);
        return ResponseEntity.ok(new AuthResponse(token, savedUser.getId()));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> authenticateUser(@RequestBody LoginRequest loginRequest) {
        // 1. Authenticate the user
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        // 2. Fetch the user entity from DB to get the ID and Full Name for the token
        User user = userRepo.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        // 3. Generate token using the JwtUtils method we updated
        String jwt = jwtUtils.generateToken(user);

        return ResponseEntity.ok(new AuthResponse(jwt, user.getId()));
    }
}