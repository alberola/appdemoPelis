package com.example.appdemopelis.tmdb;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import tools.jackson.databind.JsonNode;

import java.util.Set;

@Service
public class TmdbService {

	private static final String DEFAULT_LANGUAGE = "es-ES";
	private static final Set<String> TRENDING_TYPES = Set.of("all", "movie", "tv");
	private static final Set<String> SEARCH_TYPES = Set.of("multi", "movie", "tv");
	private static final Set<String> DETAIL_TYPES = Set.of("movie", "tv");

	private final RestClient tmdbRestClient;

	public TmdbService(RestClient tmdbRestClient) {
		this.tmdbRestClient = tmdbRestClient;
	}

	public JsonNode trending(String mediaType) {
		String safeMediaType = validate(mediaType, TRENDING_TYPES, "tipo de tendencia");
		return tmdbRestClient.get()
				.uri(uriBuilder -> uriBuilder
						.path("/trending/{mediaType}/week")
						.queryParam("language", DEFAULT_LANGUAGE)
						.build(safeMediaType))
				.retrieve()
				.body(JsonNode.class);
	}

	public JsonNode search(String searchType, String query, int page) {
		String safeSearchType = validate(searchType, SEARCH_TYPES, "tipo de busqueda");
		String safeQuery = query == null ? "" : query.trim();
		if (safeQuery.isBlank()) {
			throw new IllegalArgumentException("Escribe una pelicula o serie para buscar.");
		}

		return tmdbRestClient.get()
				.uri(uriBuilder -> uriBuilder
						.path("/search/{searchType}")
						.queryParam("query", safeQuery)
						.queryParam("language", DEFAULT_LANGUAGE)
						.queryParam("page", Math.max(page, 1))
						.queryParam("include_adult", false)
						.build(safeSearchType))
				.retrieve()
				.body(JsonNode.class);
	}

	public JsonNode details(String mediaType, long id) {
		String safeMediaType = validate(mediaType, DETAIL_TYPES, "tipo de detalle");
		if (id < 1) {
			throw new IllegalArgumentException("El id debe ser mayor que cero.");
		}

		return tmdbRestClient.get()
				.uri(uriBuilder -> uriBuilder
						.path("/{mediaType}/{id}")
						.queryParam("language", DEFAULT_LANGUAGE)
						.queryParam("append_to_response", "credits,videos,watch/providers")
						.build(safeMediaType, id))
				.retrieve()
				.body(JsonNode.class);
	}

	private String validate(String value, Set<String> allowedValues, String label) {
		String normalized = value == null ? "" : value.toLowerCase().trim();
		if (!allowedValues.contains(normalized)) {
			throw new IllegalArgumentException("El " + label + " no es valido.");
		}
		return normalized;
	}
}
