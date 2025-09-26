# Docker Setup for SLSL-Intelicon

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

## Services

The application consists of 4 services:

1. **Database (MySQL 8.0)** - Port 3306
2. **Backend Server (Node.js/Express)** - Port 8000
3. **Frontend (Next.js)** - Port 3000
4. **Repetition Engine (Python/Flask)** - Port 5000

## Quick Start

### 1. Clone the repository and navigate to the project directory

```bash
cd /path/to/SLSL-Intelicon
```

### 2. Build and start all services

```bash
docker-compose up --build
```

This will:
- Build all Docker images
- Start all services
- Initialize the MySQL database with schema and seed data
- Make the application available at http://localhost:3000

### 3. Stop all services

```bash
docker-compose down
```

### 4. Stop and remove all data (including database)

```bash
docker-compose down -v
```

## Development Commands

### Build specific service
```bash
docker-compose build frontend
docker-compose build server
docker-compose build repetition-engine
```

### Start specific service
```bash
docker-compose up frontend
docker-compose up server
docker-compose up repetition-engine
docker-compose up db
```

### View logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs frontend
docker-compose logs server
docker-compose logs repetition-engine
docker-compose logs db
```

### Execute commands in running containers
```bash
# Access server container
docker-compose exec server bash

# Access database
docker-compose exec db mysql -u slsluser -p slsldb

# Access repetition engine
docker-compose exec repetition-engine bash
```

## Configuration

### Environment Variables

The application uses the following environment variables (defined in docker-compose.yml):

**Database:**
- `MYSQL_ROOT_PASSWORD`: Root password for MySQL
- `MYSQL_DATABASE`: Database name
- `MYSQL_USER`: Application database user
- `MYSQL_PASSWORD`: Application database password

**Server:**
- `DB_HOST`: Database hostname (set to 'db' container)
- `DB_PORT`: Database port (3306)
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name
- `NODE_ENV`: Environment mode (production)

**Frontend:**
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_ML_API_URL`: ML service URL

## Ports

The following ports are exposed on your local machine:

- **3000**: Frontend (Next.js application)
- **8000**: Backend API (Express server)
- **5000**: ML API (Flask repetition engine)
- **3306**: MySQL database

## Database

The MySQL database is automatically initialized with:
- Schema from `server/db/schema.sql`
- Seed data from `server/db/seed.sql`
