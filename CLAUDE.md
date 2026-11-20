# Nelio — instructions for Claude Code

Start here:
1. `docs/source/04_MASTER_PROMPT_2_CLAUDE_CODE.md`: the implementation brief (stack, milestones, security, launch gates).
2. `docs/CLAUDE_CODE_HANDOFF.md`: the approved design and how to build it faithfully. The design is two canvases that form one design (a canvas holds at most 512 files):
   - Main canvas: https://claude.ai/artifact/5rE8YAdMngxLvgf5GsdPKu (offline copy: `docs/design/E_hifi/canvas/`).
   - Nelio Studio canvas: https://claude.ai/artifact/SvKwDjia8PLUWyY7b16Stn (offline copy: `docs/design/E_hifi/canvas-studio/`), with the Studio feature plan at https://claude.ai/artifact/65M4cHQBPnNAhd3D8ZDC7Y.

Non-negotiables:
- The design is approved. Don't redesign it. Light theme is the default; flat colour only (no gradients).
- The product never names AI, voice, video, transcription or media vendors. The AI is "Nelio AI".
- Every screen ships Filled, Empty, Loading and its edge states, desktop and mobile (modals become bottom sheets on mobile).
- Never claim an integration, payment provider or feature works until it's verified. Show the honest gated state.
- Credentials only via secure env setup: never in chat, code or commits.
- Nelio Studio: a real person's face or voice is used only with that person's verified, revocable consent. Public figures, anyone without consent and minors are blocked, with the designed blocked state.
- End of every milestone: a full UI and responsiveness check of everything built so far (this milestone and all earlier ones). Pull the live boards of both canvases and diff them against `docs/design/E_hifi/canvas/` and `docs/design/E_hifi/canvas-studio/` (the owner edits the canvases directly), build any change, then check every screen and state on mobile (375), tablet (768, 1024) and desktop (1440). Report what differs.
