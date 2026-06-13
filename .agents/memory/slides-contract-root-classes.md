---
name: Slides root-class "exact" contract
description: What the slides /allslides root-class rule actually requires, and a recurring code-review false positive about it.
---

The slides export view (`/allslides`) scales each slide into a fixed 1920x1080 box using selectors `[&_.w-screen]:!w-full [&_.h-screen]:!h-full`. The rule "every slide root must use exactly `w-screen h-screen overflow-hidden relative`" means those four classes must be **present** (not replaced with variants like `w-full h-full`, `min-h-screen`). It does NOT forbid additional utility classes on the root (e.g. `bg-bg text-text font-display`).

**Why:** The scale-override only needs `.w-screen`/`.h-screen` to match; extra classes don't affect it. Confirmed by `/allslides` rendering correctly with extra root classes present.

**How to apply:** When the code-review/architect subagent flags "slide roots have extra classes beyond exactly the 4 → contract violation," treat it as a false positive if the four required classes are present and `/allslides` renders correctly. No change needed. (Do still enforce: no bare `.slide` class on/inside the slide root; body text ≥1.5vw floor.)
