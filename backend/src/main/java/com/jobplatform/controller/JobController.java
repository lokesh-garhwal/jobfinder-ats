package com.jobplatform.controller;
import com.jobplatform.model.Job;
import com.jobplatform.model.User;
import com.jobplatform.repository.JobRepository;
import com.jobplatform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "http://localhost:5173")
public class JobController {

    @Autowired private JobRepository jobRepository;
    @Autowired private UserRepository userRepository;

    @GetMapping
    public List<Job> getPublicJobs() {
        // Only return Active or Paused jobs to candidates
        return jobRepository.findByStatusNot("CLOSED");
    }

    @GetMapping("/{id}")
    public ResponseEntity<Job> getJobById(@PathVariable Long id) {
        return jobRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/my-jobs")
    public List<Job> getMyJobs(Authentication authentication) {
        String username = authentication.getName();
        User employer = userRepository.findByUsernameOrEmail(username, username).get();
        return jobRepository.findAll().stream()
                .filter(job -> job.getEmployerId().equals(employer.getId()))
                .toList();
    }

    @PostMapping
    public Job createJob(@RequestBody Job job, Authentication authentication) {
        String username = authentication.getName();
        User employer = userRepository.findByUsernameOrEmail(username, username).get();
        job.setEmployerId(employer.getId());
        return jobRepository.save(job);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateJobStatus(@PathVariable Long id, @RequestParam String status, Authentication authentication) {
        String username = authentication.getName();
        User employer = userRepository.findByUsernameOrEmail(username, username).get();
        Job job = jobRepository.findById(id).orElse(null);

        if (job == null || !job.getEmployerId().equals(employer.getId())) {
            return ResponseEntity.status(403).body("Unauthorized");
        }

        job.setStatus(status.toUpperCase());
        jobRepository.save(job);
        return ResponseEntity.ok().body("{\"message\": \"Status updated\"}");
    }
}