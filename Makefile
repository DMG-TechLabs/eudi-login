DIST=dist
.DEFAULT_GOAL := help

.PHONY: start
start: ## Start the php server
	docker compose up -d --remove-orphans

.PHONY: stop
stop: ## Stop the php server
	docker compose down

.PHONY: rebuild
rebuild: ## Rebuild docker image
	docker compose build

.PHONY: logs
logs: ## Print logs
	docker compose logs -f

.PHONY: clean
clean: ## Clean docker environment
	docker system prune -f

.PHONY: dist
dist: ## Create a distribution directory
	mkdir -p $(DIST)
	cp -r src $(DIST)
	cp -r demo $(DIST)
	cp -r README.md $(DIST)
	cp -r Dockerfile $(DIST)
	cp -r docker-compose.yml $(DIST)
	cp -r docker-entrypoint.sh $(DIST)
	cp -r Makefile $(DIST)
	cp -r CHANGELOG.md $(DIST)

.PHONY: distclean
distclean: ## Clean the distribution
	rm -rf $(DIST)

.PHONY: help
help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'
