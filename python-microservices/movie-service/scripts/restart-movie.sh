#! /usr/bin/env sh

set -e

# remove old migrations
find ./movie-service/app/alembic/versions -type f -name '*.py' -delete

docker-compose build

# run database and wait for it to start
docker-compose up -d movie-db
sleep 5

# create new revision
docker-compose run movie-service alembic revision --autogenerate
