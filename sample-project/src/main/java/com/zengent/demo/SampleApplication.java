package com.zengent.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main application class for the Sample Test Project.
 * This application demonstrates various architectural patterns
 * that Zengent AI can analyze and provide insights on.
 * 
 * @author Zengent Team
 * @version 1.0.0
 */
@SpringBootApplication
public class SampleApplication {

    /**
     * Main entry point for the Spring Boot application.
     * 
     * @param args Command line arguments
     */
    public static void main(String[] args) {
        SpringApplication.run(SampleApplication.class, args);
        System.out.println("Sample Test Project started successfully!");
    }
}