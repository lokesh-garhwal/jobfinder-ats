package com.jobplatform.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendFeedbackRequest(String toEmail, String candidateName, String jobTitle, String magicLink) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Action Required: Evaluate Candidate for " + jobTitle);
        message.setText("Hello,\n\n" +
                "You have been requested to evaluate the candidate: " + candidateName + " for the " + jobTitle + " role.\n\n" +
                "Please click the secure link below to view their AI summary and submit your final feedback:\n" +
                magicLink + "\n\n" +
                "Thank you,\nJobFinder ATS System");
        mailSender.send(message);
    }
}