#!/bin/bash

# Wait for database to be ready
wait-for-it.sh db:3306 --timeout=30 --strict -- echo "Database is ready"

# Run database initialization 
npm run initdb

# Start the server
npm start