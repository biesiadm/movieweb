# movieweb

## Basic setup
### build
```
docker-compose build
```
### run migration
```
docker-compose run movie_service alembic revision --autogenerate
```

### run
```
docker-compose up
```
## Usage
Homepage of movie service ("Hello world") is currently avaliable at `localhost:5000`