#!/bin/sh
set -e

echo "⏳ Waiting for database to be ready..."

# Simple wait - docker-compose already handles depends_on with condition: service_healthy
# Just add a small delay to ensure connection is ready
sleep 5

echo "✅ Database should be ready!"

echo "🔄 Running Prisma migrations..."
npx prisma migrate deploy

echo "🚀 Starting reservation-service..."
exec npm run start