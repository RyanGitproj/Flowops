#!/bin/sh
set -e

echo "🚀 Starting FlowOps API entrypoint..."

# Function to wait for PostgreSQL
wait_for_postgres() {
  echo "⏳ Waiting for PostgreSQL to be ready..."

  # Check if DATABASE_URL is set
  if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable is not set"
    exit 1
  fi

  # Extract host and port from DATABASE_URL
  # Handle both formats: postgresql://user:pass@host:port/db and postgresql://user:pass@host/db (Render uses no port)
  DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
  DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')

  # If port not found, try extracting host without port and default to 5432
  if [ -z "$DB_HOST" ]; then
    DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^/]*\)\/.*/\1/p')
  fi

  # Default to PostgreSQL port 5432 if not specified
  if [ -z "$DB_PORT" ]; then
    DB_PORT=5432
  fi

  # Fail if host cannot be extracted
  if [ -z "$DB_HOST" ]; then
    echo "❌ Cannot extract host from DATABASE_URL: $DATABASE_URL"
    exit 1
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

# Run Prisma migrations
echo "🔧 Running Prisma migrations..."
npx prisma migrate deploy

# Start the application
echo "🚀 Starting NestJS application..."
exec node dist/src/main
