package com.example.appdemopelis.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;

@Configuration
@EnableConfigurationProperties(TmdbProperties.class)
public class TmdbConfig {

	@Bean
	RestClient tmdbRestClient(TmdbProperties properties) {
		return RestClient.builder()
				.baseUrl(properties.getBaseUrl())
				.defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + properties.getApiToken())
				.defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
				.build();
	}
}
