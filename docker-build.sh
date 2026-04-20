#!/bin/bash

# Docker build script with retry logic for network resilience
# This script handles Docker Hub timeouts and network instability

set -e

MAX_RETRIES=3
RETRY_DELAY=10

echo "🚀 Building Docker image with retry logic..."

for i in $(seq 1 $MAX_RETRIES); do
  echo "Attempt $i of $MAX_RETRIES..."
  
  if docker compose build; then
    echo "✅ Build successful!"
    exit 0
  else
    echo "❌ Build failed (attempt $i/$MAX_RETRIES)"
    
    if [ $i -lt $MAX_RETRIES ]; then
      echo "⏳ Waiting ${RETRY_DELAY}s before retry..."
      sleep $RETRY_DELAY
      echo "🔄 Retrying..."
    else
      echo "💥 All retry attempts failed"
      exit 1
    fi
  fi
done
