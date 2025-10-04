include .env

POSTGRES_DB ?= myapp
POSTGRES_USER ?= myuser
POSTGRES_PASSWORD ?= mypassword
POSTGRES_HOST ?= localhost
POSTGRES_PORT ?= 5432

DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}

run-dev:
	@echo "Starting development server..."
	make start-db
	@echo "Waiting for the database to be ready..."
	sleep 5
	npm run dev

start-db:
	@echo "Starting PostgreSQL database..."
	docker compose up -d postgres