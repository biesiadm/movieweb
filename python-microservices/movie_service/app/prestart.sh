#! /usr/bin/env bash

# Let the DB start
python /app/app/movie_pre_start.py

# Run migrations
alembic upgrade head

# Create initial data in DB
python /app/app/initial_data.py