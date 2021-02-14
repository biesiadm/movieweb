#! /usr/bin/env sh

set -e

# remove old migrations
find ./relationships/app/alembic/versions -type f -name '*.py' -delete

docker-compose build relationships relationships-db1
docker-compose build relationships relationships-db2

# run database and wait for it to start
docker-compose up -d relationships-db1
docker-compose up -d relationships-db2
sleep 5

# create new revision
#docker-compose run relationships alembic revision --autogenerate
