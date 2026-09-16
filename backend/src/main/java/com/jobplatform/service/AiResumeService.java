package com.jobplatform.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class AiResumeService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    public String extractTextFromPdf(byte[] pdfData) {
        try (PDDocument document = PDDocument.load(pdfData)) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            return text.length() > 5000 ? text.substring(0, 5000) : text;
        } catch (Exception e) {
            return "";
        }
    }

    public Map<String, Object> evaluateResume(String resumeText, String jobDescription) {
        Map<String, Object> result = new HashMap<>();
        result.put("score", 0);

        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String prompt = "You are an ATS. Evaluate this resume against the job description. Return ONLY a JSON object with EXACTLY two keys: 'score' (integer 0-100) and 'summary' (string).\n\nJOB:\n" + jobDescription + "\n\nRESUME:\n" + resumeText;

            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> textMap = new HashMap<>();
            textMap.put("text", prompt);

            Map<String, Object> partsMap = new HashMap<>();
            partsMap.put("parts", new Object[]{textMap});

            Map<String, Object> requestMap = new HashMap<>();
            requestMap.put("contents", new Object[]{partsMap});

            String requestBody = mapper.writeValueAsString(requestMap);
            String fullUrl = apiUrl + "?key=" + apiKey;

            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

            // Call Google Gemini
            String response = restTemplate.postForObject(fullUrl, entity, String.class);

            JsonNode root = mapper.readTree(response);

            // Check if Gemini returned an unexpected format
            if (!root.has("candidates")) {
                result.put("summary", "Gemini did not return candidates. Raw Response: " + response);
                return result;
            }

            String aiResponseText = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();

            // Clean up Markdown backticks if Gemini includes them
            aiResponseText = aiResponseText.replace("```json", "").replace("```", "").trim();

            JsonNode resultNode = mapper.readTree(aiResponseText);
            result.put("score", resultNode.has("score") ? resultNode.get("score").asInt() : 0);
            result.put("summary", resultNode.has("summary") ? resultNode.get("summary").asText() : "No summary provided.");

        } catch (HttpStatusCodeException e) {
            // THIS WILL CATCH 400, 401, 403 ERRORS FROM GOOGLE AND PRINT THE REASON!
            result.put("summary", "GOOGLE API ERROR: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            result.put("summary", "JAVA PARSING ERROR: " + e.toString());
        }
        return result;
    }
}
