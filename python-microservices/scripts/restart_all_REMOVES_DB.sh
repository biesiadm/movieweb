#! /usr/bin/env sh

set -e

# shut down containers and remove volumes
docker-compose down -v --remove-orphans

users/scripts/restart.sh
movies/scripts/restart.sh

docker-compose up
