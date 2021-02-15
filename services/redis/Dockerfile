FROM redis:6-alpine

# Files
ADD redis.conf /usr/local/etc/redis/redis.conf

# Startup
EXPOSE 6379
CMD redis-server /usr/local/etc/redis/redis.conf
