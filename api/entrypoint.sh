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
    User.objects.create_superuser('admin', 'admin@example.com', 'pass123')
EOF
fi

# Create mock users automatically
echo "Creating mock users..."
python manage.py shell <<EOF
from django.contrib.auth import get_user_model
User = get_user_model()

mock_users = [
    {'username': 'user1', 'email': 'user1@example.com', 'password': 'pass123'},
    {'username': 'user2', 'email': 'user2@example.com', 'password': 'pass123'},
    {'username': 'user3', 'email': 'user3@example.com', 'password': 'pass123'},
    {'username': 'user4', 'email': 'user4@example.com', 'password': 'pass123'},
    {'username': 'user5', 'email': 'user5@example.com', 'password': 'pass123'},
]

for user_data in mock_users:
    if not User.objects.filter(username=user_data['username']).exists():
        User.objects.create_user(
            username=user_data['username'],
            email=user_data['email'],
            password=user_data['password']
        )
EOF

# Start server
echo "Starting server..."
exec "$@"
