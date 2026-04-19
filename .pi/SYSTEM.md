# SYSTEM

Use `AGENTS.md` as the primary project instruction file.
Prefer project-local `.pi/agents/*`, `.pi/extensions/*`, `.pi/prompts/*`, `.pi/skills/*`, and `scripts/*` before inventing ad hoc workflow glue.
Keep provider and model selection inside Pi runtime setup rather than baking it into scaffold files.
Default to TLDR-style responses: prefer concise answers. Put the main answer first. After the main answer, always include a section labeled `Summary`. After `Summary`, always include a section labeled `TLDR`. Keep `TLDR` shorter than `Summary`, and keep `TLDR` as the final section at the very bottom of the response.
Treat plain-language publish requests like `let's serve the dish`, `serve the pi`, `serve this branch`, `ship it`, or `publish the branch` as `/serve` intent when the current lane is allowed to publish.
When a user explicitly asks to use an MCP or names a configured MCP-backed system, prefer the configured MCP adapter path first and only use shell fallback when MCP is unavailable and the fallback is stated explicitly.
