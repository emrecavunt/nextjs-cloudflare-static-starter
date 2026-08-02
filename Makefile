# ============================================================
# nextjs-cloudflare-static-starter
#
# Run `make` or `make help` to list available targets.
# Requires: Node 24 (.nvmrc) and pnpm 10+.
# Terraform targets take BACKEND=cloudflare|gcp|aws.
# ============================================================

PKG := pnpm

.DEFAULT_GOAL := help

.PHONY: help install dev build lint typecheck format check preview deploy \
        test test-smoke tf-init tf-plan tf-apply clean distclean

help: ## Show this help
	@echo "nextjs-cloudflare-static-starter: make targets"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| sort \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "Terraform: make tf-plan BACKEND=cloudflare|gcp|aws"

install: ## Install dependencies
	$(PKG) install

dev: ## Start the dev server (http://localhost:3000)
	$(PKG) dev

build: ## Static export → out/
	$(PKG) build

lint: ## Run ESLint
	$(PKG) lint

typecheck: ## Run tsc --noEmit
	$(PKG) typecheck

format: ## Prettier format all files
	$(PKG) format

test: build ## Playwright e2e against the static export (what CI runs)
	$(PKG) test:e2e

test-smoke: ## Playwright smoke against a deployed URL (SMOKE_BASE_URL=https://your.site)
	@test -n "$(SMOKE_BASE_URL)" || { echo "usage: make test-smoke SMOKE_BASE_URL=https://your.site"; exit 1; }
	SMOKE_BASE_URL=$(SMOKE_BASE_URL) $(PKG) test:smoke

check: lint typecheck test ## Run what CI runs (lint + typecheck + build + e2e)

preview: build ## Build and serve out/ locally (http://localhost:3000)
	$(PKG) exec serve out -l 3000

deploy: build ## Build and deploy out/ to Cloudflare Pages
	$(PKG) exec wrangler pages deploy out

# ---------- terraform ----------

tf-init: ## terraform init (BACKEND=cloudflare|gcp|aws)
	@test -n "$(BACKEND)" || { echo "usage: make tf-init BACKEND=cloudflare|gcp|aws"; exit 1; }
	cd terraform/$(BACKEND) && terraform init

tf-plan: ## terraform plan (BACKEND=cloudflare|gcp|aws)
	@test -n "$(BACKEND)" || { echo "usage: make tf-plan BACKEND=cloudflare|gcp|aws"; exit 1; }
	cd terraform/$(BACKEND) && terraform plan

tf-apply: ## terraform apply (BACKEND=cloudflare|gcp|aws)
	@test -n "$(BACKEND)" || { echo "usage: make tf-apply BACKEND=cloudflare|gcp|aws"; exit 1; }
	cd terraform/$(BACKEND) && terraform apply

# ---------- housekeeping ----------

clean: ## Remove build output (.next, out)
	rm -rf .next out

distclean: clean ## Also remove node_modules
	rm -rf node_modules
