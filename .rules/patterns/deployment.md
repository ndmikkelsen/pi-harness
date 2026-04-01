## Deployment Pattern

Keep deployment config repo-driven and aligned with `config/*.yml`.

- `config/deploy.yml` is a starter manifest, not a production-ready service definition for this CLI repo
- `config/deploy.cognee.yml` is the concrete optional Cognee service template
- keep `.kamal/secrets.example` placeholder-only and keep real `.kamal/secrets*` out of git
- route infra changes through repo edits and deploy tooling, not direct server mutation

### Optional Cognee Deploy Checklist

- keep `.codex/docker/Dockerfile.cognee` pinned to the published upstream digest because release tags are not consistently available on Docker Hub
- keep the hardened Kamal settings in `config/deploy.cognee.yml`: `/health` probe, `response_timeout: 300`, `LLM_MODEL=gpt-4o-mini`, `VECTOR_DATASET_DATABASE_HANDLER=pgvector`, and `ENABLE_BACKEND_ACCESS_CONTROL=false`
- update `.kamal/secrets` with a funded `LLM_API_KEY` before deploy; in this repo the local `.kamal/secrets` path may be symlinked, so editing `.env` alone does not change what Kamal injects
- deploy with `kamal deploy -c config/deploy.cognee.yml`
- verify in order: `GET /health`, `GET /api/v1/settings`, `POST /api/v1/add`, `POST /api/v1/cognify`, then `POST /api/v1/search`
