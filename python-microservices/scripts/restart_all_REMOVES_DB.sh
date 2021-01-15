#! /usr/bin/env sh

set -e

# shut down containers and remove volumes
docker-compose down -v --remove-orphans

./user-service/scripts/restart-user.sh
./movie-service/scripts/restart-movie.sh

docker-compose up