---
name: Subagent screenshot limitation
description: Subagents cannot take screenshots or run automated tests; the parent agent must do final visual verification.
---

In this environment, delegated subagents (DESIGN/GENERAL) do NOT have the `screenshot`
callback or automated testing available. They can only verify a mockup/component
"renders" indirectly (HTTP 200 on the preview route, clean Vite module transform,
clean LSP) — none of which catches visual/layout breakage or a runtime error overlay.

**Why:** When fanning out subagents to build canvas mockup screens, every subagent
reported success via "HTTP 200 + compiles", but only the parent's `screenshot`
(app_preview) calls can actually confirm the UI looks right.

**How to apply:** After subagents finish mockup/canvas work, the parent must restart
the workflow once and screenshot each preview route itself before presenting. Don't
trust subagent "verified rendering" claims as a substitute for a real screenshot.
