#!/usr/bin/env sh
set -eu

envsubst '${PUBLIC_DOMAIN}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

exec "$@"
