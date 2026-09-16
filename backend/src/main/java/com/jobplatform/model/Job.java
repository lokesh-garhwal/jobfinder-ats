package com.jobplatform.model;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class Job {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String organizationName;
    @Column(columnDefinition = "TEXT") private String organizationDetails;

    private String title;
    private String techStack; // NEW: IT Specific (e.g. "React, Java, Spring")
    @Column(columnDefinition = "TEXT") private String description;
    private String location;
    @Column(columnDefinition = "TEXT") private String requirements;
    private String industry;

    private String salary;
    private String jobMode;

    private String timeLimit;
    private String status = "ACTIVE";
    private LocalDateTime postedDate = LocalDateTime.now();

    private Long employerId;
}