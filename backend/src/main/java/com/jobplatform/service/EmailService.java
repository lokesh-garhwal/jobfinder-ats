package com.jobplatform.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.List;
import java.util.Map;

@Service
public class EmailService {

    @Value("${resend.api.key}")
    private String resendApiKey;

    public void sendFeedbackRequest(String toEmail, String candidateName, String jobTitle, String magicLink) {
        RestTemplate restTemplate = new RestTemplate();
        String url = "https://api.resend.com/emails";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(resendApiKey);

        // Resend requires this exact testing address until you buy a domain
        String fromEmail = "Acme <onboarding@resend.dev>";

        String htmlBody = String.format(
                "<h3>Feedback Request</h3><p>Please review %s for the %s role.</p><p><a href='%s'>Click here to evaluate</a></p>",
                candidateName, jobTitle, magicLink
        );

        Map<String, Object> body = Map.of(
                "from", fromEmail,
                "to", List.of(toEmail),
                "subject", "Candidate Evaluation: " + candidateName,
                "html", htmlBody
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            restTemplate.postForEntity(url, request, String.class);
        } catch (Exception e) {
            System.err.println("Failed to send email via Resend: " + e.getMessage());
        }
    }
}