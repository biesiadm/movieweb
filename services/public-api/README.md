# Public API service

## Public addresses

* `domain:8081/`: API entry
* `domain:8081/docs`: Swagger docs
* `domain:8081/openapi.json`: API schema

## Development

Running `docker-compose up` (with overrides) will:
* bind `apis/`, `generated/` and `src/` to container,
* generate API clients from OpenAPI schema,
* enable hot reload of TypeScript app.

### Updating API dependencies

Put updated schemas in `apis/`. Production container has to be restarted. For development container, run:
```bash
docker-compose run public-api npm run generate-api-client-<service-name>
```
App will rebuild.

### Public API export

1. Run image in development mode: use `docker-compose` with overrides. It binds container to folder `generated`.
2. Run generator:
   ```bash
   docker-compose run public-api npm run generate-api-schema-public
   ```
3. Contents of `generated/openapi.json` will refresh.
