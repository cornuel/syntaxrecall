#!/bin/bash

# Setup colors for output
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting SyntaxRecall Docker Setup...${NC}"

# 1. Check for .env file
if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo -e "${GREEN}Please update the .env file with your API keys!${NC}"
fi

# 2. Build and start containers
echo -e "${GREEN}Building and starting containers...${NC}"
# Use standard 'docker run' approach or notify user if compose is missing
if command -v docker-compose &> /dev/null; then
    docker-compose up -d --build
elif docker help compose &> /dev/null; then
    docker compose up -d --build
else
    echo "Error: Neither 'docker-compose' nor 'docker compose' was found."
    echo "Please install Docker Compose to continue."
    exit 1
fi

# 3. Wait for DB to be ready
echo "Waiting for database to be ready..."
sleep 5

# 4. Run database setup within the backend container
echo -e "${GREEN}Initializing database...${NC}"
COMPOSE_CMD="docker compose"
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
fi

$COMPOSE_CMD exec backend python reset_db.py
$COMPOSE_CMD exec backend python ingest_roadmaps.py
$COMPOSE_CMD exec backend python seed.py

echo -e "${GREEN}Setup complete! SyntaxRecall is running at:${NC}"
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:8000/docs"
