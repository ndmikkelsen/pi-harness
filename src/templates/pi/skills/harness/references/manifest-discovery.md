# Manifest Discovery

Use these files to infer stack, tooling, and deployment shape.

## JavaScript / TypeScript
- `package.json`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- `turbo.json`
- `tsconfig.json`

## Python
- `pyproject.toml`
- `requirements.txt`
- `poetry.lock`

## Go
- `go.mod`

## Rust
- `Cargo.toml`

## Java / Kotlin
- `pom.xml`
- `build.gradle`
- `build.gradle.kts`

## Containers and deploy
- `Dockerfile*`
- `docker-compose*.yml`
- `compose*.yml`
- `.config/deploy*.yml`
- `config/deploy*.yml`
- `.kamal/`

## What to extract

- package manager or build system
- application type: library, CLI, API, web app, monorepo, service set
- runtime language and frameworks
- test commands
- deploy clues and infrastructure assumptions
