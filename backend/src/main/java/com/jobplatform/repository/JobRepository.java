package com.jobplatform.repository;
import com.jobplatform.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {
    // Only fetch jobs that are NOT closed for the public feed
    List<Job> findByStatusNot(String status);
}