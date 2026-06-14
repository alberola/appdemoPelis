package com.example.appdemopelis.tmdb;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import tools.jackson.databind.JsonNode;

@RestController
@RequestMapping("/api/tmdb")
public class TmdbController {

	private final TmdbService tmdbService;

	public TmdbController(TmdbService tmdbService) {
		this.tmdbService = tmdbService;
	}

	@GetMapping("/trending")
	public JsonNode trending(@RequestParam(defaultValue = "all") String mediaType) {
		return tmdbService.trending(mediaType);
	}

	@GetMapping("/search")
	public JsonNode search(
			@RequestParam(defaultValue = "multi") String type,
			@RequestParam String query,
			@RequestParam(defaultValue = "1") int page) {
		return tmdbService.search(type, query, page);
	}

	@GetMapping("/{mediaType}/{id}")
	public JsonNode details(@PathVariable String mediaType, @PathVariable long id) {
		return tmdbService.details(mediaType, id);
	}
}
