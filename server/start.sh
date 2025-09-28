#!/bin/bash

# Wait for database to be ready
wait-for-it.sh db:3306 --timeout=30 --strict -- echo "Database is ready"

# Run database initialization (continue even if it fails since MySQL might have already initialized the DB)
npm run initdb || echo "Database initialization failed or already completed"

# Start the server
npm start