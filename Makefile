WEB_DIR=./web

# Default: fast development build (frontend only)
all: build-force

# Frontend-only build (for TypeScript, CSS, UI changes)
build:
	cd $(WEB_DIR) && npm install && npx tsc && npx @tailwindcss/cli -i src/styles.css -o dist/output.css

# Fast development start (use existing Docker images)
dev:
	docker compose up

# Frontend development (compile + start without rebuilding Docker)
dev-frontend: build dev

# Backend-only rebuild (when server.ts, class.ts, etc. change)
build-backend:
	docker compose up --build backend

# Full rebuild (rare - when Dockerfile or major changes)
build-force:
	docker compose up --build

# Production build (full rebuild with optimizations)
build-prod: build
	docker compose build --no-cache
	docker compose up -d

# Quick restart (when containers are already built)
restart:
	docker compose restart

# View logs (useful for debugging)
logs:
	docker compose logs -f
# Stop containers (keep images)
stop:
	docker compose down

# Clean frontend build files only
clean:
	rm -r $(WEB_DIR)/dist/ 2>/dev/null || true

# Clean everything (containers, images, volumes)
fclean:
	rm -r $(WEB_DIR)/dist/ 2>/dev/null || true
	rm -r $(WEB_DIR)/node_modules/ 2>/dev/null || true
	docker-compose down
	docker system prune -f

# Clean Docker cache (when storage gets full)
clean-docker:
	docker container prune -f
	docker image prune -a -f
	docker builder prune -f
	docker volume prune -f

# Nuclear option: clean everything including volumes
clean-all: fclean clean-docker
	docker system prune -a --volumes -f

re: fclean all

.PHONY: all build dev dev-frontend build-backend build-force build-prod restart logs stop clean fclean clean-docker clean-all re