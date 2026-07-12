package kcg.edu.ehms

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

/**
 * Main entry point for the EHMS (Electronic Health Management System) Spring Boot application.
 * This class initializes and starts the Spring Boot application with default configurations.
 */
@SpringBootApplication
class EhmsApplication

/**
 * Main function to start the EHMS application.
 * Runs the Spring Boot application with the provided command-line arguments.
 */
fun main(args: Array<String>) {
    runApplication<EhmsApplication>(*args)
}
