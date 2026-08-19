<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project Docs: ALWAYS read before writing any module code

Before creating or modifying any module (routes, components, services, mock, forms, tables), read the relevant docs in `docs.codebase/`.

Start with `docs.codebase/README.md` — it lists all docs and which ones to read for each task type.

When working on a specific domain, also read `docs.business/domains/<domain>/domain.yaml` for business logic relevant to that domain only.
