#!/bin/sh

npm run generate-api-client-movies &&
npm run generate-api-client-users &&
npm run generate-api-client-relations &&
npm run generate-api-client-reviews &&
npm run generate-api-schema-public &&
npm run build
