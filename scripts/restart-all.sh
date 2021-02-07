#! /usr/bin/env sh

set -e
cd services/

# shut down containers and remove volumes
docker-compose down -v --remove-orphans

users/scripts/restart.sh
movies/scripts/restart.sh
reviews/scripts/restart.sh
relationships/scripts/restart.sh

docker-compose up
