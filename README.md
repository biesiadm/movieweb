# movieweb

## Development

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
    cd services && docker-compose build
    ```

Browser will display a security warning later, because it doesn't know root CA you just created. You can safely add an exception. Still seeing errors? Visit `https://api.movieweb.local/docs` and whitelist `api` subdomain too.

## Basic setup
### build
```
docker-compose build
```
### run migration
```
docker-compose run movies alembic revision --autogenerate
```

### run
```
docker-compose up
```
## Usage
Homepage of movie service ("Hello world") is currently avaliable at `localhost:5000`
