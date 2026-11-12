# Nelio — Design Deliverable C: Low-fidelity wireframes

**Phase:** Design (Master Prompt 1) — checkpoint C of A–H
**Date:** 12 November 2026
**Status:** Draft for review.

## How to open

Open `docs/design/C_wireframes/index.html` in any browser. It's one self-contained file with no internet or install needed.

- **Left panel:** every screen grouped by area; type in the filter to search by ID, name or route.
- **One screen / All screens:** "All screens" stacks all 94 for scrolling or printing to PDF (one screen per page).
- Each screen shows a **desktop frame**, a **mobile frame**, numbered **notes**, the **states to design**, and the **requirements it traces to** (A/B IDs).
- Links are shareable: `index.html#CL-03` opens the Clipping Studio directly.

## Coverage

All **94** screens from A §2 (8 public + 86 product), each with desktop and mobile frames. Screen IDs, routes and roles match A and B exactly.

## Conventions

- **Greyscale on purpose.** Colour, type and brand come in D. Grey bars = text, striped boxes = media.
- **Black filled button** = the screen's primary action. **Black chip** = needs attention (blocked, failed, unknown, needs approval).
- **Dashed "MOCK" banner / "Demo AI" chip** = simulated integration or AI. These carry into the prototype so nothing looks live that isn't (D-01).
- **"Prototype · mock data" ribbon** on every signed-in surface.
- On mobile, tables collapse into one row per item with all values in a summary line; side-by-side panels stack.

## Layout decisions made in C

| # | Decision | Where |
|---|---|---|
| C-L1 | Command Center: "Needs attention" sits top-right on desktop and **first** on mobile, above KPIs | APP-01 |
| C-L2 | Activity Center is a feed + run-detail split. Steps replace percentages unless progress is measurable | APP-03 |
| C-L3 | Clipping Studio desktop: candidates + transcript (left), 9:16 preview + style + edit-with-words (right), timeline under preview | CL-03 |
| C-L4 | Post detail leads with a **per-destination table** (approval · publish status · attempts · action), because posts can be partially approved | PB-03 |
| C-L5 | Client approval: one tab per platform with its own Approve / Request changes / Reject buttons | CP-02 |
| C-L6 | Autonomous authorization is a modal that restates exact limits plus an "I understand" checkbox | APP-06, ON-04 |
| C-L7 | Gated features (AI video, paid licensing payouts, TikTok/Facebook) use a full empty state with "Notify me", never a disabled-looking form | CS-03, LI-10, IN-01 |
| C-L8 | Admin uses a black "audited" strip across the top to separate it from tenant UI | AD-* |
| C-L9 | Trial, past-due and paused states are banners at the top of the content area, with one action each | BI-07, BI-08, ST-10 |

## Next

**D: Design system**, covering brand direction for Nelio, colour tokens (Dark default + Light), typography, components, states and accessibility spec.
