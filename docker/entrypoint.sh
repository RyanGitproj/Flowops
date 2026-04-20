#!/bin/sh
set -e

echo "🚀 Starting FlowOps API entrypoint..."

# Function to wait for PostgreSQL
wait_for_postgres() {
  echo "⏳ Waiting for PostgreSQL to be ready..."
  
  # Extract host and port from DATABASE_URL
  DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
  DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
  
  if [ -z "$DB_HOST" ]; then
    DB_HOST="localhost"
  fi
  
  if [ -z "$DB_PORT" ]; then
    DB_PORT="5432"
  fi
  
  echo "📍 Connecting to PostgreSQL at $DB_HOST:$DB_PORT"
  
  # Wait for PostgreSQL to be ready with retry logic
  MAX_RETRIES=60
  RETRY_COUNT=0
  
  while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if nc -z $DB_HOST $DB_PORT 2>/dev/null; then
      echo "✅ PostgreSQL is ready!"
      return 0
    fi
    
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "⏳ Attempt $RETRY_COUNT/$MAX_RETRIES: PostgreSQL not ready yet, waiting 2s..."
    sleep 2
  done
  
  echo "❌ Failed to connect to PostgreSQL after $MAX_RETRIES attempts"
  exit 1
}

# Wait for PostgreSQL
wait_for_postgres

# Start the application
echo "🚀 Starting NestJS application..."
exec node dist/src/main
