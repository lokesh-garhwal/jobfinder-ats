package com.jobplatform.controller;
import com.jobplatform.model.User;
import com.jobplatform.repository.UserRepository;
import com.jobplatform.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public String register(@RequestBody User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        return "User registered successfully!";
    }

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody Map<String, String> loginData) {
        String identifier = loginData.get("identifier");
        String password = loginData.get("password");

        // Authenticate using the identifier (which can be either username or email)
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(identifier, password));

        User foundUser = userRepository.findByUsernameOrEmail(identifier, identifier).get();
        String token = jwtUtil.generateToken(foundUser.getUsername(), foundUser.getRole().name());

        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("role", foundUser.getRole().name());
        response.put("name", foundUser.getFullName());
        return response;
    }
}