ARG PYTHON_VERSION=3.10-slim

FROM python:${PYTHON_VERSION} as python

# Set the working directory in the container
WORKDIR /app

# Install container dependencies
RUN apt-get update && apt-get install --no-install-recommends -y \
  # netcat for DB healthcheck
  netcat-openbsd \
  # psycopg dependencies
  libpq-dev
RUN apt-get clean

# Update pip
RUN pip install --upgrade pip

# Install Python dependencies
COPY ./api/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files into the container
COPY ./api .

# Make entrypoint script executable
RUN chmod +x entrypoint.sh

# Set entrypoint script
ENTRYPOINT ["./entrypoint.sh"]

# Default command
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
