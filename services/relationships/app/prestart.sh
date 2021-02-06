#! /usr/bin/env bash

# Let the DB start
python /app/app/relationship_pre_start.py

# Run migrations
alembic upgrade head

# Create initial data in DB
sleep 5 # Wait for movies-db and users-db to wake ap
python /app/app/initial_data.py
