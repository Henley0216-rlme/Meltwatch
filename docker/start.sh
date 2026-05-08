#!/bin/bash
# Meltwatch Quick Start Script

set -e

echo "Meltwatch Startup Script"
echo "========================"

# Change to docker directory
cd "$(dirname "$0")"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "Docker not found. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose not found. Please install Docker Compose first."
    exit 1
fi

# Check environment file
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "Please edit .env file if needed, then run this script again."
    exit 1
fi

# Build and start services
echo "Building and starting services..."
docker compose up -d --build

echo ""
echo "Services started successfully!"
echo "  Frontend:  http://localhost:8080"
echo "  Backend:   http://localhost:5001"
echo "  API Docs:  http://localhost:5001/api/v1/health"
echo ""
echo "View logs: docker compose logs -f"
echo "Stop:      docker compose down"
