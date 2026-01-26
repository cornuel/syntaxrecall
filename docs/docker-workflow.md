# Docker Development Workflow

This document explains how to develop with SyntaxRecall using the Docker-based environment.

## 🚀 Daily Workflow

### 1. Starting the Environment

Instead of running separate terminal sessions for the frontend, backend, and database, you orchestrate them as a single fleet:

```bash
# Start all services in the background
docker compose up -d

# Check if everything is running
docker compose ps
```

### 2. Stopping the Environment
When you're finished working for the session, you have two options:

```bash
# Option A: The "Pause" (Fastest)
# Stops processes but keeps containers ready for a quick 'docker compose start'
docker compose stop

# Option B: The "Cleanup" (Recommended)
# Removes containers and networks, keeping your machine clean.
# Your database data is SAFE in a persistent volume.
docker compose down
# To resume :
docker compose up -d

# Option C: The "Factory Reset"
# WARNING: This deletes your database volumes and all your data!
docker compose down -v
```

### 3. Live Coding (Hot Reloading)

The environment is configured with **Volumes** that mirror your local code into the containers.

- **Backend**: Any changes in the `backend/` folder trigger an automatic Uvicorn reload.
- **Frontend**: Any changes in `frontend/src/` trigger a Next.js Fast Refresh.
- **Persistence**: You do not need to rebuild containers when changing code.

### 3. Debugging & Logs
Since services run in isolated containers, use the following to see output:

```bash
# Tail all logs
docker compose logs -f

# Tail only the backend (useful for API errors)
docker compose logs -f backend

# Tail only the frontend
docker compose logs -f frontend
```

### 4. Reloading Services
Depending on what you changed, use one of the following methods to reload:

| Change Type | Action | Command |
| :--- | :--- | :--- |
| **Code (Logic/UI)** | **Automatic** | None (detected via volumes) |
| **Environment Variables** | **Recreate** | `docker compose up -d` |
| **Dependencies/Packages** | **Rebuild** | `docker compose up -d --build` |
| **Manual Restart** | **Restart** | `docker compose restart <service>` |

### 5. Managing Environment Variables

When you modify the `.env` file:

1. Update the `.env` file on your host machine.
2. Run `docker compose up -d`. Docker will detect the change and recreate the containers with the new variables.

## 🛠️ Internal Commands (Exec)

Sometimes you need to run commands "inside" the container context. Use `docker compose exec`:

| Task                       | Command                                            |
| :------------------------- | :------------------------------------------------- |
| **Run Backend Tests**      | `docker compose exec backend pytest`               |
| **Open Backend Shell**     | `docker compose exec backend bash`                 |
| **Reset/Seed Database**    | `docker compose exec backend python reset_db.py`   |
| **Access Database (PSQL)** | `docker compose exec db psql -U postgres -d flash` |
| **Add Node Packages**      | `docker compose exec frontend pnpm add <package>`  |

## 📦 Managing Dependencies

If you update `requirements.txt` or `package.json`:

```bash
# Rebuild images to install new dependencies
docker compose up -d --build
```

## ⚠️ Troubleshooting

### Port 5432 is already in use

If you have a local PostgreSQL service running, the Docker `db` container will fail to start.
**Fix:** `sudo systemctl stop postgresql` then `docker compose up -d`.

### Permission Denied (Docker Socket)

If you get a "connect to docker daemon" error:
**Fix:** `sudo usermod -aG docker $USER` (then log out and back in).
