package com.example.appdemopelis.tmdb;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.RestClientResponseException;

import java.util.Map;

@RestControllerAdvice
public class TmdbExceptionHandler {

	@ExceptionHandler(IllegalArgumentException.class)
	ResponseEntity<Map<String, String>> handleBadRequest(IllegalArgumentException exception) {
		return ResponseEntity.badRequest().body(Map.of("error", exception.getMessage()));
	}

	@ExceptionHandler(RestClientResponseException.class)
	ResponseEntity<Map<String, String>> handleTmdbError(RestClientResponseException exception) {
		return ResponseEntity
				.status(HttpStatus.BAD_GATEWAY)
				.body(Map.of("error", "TMDB no pudo responder correctamente. Codigo: " + exception.getStatusCode().value()));
	}
}
