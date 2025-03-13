package com.webAssistant;

import lombok.Data;

@Data
public class WebRequest {
    private String content;
    private String operation;
    private String question; // Added question field for clarification
}
