#! /usr/bin/env sh

set -e

# shut down containers and remove volumes
docker-compose down -v --remove-orphans

python-microservices/users/scripts/restart.sh
python-microservices/movies/scripts/restart.sh

docker-compose up
