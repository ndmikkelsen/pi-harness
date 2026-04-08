## Deployment Pattern

Keep deployment config repo-driven and aligned with `config/*.yml`.

- treat `config/deploy.yml` as a starter manifest that still needs service-specific customization
- use `config/deploy.cognee.yml` only when the repository opts into the optional Cognee service flow
- keep `.kamal/secrets.example` placeholder-only and keep `.kamal/secrets*` out of git
- route infrastructure changes through repo edits and deploy tooling, not direct server mutation

### Optional Cognee Deploy Checklist

- keep `.codex/docker/Dockerfile.cognee` pinned to the published upstream digest because release tags are not consistently available on Docker Hub
- keep the hardened Kamal settings in `config/deploy.cognee.yml`: `/health` probe, `response_timeout: 300`, `LLM_MODEL=gpt-4o-mini`, `VECTOR_DATASET_DATABASE_HANDLER=pgvector`, and `ENABLE_BACKEND_ACCESS_CONTROL=false`
- update `.kamal/secrets` with a funded `LLM_API_KEY` before deploy; `.env` alone may not control what Kamal injects
- deploy with `kamal deploy -c config/deploy.cognee.yml`
- verify in order: `GET /health`, `GET /api/v1/settings`, `POST /api/v1/add`, `POST /api/v1/cognify`, then `POST /api/v1/search`
