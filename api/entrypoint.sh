#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Wait for database to be ready
echo "Waiting for PostgreSQL to start..."
while ! nc -z $POSTGRES_HOST $POSTGRES_PORT; do
  sleep 0.1
done
echo "PostgreSQL started."

# Dynamically generate Django SECRET_KEY if not set
if [ -z "$DJANGO_SECRET_KEY" ]; then
  export DJANGO_SECRET_KEY=$(python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())")
  echo "Generated Django secret key."
fi

# Apply database migrations
echo "Applying database migrations..."
python manage.py migrate

# Create superuser automatically
if [ "$CREATE_SUPERUSER" = "true" ]; then
  echo "Creating superuser..."
  python manage.py shell <<EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
EOF
fi

# Start server
echo "Starting server..."
exec "$@"
