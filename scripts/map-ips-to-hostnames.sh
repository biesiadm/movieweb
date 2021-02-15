#!/bin/bash

services=$(docker ps --format '{{.Names}}' | grep --color=never services)
readarray -t <<<$services
services="${MAPFILE[@]}"
ips=()

for service in "$services"
do
    container_ip=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' ${service}  )
    ips+=("${container_ip}")
done

services=('SERVICE' "${MAPFILE[@]}")
ips=('IP' "${ips[@]}")


paste <(printf "%s\n" "${services[@]}") <(printf "%s\n" "${ips[@]}") | column -t | sort
