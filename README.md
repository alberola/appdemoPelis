# appdemoPelis

Aplicacion Spring Boot para consultar peliculas y series desde TMDB.

## Requisitos

- Java 17 o superior
- Token de lectura de TMDB

## Ejecutar en local

Exporta el token antes de arrancar la app:

```sh
export TMDB_API_TOKEN="tu_token_de_tmdb"
./mvnw spring-boot:run
```

La aplicacion queda disponible en `http://localhost:8080`.

## Validacion

```sh
./mvnw test
```

El repositorio incluye:

- GitHub Actions en `.github/workflows/ci.yml`
- Hook local de pre-push en `.githooks/pre-push`

Para activar el hook local:

```sh
git config core.hooksPath .githooks
```
