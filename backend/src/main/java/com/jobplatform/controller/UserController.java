package com.jobplatform.controller;

import com.jobplatform.model.User;
import com.jobplatform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @GetMapping("/profile")
    public ResponseEntity<User> getProfile(Authentication authentication) {
        String identifier = authentication.getName();
        User user = userRepository.findByUsernameOrEmail(identifier, identifier)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(null); // Never send the hash to the frontend
        return ResponseEntity.ok(user);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody User updatedData, Authentication authentication) {
        String identifier = authentication.getName();
        User existingUser = userRepository.findByUsernameOrEmail(identifier, identifier).orElseThrow();

        existingUser.setFullName(updatedData.getFullName());
        existingUser.setEmail(updatedData.getEmail());
        existingUser.setPhoneNumber(updatedData.getPhoneNumber());

        userRepository.save(existingUser);
        return ResponseEntity.ok().body("{\"message\": \"Profile updated successfully\"}");
    }

    // NEW: Secure Password Update Endpoint
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> passwords, Authentication authentication) {
        String identifier = authentication.getName();
        User user = userRepository.findByUsernameOrEmail(identifier, identifier).orElseThrow();

        String currentPassword = passwords.get("currentPassword");
        String newPassword = passwords.get("newPassword");

        // Verify the old password matches the database hash
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            return ResponseEntity.badRequest().body("Current password is incorrect.");
        }

        // Hash the new password and save
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return ResponseEntity.ok().body("{\"message\": \"Password updated successfully!\"}");
    }
}