---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: ["src/app/topics/page.tsx","src/app/topics/[slug]/page.tsx","src/app/practice/page.tsx","src/app/dashboard/page.tsx","src/app/teacher/layout.tsx"]
---

# Surface Brief: OP-APCS TraceLab Whole-App Redesign

- **Scope**: Whole-app visual overhaul across primary student & teacher surfaces (`/`, `/topics`, `/topics/[slug]`, `/practice`, `/dashboard`, `/teacher`)
- **Mode**: operate
- **Audience**: Taiwanese middle and high school students (ages 12–18) and CS teachers on Chromebooks, iPads, laptops, and daytime classroom projectors.
- **Job & Action**: Explore the 5 APCS Python topics, scrub live execution traces step-by-step, complete 30 official questions with instant misconception diagnostics, and monitor isolated class analytics.
- **Constraints**: Preserve all API routes, Neon Postgres/SQLite schema, 30 official questions, 5 interactive visualizer algorithms, auth/cookies, and strict teacher class isolation. Zero Direction Contract text in shipped code.

## Direction contract

- **THESIS**: Turn APCS Python code reading into a hands-on hardware synthesizer workbench (`OP-APCS`) where every topic is a color-coded modular channel (`MOD-01`..`MOD-05`) and code tracing lives inside a high-contrast OLED screen — refusing the dry beige syllabus/exam-bank table layout.
- **OWN-WORLD**: Matte anodized cool-silver aluminum chassis (`#E6E9EE` dot-grid ground, `#F8F9FB` machined faceplates, `#C4CBD6` seams, `#161A22` active bezels), recessed pitch-black OLED monitors (`#0D1117`), Signal Orange (`#FF4F17`) student action keycaps, Studio Emerald (`#008F6B`) teacher master console, 5 saturated per-topic hardware channels (`#FF4F17`, `#2563EB`, `#00A878`, `#7C3AED`, `#D98200`), tactile pressable keycap shadows (`0 3px 0 #161A22`), `Chakra Petch` silkscreen unit codes + `Noto Sans TC` bold headings + `JetBrains Mono` code/telemetry.
- **STORY**: Within 3 seconds, a teenager sees Python execution alive inside an OLED trace deck they can scrub step-by-step, understands the 5 hardware modules and 30 sequencer challenge pads, and immediately wants to click and test code rather than feeling boxed into a test bank.
- **FIRST VIEWPORT**: Top anodized instrument bar (`OP-APCS`) with hardware mode switches; hero splits 5/7 between punchy headline + Signal Orange pressable CTA keycaps + 3-LED telemetry counter on the left, and a live recessed OLED `CodeTraceStepper` with tactile transport keys and real-time step scrubber on the right; below, asymmetric 5-module hardware rack (`MOD-01`..`MOD-05`) and 6-pad trigger bar (`PAD-A`..`PAD-F`).
- **FORM**: Tactile Modular Synthesizer & Patch-Bay Studio (grounded candidate #7, assigned roll, seed key `bf6e59d5`), raised by real-time scrubber linkage (`variable-font-specimen`), exposed coordinate grid (`crouwel-grid-specimen`), and persistent LED status stamps (`ticket-wallet`).
- **FINISH**: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
