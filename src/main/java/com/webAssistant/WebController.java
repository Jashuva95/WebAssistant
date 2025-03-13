package com.webAssistant;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/research")
@CrossOrigin(origins = "*")
@AllArgsConstructor
public class WebController {
    private final WebService researchService;

    @PostMapping("/process")
    public ResponseEntity<String> processContent(@RequestBody WebRequest request) {
        return ResponseEntity.ok(researchService.processContent(request));
    }
}