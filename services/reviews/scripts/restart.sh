#! /usr/bin/env sh

set -e

# remove old migrations
find ./reviews/app/alembic/versions -type f -name '*.py' -delete

docker-compose build reviews reviews-db

# run database and wait for it to start
docker-compose up -d reviews-db
sleep 5

# create new revision
docker-compose run reviews alembic revision --autogenerate
