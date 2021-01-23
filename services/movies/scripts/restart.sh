#! /usr/bin/env sh

set -e

# remove old migrations
find ./movies/app/alembic/versions -type f -name '*.py' -delete

docker-compose build movies movies-db

# run database and wait for it to start
docker-compose up -d movies-db
sleep 5

# create new revision
docker-compose run movies alembic revision --autogenerate
