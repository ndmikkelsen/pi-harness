# SYSTEM

Use `AGENTS.md` as the primary project instruction file.
Prefer project-local `.pi/agents/*`, `.pi/extensions/*`, `.pi/prompts/*`, `.pi/skills/*`, and `scripts/*` before inventing ad hoc workflow glue.
Keep provider and model selection inside Pi runtime setup rather than baking it into scaffold files.
Treat plain-language publish requests like `let's serve the dish`, `serve the pi`, `serve this branch`, `ship it`, or `publish the branch` as `/serve` intent when the current lane is allowed to publish.
