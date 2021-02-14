#! /usr/bin/env bash

# Let the DB start
python /app/app/relationship_pre_start.py

# Create initial data in DB
sleep 5 # Wait for movies-db and users-db to wake up
python /app/app/initial_data.py
