#!/bin/sh
set -e

echo "⏳ Waiting for database..."
until npx knex migrate:latest; do
  echo "⚠️  Migration failed, retrying in 3s..."
  sleep 3
done

echo "🌱 Running seeds..."
npx knex seed:run

echo "🚀 Starting server..."
exec node src/app.js