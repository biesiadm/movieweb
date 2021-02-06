#! /usr/bin/env sh

set -e

# remove old migrations
find ./relationships/app/alembic/versions -type f -name '*.py' -delete

docker-compose build relationships relationships-db

# run database and wait for it to start
docker-compose up -d relationships-db
sleep 5

# create new revision
docker-compose run relationships alembic revision --autogenerate
