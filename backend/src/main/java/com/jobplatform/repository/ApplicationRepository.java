package com.jobplatform.repository;
import com.jobplatform.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByJobId(Long jobId);
    List<Application> findBySeekerId(Long seekerId);
    boolean existsByJobIdAndSeekerId(Long jobId, Long seekerId);
    Optional<Application> findByFeedbackToken(String feedbackToken); // NEW
}