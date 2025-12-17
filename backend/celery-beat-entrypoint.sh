#!/bin/sh

echo "Waiting for Postgres..."
while ! nc -z $DATABASE_HOST $DATABASE_PORT; do
  sleep 0.5
done

echo "Postgres is up!"

echo "Waiting for Django migrations to complete..."
sleep 15

echo "Starting Celery Beat Scheduler..."
celery -A PfeManagement beat --loglevel=info --scheduler django_celery_beat.schedulers:DatabaseScheduler
