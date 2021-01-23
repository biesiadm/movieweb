#! /usr/bin/env sh

set -e
cd services/

# shut down containers and remove volumes
docker-compose down -v --remove-orphans
docker-compose -f docker-compose.yml build
docker-compose -f docker-compose.yml up
