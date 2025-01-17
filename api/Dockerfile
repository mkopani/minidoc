ARG PYTHON_VERSION=3.10-slim

FROM python:${PYTHON_VERSION} as python

# Set the working directory in the container
WORKDIR /app

# Install container dependencies
RUN apt-get update && apt-get install --no-install-recommends -y \
  # netcat for DB healthcheck
  netcat-openbsd \
  # psycopg dependencies
  libpq-dev \
  build-essential \
  libssl-dev \
  pkg-config \
  curl \
  && curl https://sh.rustup.rs -sSf | bash -s -- -y \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

# Ensure Rust and Cargo are in PATH
ENV PATH="/root/.cargo/bin:$PATH"

RUN apt-get clean

# Update pip
RUN pip install --upgrade pip

# Install Python dependencies
COPY ./api/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# TODO: Uncomment for prod
# Install Daphne for ASGI support in production
# RUN pip install daphne

# Install uvicorn for ASGI support during development
RUN pip install uvicorn[standard]

# Copy entrypoint script into the container, make executable
COPY ./api/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Copy project files into the container
COPY ./api .

# Set entrypoint script
ENTRYPOINT ["/entrypoint.sh"]

ENV DJANGO_SETTINGS_MODULE=minidoc_api.settings

# Use Daphne to serve the application in production
# CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "minidoc_api.asgi:application"]

# Use Uvicorn to serve the application in development
CMD ["uvicorn", "minidoc_api.asgi:application", "--host", "0.0.0.0", "--port", "8000", "--reload"]
