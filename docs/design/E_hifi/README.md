# Nelio: Deliverable E, high-fidelity UI (v2)

Live canvas (source of truth): https://claude.ai/artifact/5rE8YAdMngxLvgf5GsdPKu

- `canvas/`: a copy of all 369 boards (`*.dc.html`) and `canvas.json` as published on 12 Nov 2026. If the canvas is edited by hand, the canvas wins.
- `generator/`: the Python that builds every board. `lib2.py` = tokens, components, shells, skeletons, motion keyframes · `illus.py` = 32 illustrations · `frame.py` = state framework and page shells · `s00…s12` = one canvas page each · `canvas2.py` = layout. Run `python3 run2.py` (writes to `/home/claude/nelio-design2/project`; change `OUT` in `lib2.py`).
- `v1_archive/`: the first (dark, pre-reference) generator, kept for history.

Style: light default, flat colour (no gradients), references: ClipGen, Pop Site, Retro, lime savings site. Motion: GSAP (see `../H_handoff/MOTION.md`).
