FROM nginx:1.19-alpine

ADD docker-files/ /

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
