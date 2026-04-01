# Cognee Runtime Follow-Up Plan

## Context

- `ai-harness-a1p` uncovered multiple deploy/runtime mismatches in the optional Cognee flow.
- The service now boots with the published Docker Hub digest, `kamal-proxy` probes `/health`, extends request handling to `response_timeout: 300`, and the deploy config sets `LLM_MODEL=gpt-4o-mini` plus `VECTOR_DATASET_DATABASE_HANDLER=pgvector` explicitly.
- Live verification now succeeds end-to-end with a funded key in `.kamal/secrets`: upload, cognify, and search all complete successfully against the committed deploy.
- The shared `compute-stack` Cognee deployment shows the same external `504` behavior on `/api/v1/search`, so the remaining blocker is bigger than this repo's deploy shape alone.

## Beads Mapping

- `ai-harness-a1p` - umbrella bug for the optional Cognee boot/runtime mismatch
- `ai-harness-rl2` - land the hardened optional Cognee implementation on the feature branch and PR
- `ai-harness-3rj` - restore queryability with funded LLM access
- `ai-harness-9nr` - document preflight and post-deploy verification

## Goal

Make the optional Cognee path reproducibly deployable and queryable, with enough guidance that future operators can verify it without repeating ad-hoc live debugging.

## Planned Steps

1. Complete `ai-harness-rl2` by committing and landing the image-digest, proxy-healthcheck, proxy-timeout, vector-handler, and explicit-model changes in the scaffold source and dogfooded repo.
2. Resolve `ai-harness-3rj` by using a funded LLM key or a supported alternate provider and rerunning upload/cognify/query checks against the committed deploy path.
3. Complete `ai-harness-9nr` by capturing the verified operator contract in durable docs, including health, upload, cognify, and query checks plus required secret/provider expectations.

## Execution Order

1. `ai-harness-rl2` (closed)
   - Acceptance: local changes are committed, pushed, and reflected in the active PR; committed `kamal deploy -c config/deploy.cognee.yml` keeps the service healthy.
2. `ai-harness-3rj` (verified)
   - Acceptance: `POST /api/v1/add`, `POST /api/v1/cognify`, and `POST /api/v1/search` succeed against `ai-harness-cognee.apps.compute.lan` with a funded/supported provider path.
3. `ai-harness-9nr` (in progress)
   - Acceptance: docs capture the final preflight, deploy, and verification contract that actually worked in production-like validation.
