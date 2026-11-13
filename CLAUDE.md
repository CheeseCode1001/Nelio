# Nelio — instructions for Claude Code

Start here:
1. `docs/source/04_MASTER_PROMPT_2_CLAUDE_CODE.md`: the implementation brief (stack, milestones, security, launch gates).
2. `docs/CLAUDE_CODE_HANDOFF.md`: the approved design and how to build it faithfully. Design canvas: https://claude.ai/artifact/5rE8YAdMngxLvgf5GsdPKu (offline copy: `docs/design/E_hifi/canvas/`).

Non-negotiables:
- The design is approved. Don't redesign it. Light theme is the default; flat colour only (no gradients).
- The product never names AI, transcription or media vendors. The AI is "Nelio AI".
- Every screen ships Filled, Empty, Loading and its edge states, desktop and mobile (modals become bottom sheets on mobile).
- Never claim an integration, payment provider or feature works until it's verified. Show the honest gated state.
- Credentials only via secure env setup: never in chat, code or commits.
- End of every milestone: a full UI and responsiveness check of everything built so far (this milestone and all earlier ones). Pull the live canvas boards and diff them against `docs/design/E_hifi/canvas/` (the owner edits the canvas directly), build any change, then check every screen and state on mobile (375), tablet (768, 1024) and desktop (1440). Report what differs.
