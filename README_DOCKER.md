# Docker Deployment Guide

## Overview

The backoffice frontend can be deployed using Docker. The application is containerized and can be run standalone or as part of the full stack with the backend.

## Quick Start

### Option 1: Standalone Frontend

```bash
cd backoffice-frontend
docker-compose up -d --build
```

The frontend will be available at http://localhost:3001

### Option 2: Full Stack (Backend + Frontend)

From the backend directory:

```bash
docker-compose up -d --build
```

This will start:
- Database (PostgreSQL) on port 5433
- Backend API on port 3000
- Frontend on port 3001

## Environment Variables

Create a `.env` file in the backend directory:

```env
# Backend
DATABASE_HOST=db
DATABASE_PORT=5432
DATABASE_USER=kiosk_user
DATABASE_PASSWORD=kiosk_password
DATABASE_NAME=kiosk_db
JWT_SECRET=your-secret-key-here
PORT=3000

# Admin Users (optional, defaults provided)
ADMIN_DEFAULT_PASSWORD=admin123
SUPERADMIN_DEFAULT_PASSWORD=superadmin123
MANAGER_DEFAULT_PASSWORD=manager123

# Frontend API URL
NEXT_PUBLIC_API_URL=http://backend:3000/api/v1
```

## Default Admin Users

The backend automatically creates the following admin users on first startup:

1. **System Administrator**
   - Email: `admin@kiosk.com`
   - Password: `admin123` (or `ADMIN_DEFAULT_PASSWORD` env var)
   - Roles: `admin`

2. **Super Administrator**
   - Email: `superadmin@kiosk.com`
   - Password: `superadmin123` (or `SUPERADMIN_DEFAULT_PASSWORD` env var)
   - Roles: `admin`, `super_admin`

3. **Content Manager**
   - Email: `manager@kiosk.com`
   - Password: `manager123` (or `MANAGER_DEFAULT_PASSWORD` env var)
   - Roles: `admin`

⚠️ **Important**: Change these default passwords after first login!

## Building the Frontend Image

```bash
cd backoffice-frontend
docker build -t kiosk-backoffice-frontend .
```

## Running Individual Services

### Frontend Only

```bash
cd backoffice-frontend
docker-compose up -d
```

### Backend Only

```bash
cd backend
docker-compose up -d db backend
```

## Network Configuration

All services are connected via a Docker network (`kiosk-network`):
- Frontend can access backend at `http://backend:3000`
- Backend can access database at `db:5432`

## Volumes

The backend uses volumes for:
- `postgres_data`: Database persistence
- `./uploads`: Uploaded images
- `./videos`: Generated videos

## Troubleshooting

### Frontend can't connect to backend

1. Check that both services are on the same network
2. Verify `NEXT_PUBLIC_API_URL` is set correctly
3. Check backend logs: `docker logs kiosk-backend`

### Admin users not created

1. Check backend logs: `docker logs kiosk-backend`
2. Manually run: `docker exec kiosk-backend npm run init:admins`
3. Verify database connection

### Port conflicts

If ports 3000, 3001, or 5433 are already in use, modify the port mappings in `docker-compose.yml`:

```yaml
ports:
  - "3002:3000"  # Change host port
```

## Production Deployment

For production:

1. Set strong passwords via environment variables
2. Use secrets management for sensitive data
3. Enable HTTPS
4. Configure proper CORS origins
5. Use a reverse proxy (nginx/traefik)
6. Set up monitoring and logging

## Development

For local development without Docker:

```bash
# Backend
cd backend
npm install
npm run start:dev

# Frontend
cd backoffice-frontend
npm install
npm run dev
```

