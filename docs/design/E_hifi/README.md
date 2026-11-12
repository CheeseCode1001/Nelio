# Nelio: Deliverable E, high-fidelity UI

The live design canvas is the source of truth: https://claude.ai/artifact/5rE8YAdMngxLvgf5GsdPKu

- `canvas/`: a copy of every board (`*.dc.html`) and the canvas layout (`canvas.json`) as published on 12 Nov 2026. If someone edits the canvas by hand, the canvas wins.
- `generator/`: the Python that produced the boards. `lib.py` holds the tokens and components, `p00…p12` build one canvas page each, `canvas.py` lays the pages out. Run `python3 run.py` (it writes to `/home/claude/nelio-design/project`; change `OUT` in `lib.py`).

122 boards: 94 screens (IDs from A §2) + foundations, interactive onboarding, 7 state sheets, 10 mobile and 9 light-theme boards. See `../H_handoff/SCREEN_INVENTORY.md`.
