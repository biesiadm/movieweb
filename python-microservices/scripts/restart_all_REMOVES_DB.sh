#! /usr/bin/env sh

set -e

cd ..

# shut down containers and remove volumes
docker-compose down -v --remove-orphans

# remove old migrations
find ./movie_service/app/alembic/versions -type f -name '*.py' -delete

docker-compose build

# run database and wait for it to start
docker-compose up -d movie_db
sleep 5

# create new revision
docker-compose run movie_service alembic revision --autogenerate
docker-compose up