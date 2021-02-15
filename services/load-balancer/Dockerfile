FROM nginx:1.19-alpine

ADD docker-entrypoint.sh /docker-entrypoint.sh
ADD nginx.conf.template /etc/nginx/conf.d/default.conf.template

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
