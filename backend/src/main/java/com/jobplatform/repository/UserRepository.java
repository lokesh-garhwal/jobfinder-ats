package com.jobplatform.repository;
import com.jobplatform.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    // New query to check both fields!
    Optional<User> findByUsernameOrEmail(String username, String email);
}