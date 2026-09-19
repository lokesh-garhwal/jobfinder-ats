package com.jobplatform.controller;

import com.jobplatform.model.Application;
import com.jobplatform.model.Job;
import com.jobplatform.model.User;
import com.jobplatform.repository.ApplicationRepository;
import com.jobplatform.repository.JobRepository;
import com.jobplatform.repository.UserRepository;
import com.jobplatform.service.AiResumeService;
import com.jobplatform.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/applications")
//@CrossOrigin(origins = "http://localhost:5173")
public class ApplicationController {

    @Autowired private ApplicationRepository applicationRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private JobRepository jobRepository;
    @Autowired private AiResumeService aiResumeService;
    @Autowired private EmailService emailService;

    @GetMapping("/test-ai")
    public ResponseEntity<?> testGeminiConnection() {
        try {
            Map<String, Object> result = aiResumeService.evaluateResume("I am a Senior Java Developer.", "Need Java.");
            return ResponseEntity.ok().body(result);
        } catch (Exception e) { return ResponseEntity.internalServerError().body("System Error"); }
    }

    @PostMapping(value = "/apply/{jobId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> applyForJob(
            @PathVariable Long jobId,
            @RequestParam("resume") MultipartFile resume,
            @RequestParam(value = "githubLink", required = false) String githubLink,
            @RequestParam(value = "portfolioLink", required = false) String portfolioLink,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            User seeker = userRepository.findByUsernameOrEmail(username, username).get();
            if (applicationRepository.existsByJobIdAndSeekerId(jobId, seeker.getId())) {
                return ResponseEntity.badRequest().body("You have already applied for this job.");
            }

            Job job = jobRepository.findById(jobId).orElseThrow();
            Application app = new Application();
            app.setJobId(jobId);
            app.setSeekerId(seeker.getId());
            app.setGithubLink(githubLink);
            app.setPortfolioLink(portfolioLink);
            app.setResumeName(resume.getOriginalFilename());
            app.setResumeType(resume.getContentType());
            byte[] fileBytes = resume.getBytes();
            app.setResumeData(fileBytes);

            String pdfText = aiResumeService.extractTextFromPdf(fileBytes);
            String jobContext = job.getTitle() + " | " + job.getDescription();
            Map<String, Object> aiResult = aiResumeService.evaluateResume(pdfText, jobContext);
            app.setAiScore((Integer) aiResult.get("score"));
            app.setAiSummary((String) aiResult.get("summary"));

            applicationRepository.save(app);
            return ResponseEntity.ok().body("{\"message\": \"Successfully applied!\"}");
        } catch (Exception e) { return ResponseEntity.internalServerError().body("Failed to upload resume."); }
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<?> getApplicationsForJob(@PathVariable Long jobId, Authentication authentication) {
        String username = authentication.getName();
        User employer = userRepository.findByUsernameOrEmail(username, username).get();
        Job job = jobRepository.findById(jobId).orElse(null);
        if (job == null || !job.getEmployerId().equals(employer.getId())) return ResponseEntity.status(403).build();

        List<Application> apps = applicationRepository.findByJobId(jobId);
        apps.forEach(app -> {
            User seeker = userRepository.findById(app.getSeekerId()).orElse(null);
            if (seeker != null) { app.setSeekerName(seeker.getFullName()); app.setSeekerEmail(seeker.getEmail()); }
            app.setResumeData(null);
        });
        return ResponseEntity.ok(apps);
    }

    @GetMapping("/my-applications")
    public ResponseEntity<?> getMyApplications(Authentication authentication) {
        String username = authentication.getName();
        User seeker = userRepository.findByUsernameOrEmail(username, username).get();
        List<Application> apps = applicationRepository.findBySeekerId(seeker.getId());
        apps.forEach(app -> {
            Job job = jobRepository.findById(app.getJobId()).orElse(null);
            if (job != null) { app.setJobTitle(job.getTitle()); app.setJobLocation(job.getLocation()); }
            app.setResumeData(null);
        });
        return ResponseEntity.ok(apps);
    }

    @GetMapping("/download/{applicationId}")
    public ResponseEntity<byte[]> downloadResume(@PathVariable Long applicationId) {
        Application app = applicationRepository.findById(applicationId).orElseThrow();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + app.getResumeName() + "\"")
                .contentType(MediaType.parseMediaType(app.getResumeType()))
                .body(app.getResumeData());
    }

    @PostMapping("/{id}/request-feedback")
    public ResponseEntity<?> requestFeedback(@PathVariable Long id, @RequestParam String email, Authentication authentication) {
        Application app = applicationRepository.findById(id).orElseThrow();
        Job job = jobRepository.findById(app.getJobId()).orElseThrow();
        User seeker = userRepository.findById(app.getSeekerId()).orElseThrow();
        String token = UUID.randomUUID().toString();
        app.setFeedbackToken(token);
        // Automatically move status to IN_REVIEW when feedback is requested
        if (app.getStatus().equals("APPLIED")) {
            app.setStatus("IN_REVIEW");
        }
        applicationRepository.save(app);
        String magicLink = "https://job-board-frontend-eight-zeta.vercel.app/feedback/" + token;
        emailService.sendFeedbackRequest(email, seeker.getFullName(), job.getTitle(), magicLink);
        return ResponseEntity.ok().body("{\"message\": \"Feedback email sent!\"}");
    }

    @GetMapping("/feedback/{token}")
    public ResponseEntity<?> getFeedbackDetails(@PathVariable String token) {
        Application app = applicationRepository.findByFeedbackToken(token).orElseThrow();
        Job job = jobRepository.findById(app.getJobId()).orElseThrow();
        User seeker = userRepository.findById(app.getSeekerId()).orElseThrow();
        return ResponseEntity.ok().body(Map.of(
            "jobTitle", job.getTitle(), "candidateName", seeker.getFullName(),
            "aiScore", app.getAiScore(), "aiSummary", app.getAiSummary()
        ));
    }

    @PostMapping("/feedback/{token}")
    public ResponseEntity<?> submitFeedback(@PathVariable String token, @RequestBody Map<String, Object> payload) {
        Application app = applicationRepository.findByFeedbackToken(token).orElseThrow();
        app.setManagerRating(Integer.parseInt(payload.get("rating").toString()));
        app.setManagerFeedback(payload.get("feedback").toString());
        app.setFeedbackToken(null);
        applicationRepository.save(app);
        return ResponseEntity.ok().body("{\"message\": \"Feedback submitted!\"}");
    }

    // --- NEW: UPDATE CANDIDATE STATUS ---
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam String status, Authentication authentication) {
        Application app = applicationRepository.findById(id).orElseThrow();
        app.setStatus(status.toUpperCase());
        applicationRepository.save(app);
        return ResponseEntity.ok().body("{\"message\": \"Status updated successfully!\"}");
    }
}