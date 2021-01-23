#! /usr/bin/env sh

set -e

# remove old migrations
find ./users/app/alembic/versions -type f -name '*.py' -delete

docker-compose build users users-db

# run database and wait for it to start
docker-compose up -d users-db
sleep 5

# create new revision
docker-compose run users alembic revision --autogenerate
