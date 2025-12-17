#!/bin/sh

echo "Waiting for Postgres..."
while ! nc -z $DATABASE_HOST $DATABASE_PORT; do
  sleep 0.5
done

echo "Postgres is up!"

echo "Waiting for Django migrations to complete..."
sleep 10

echo "Starting Celery Worker..."
celery -A PfeManagement worker --loglevel=info
