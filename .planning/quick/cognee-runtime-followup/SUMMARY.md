# Cognee Runtime Follow-Up Summary

## What We Verified

- The previous `cognee/cognee:v0.5.6` pin is not published to Docker Hub, so deploys failed before boot until the image was switched to the published `latest` digest.
- `kamal-proxy` was probing `/up` by default; adding `proxy.healthcheck.path: /health` allows the Cognee container to boot successfully.
- Matching the stronger `flashloaner`/`btc-algo-trading` pattern, the deploy now also sets `response_timeout: 300` so long-running LLM-backed requests return Cognee errors instead of proxy `504`s.
- The live service is now healthy at `https://ai-harness-cognee.apps.compute.lan/health`.
- Cognee settings now report the explicit `gpt-4o-mini` model instead of the default `openai/gpt-5-mini` selection.
- The deploy now also forces `VECTOR_DATASET_DATABASE_HANDLER=pgvector`, aligning the dataset handler with the configured vector database provider.

## Verified Runtime Contract

- A funded `LLM_API_KEY` delivered through `.kamal/secrets` allows direct authenticated `gpt-4o-mini` chat completions from inside the live container.
- `POST /api/v1/add` now succeeds in about 3 seconds for a smoke markdown document.
- `POST /api/v1/cognify` now succeeds in about 10 seconds for the uploaded dataset.
- `POST /api/v1/search` now returns `200` with a grounded answer derived from the uploaded dataset.
- The durable operator guidance now needs to preserve one important gotcha: editing `.env` alone is not enough if Kamal is reading `.kamal/secrets` (or a symlinked secrets file) for deploy-time injection.

## Next Work

- `ai-harness-3rj` - restore queryability with funded LLM access
- `ai-harness-9nr` - document the preflight and post-deploy verification flow
