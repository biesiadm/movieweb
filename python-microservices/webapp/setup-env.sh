#!/bin/sh

# REACT_APP_ entries in .env will be accessible in the app
echo "REACT_APP_API_URL=http://localhost:${MOVIES_PORT}" >> .env
