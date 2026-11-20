# Nelio: Deliverable E, high-fidelity UI (v2)

Live canvas (source of truth): https://claude.ai/artifact/5rE8YAdMngxLvgf5GsdPKu

- `canvas/`: a copy of all 369 boards (`*.dc.html`) and `canvas.json` as published on 12 Nov 2026. If the canvas is edited by hand, the canvas wins. Last synced with the live canvas on 20 Nov 2026 (version 1795156541, 476 boards).
- `canvas-studio/`: a copy of the linked Nelio Studio canvas (https://claude.ai/artifact/SvKwDjia8PLUWyY7b16Stn): 109 boards and `canvas.json`, synced on 20 Nov 2026 (version 1795156632). Same design; split off because a canvas holds at most 512 files.
- `generator/`: the Python that builds every board. `lib2.py` = tokens, components, shells, skeletons, motion keyframes · `illus.py` = 32 illustrations · `frame.py` = state framework and page shells · `s00…s12` = one canvas page each · `canvas2.py` = layout. Run `python3 run2.py` (writes to `/home/claude/nelio-design2/project`; change `OUT` in `lib2.py`).
- `v1_archive/`: the first (dark, pre-reference) generator, kept for history.

Style: light default, flat colour (no gradients), references: ClipGen, Pop Site, Retro, lime savings site. Motion: GSAP (see `../H_handoff/MOTION.md`).
