## Beads Integration Pattern

Use `.claude/scripts/bd` for Beads commands.

Run `bd init` once per repository to initialize Beads using the official defaults.
Use `bd dolt show` to inspect the active Beads connection and `bd dolt set <key> <value>` when you need to override host, port, database, or user.
Set `BEADS_DOLT_PASSWORD` only when your Dolt server requires a password.
For worktrees, rely on Beads' built-in shared `.beads/` handling or `bd worktree create`; do not add custom compute/local switching in repo scripts.
