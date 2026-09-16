package com.jobplatform.model;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class Application {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long jobId;
    private Long seekerId;

    @Transient private String seekerName;
    @Transient private String seekerEmail;
    @Transient private String jobTitle;
    @Transient private String jobLocation;

    private String githubLink;
    private String portfolioLink;
    private String resumeName;
    private String resumeType;

    private Integer aiScore;
    @Column(columnDefinition = "TEXT")
    private String aiSummary;

    private String feedbackToken;
    @Column(columnDefinition = "TEXT")
    private String managerFeedback;
    private Integer managerRating;

    // NEW: Application Status Tracking
    private String status = "APPLIED";

    @Lob
    @Column(columnDefinition="LONGBLOB")
    private byte[] resumeData;

    private LocalDateTime appliedDate = LocalDateTime.now();
}