# Supabase MCP setup log (2026-04-06)

This environment attempted the requested setup steps:

1. `codex mcp add supabase --url https://mcp.supabase.com/mcp?project_ref=oxtifrkcypgjiyhgyajo`
   - Result: failed because `codex` CLI is not installed (`codex: command not found`).
2. Updated `~/.codex/config.toml` with:

```toml
[mcp]
remote_mcp_client_enabled = true
```

3. `codex mcp login supabase`
   - Result: failed because `codex` CLI is not installed (`codex: command not found`).
4. `/mcp` verification
   - Blocked until Codex CLI and interactive session are available.
5. Optional skill install: `npx skills add supabase/agent-skills`
   - Result: failed with npm registry 403 for package `skills` in this environment.

## Next steps on a machine with Codex CLI

Run:

```bash
codex mcp add supabase --url https://mcp.supabase.com/mcp?project_ref=oxtifrkcypgjiyhgyajo
codex mcp login supabase
```

Then open Codex and run `/mcp` to verify the Supabase server is authenticated.
