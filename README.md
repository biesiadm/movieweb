<h1 align="center">
    <img src="services/webapp/public/favicon.svg" width="128" />
    <br />
    Movieweb
</h1>
<p align="center">
    Movieweb is an IMDB-like website utilizing microservices architecture.
</p>
<p align="center">
    <a href="readme/screen-homepage.png"><img src="readme/thumb-homepage.png" width="300" /></a>
    <a href="readme/screen-api.png"><img src="readme/thumb-api.png" width="300" /></a>
    <a href="readme/screen-movie.png"><img src="readme/thumb-movie.png" width="300" /></a>
    <a href="readme/screen-user.png"><img src="readme/thumb-user.png" width="300" /></a>
</p>

## Architecture

There are four types of backend services:
* `movies`: handles movie information (FastAPI)
* `users`: handles user information and authentication (FastAPI)
* `reviews`: handles reviews (FastAPI)
* `relations`: handles followers (FastAPI)

Other machines serve front-facing traffic:
* `public-api`: API gateway (Node.js, express)
* `redis`: caching storage for `public-api`
* `webapp`: serves precompiled React SPA
* `load-balancer`: `nginx` edge router, proxies traffic to webapp and the API endpoint

### REST services

Endpoints communicate using REST API.
All endpoints provide OpenAPI 3 schemes.
API endpoints and the webapp use clients generated from the spec.
Authentication uses JWT tokens signed by `users` service.
`public-api` saves `httpOnly` cookies to store token with the user.

### Scaling and load balancing

Chosen machines are scaled manually by adding containers in `docker-compose.yml`.
There are 3 copies of public API (`public-api-a`, `-b` and `-c`) and two copies of web app (`webaapp-a` and `-b`).
Containers are registered as `nginx` upstreams.
Public API uses IP has for load balancing to utilize cached data from previous user actions.
Traffic to web application is distributed by least active connections.

### Redis cache

Multiple API responses inject extra information into returned objects.
Usually is it movie or user details.
To relieve backends, movies and users are cached in Redis storage.
Redis stores stringified JSON objects.
Dictionary keys are of form `prefix:uuid`, where prefixes are:
* `mov` for movies
* `usr` for users

### DB sharding

TODO

## Development

This project uses `docker-compose` with image files in different folders.
*Note:* `main` is the home branch.

### Endpoints

* `https://movieweb.local/`: website
* `https://api.movieweb.local/`: API entry
* `https://api.movieweb.local/docs`: Swagger docs
* `https://api.movieweb.local/openapi.json`: API schema

For development, use
* `http://localhost:5000`: `movies`
* `http://localhost:5004`: `users`
* `http://localhost:5008`: `reviews`
* `http://localhost:5012`: `relations`
* `http://localhost:8081`: `public-api-a`
* `http://localhost:8080`: `webapp-a`
* `http://localhost:6379`: `redis`


### First time setup

1. Redirect local domains to localhost.
    ```
    echo -e "127.0.0.1\tmovieweb.local\n" >> /etc/hosts
    echo -e "127.0.0.1\tapi.movieweb.local\n" >> /etc/hosts
    ```
1. Generate self-signed SSL keys.
    ```
    ./scripts/regenerate-dev-keys.sh
    ```
1. Build services.
    ```
    ./scripts/restart-all.sh
    ```

Browser will display a security warning later, because it doesn't know root CA you just created.
You can safely add an exception.
Still seeing errors?
Visit `https://api.movieweb.local/docs` and `api` subdomain to allowlist.

### Hot reloading
When running in development mode (default `docker-compose` overrides), services will restart when code changes.

### Updating schemas
Some services use API endpoints of other services.
To enforce development boundaries, each service stores copies of used schemas.

#### Backends
API schemas are exposed through web server under URL `http://localhost:<service-port>/openapi.json`.

#### Public API
Backend schemas are stored in `/services/public-api/apis`.
After updating schema file run
```
docker-compose run public-api npm run generate-api-client-<service-name>
```
to generate API client library.

To export API schema, run
```
docker-compose run public-api npm run generate-api-schema-public
```
Exported files are in `/services/public-api/generated/openapi.json`.

#### Web app
Public API is stored in `/services/webapp/apis/public.json`.
After updating schema file run
```
docker-compose run public-api npm run generate-api-client-public
```
to generate client library.