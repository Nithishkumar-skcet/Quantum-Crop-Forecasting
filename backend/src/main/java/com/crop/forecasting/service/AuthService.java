package com.crop.forecasting.service;

import com.crop.forecasting.config.JwtTokenProvider;
import com.crop.forecasting.dto.AuthDto;
import com.crop.forecasting.model.User;
import com.crop.forecasting.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    public AuthDto.JwtAuthResponse register(AuthDto.SignupRequest signupRequest) {
        if (signupRequest.getEmail() == null || signupRequest.getEmail().trim().isEmpty()) {
            throw new RuntimeException("Email address is required!");
        }

        if (signupRequest.getUsername() == null || signupRequest.getUsername().trim().isEmpty()) {
            throw new RuntimeException("Username is required!");
        }

        if (signupRequest.getPassword() == null || signupRequest.getPassword().length() < 6) {
            throw new RuntimeException("Password must be at least 6 characters long!");
        }

        if (userRepository.existsByEmail(signupRequest.getEmail().trim())) {
            throw new RuntimeException("Email address is already registered!");
        }

        if (userRepository.existsByUsername(signupRequest.getUsername().trim())) {
            throw new RuntimeException("Username is already taken!");
        }

        User user = new User(
                signupRequest.getUsername().trim(),
                signupRequest.getEmail().trim(),
                passwordEncoder.encode(signupRequest.getPassword()),
                signupRequest.getFullName() != null ? signupRequest.getFullName().trim() : signupRequest.getUsername().trim()
        );

        userRepository.save(user);

        String token = tokenProvider.generateToken(user.getEmail());
        return new AuthDto.JwtAuthResponse(token, user.getEmail(), user.getUsername(), user.getFullName());
    }

    public AuthDto.JwtAuthResponse login(AuthDto.LoginRequest loginRequest) {
        if (loginRequest.getEmail() == null || loginRequest.getEmail().trim().isEmpty()) {
            throw new RuntimeException("Email address is required!");
        }

        if (loginRequest.getPassword() == null || loginRequest.getPassword().isEmpty()) {
            throw new RuntimeException("Password is required!");
        }

        User user = userRepository.findByEmail(loginRequest.getEmail().trim())
                .orElseThrow(() -> new RuntimeException("Invalid email or password!"));

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password!");
        }

        String token = tokenProvider.generateToken(user.getEmail());
        return new AuthDto.JwtAuthResponse(token, user.getEmail(), user.getUsername(), user.getFullName());
    }

    public Map<String, Object> getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User profile not found!"));

        return Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "email", user.getEmail(),
                "fullName", user.getFullName() != null ? user.getFullName() : "",
                "role", user.getRole(),
                "createdAt", user.getCreatedAt().toString()
        );
    }
}
