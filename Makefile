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
	@echo "Running database migrations..."
	npx run migrate	
	@echo "Starting the web application..."
	npm run dev

run-start:
	make start-db
	@echo "Waiting for the database to be ready..."
	sleep 5
	@echo "Running database migrations..."
	npx run migrate
	@echo "Building the application..."
	npm run build
	@echo "Starting application..."
	npm run start

start-db:
	@echo "Starting PostgreSQL database..."
	docker compose up -d postgres