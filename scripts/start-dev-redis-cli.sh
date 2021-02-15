#!/bin/bash

if ! command -v 'redis-cli' &> /dev/null
then
    echo "Could not find redis-cli."
    echo "Install redis-tools to use this script."
    exit 1
fi


service_name='redis'
service_port=6379
container_ip=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' services_${service_name}_1)

redis-cli -h ${container_ip} -p ${service_port}
