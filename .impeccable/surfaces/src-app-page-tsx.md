---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: ["src/app/topics/page.tsx","src/app/topics/[slug]/page.tsx","src/app/practice/page.tsx","src/app/dashboard/page.tsx","src/app/teacher/layout.tsx"]
---

# Surface Brief: APCS RAIL Whole-App Redesign

- **Scope**: Whole-app visual overhaul across primary student & teacher surfaces (`/`, `/topics`, `/topics/[slug]`, `/practice`, `/dashboard`, `/teacher`)
- **Mode**: operate
- **Audience**: Taiwanese middle and high school students (ages 12–18) and CS teachers on Chromebooks, iPads, laptops, and classroom projectors.
- **Job & Action**: Explore the 5 APCS Python topics as metro lines, click any of the 30 station dots on the interactive transit map, step through Python code traces, and manage rosters/analytics via concourse timetables with ~70% less text.
- **Constraints**: Preserve all API routes, Neon Postgres/SQLite schema, 30 official questions, 5 interactive visualizer algorithms, auth/cookies, disabled self-registration, and strict teacher class isolation. Zero Direction Contract text in shipped code.

## Direction contract

- **THESIS**: Replace boxed EdTech SaaS cards and verbose paragraphs with a fired midnight-blue enamel metropolitan transit mural (`APCS RAIL`) where the 5 APCS Python topics are 45°/90° enamel rail lines (`L1`–`L5`) and all 30 official questions are directly clickable porcelain station nodes; teacher administration becomes a hairline concourse dispatch timetable.
- **OWN-WORLD**: Midnight enamel ground (`#0B1230`), recessed code/input wells (`#070C22`), elevated enamel plates (`#111B45`), porcelain white ink (`#FFFFFF` / `#B8C5E0` / `#7E91B8`), crisp 1px porcelain hairlines (`rgba(255,255,255,0.22)`), 5 fired line inks (`L1` Scarlet `#E21D2D`, `L2` Cobalt `#1E5BFF`, `L3` Signal Green `#22B14C`, `L4` Amber `#FFC20E`, `L5` Cyan `#14B8C4`), `Barlow Condensed` condensed transit display + `Noto Sans TC` + `JetBrains Mono` tabular figures, zero drop-shadow SaaS cards.
- **STORY**: Within 2 seconds with near-zero prose, students see all 5 APCS tracks and 30 clickable stations lit by real progress, click any station to jump straight into Python execution stepping/answering, while teachers manage rosters, student accounts, and class blind-spot matrices via crisp concourse timetables.
- **FIRST VIEWPORT**: Desktop fixed left porcelain-framed vertical rail (`216px`, brand + 1-word nav + live status; mobile uses slim top bar + fixed bottom 4-tab bar); main canvas splits 4/8 between condensed headline + 2 crisp transit action buttons + interactive 5-line timetable on the left and a real data-driven 45°/90° interactive SVG transit map (`TransitNetworkMap`) with 30 clickable station circles on the right; below, 3 hairline concourse dock panels (line progress, 6 exam-type transfers, compact interactive Q8 trace).
- **FORM**: Metropolitan Rail Map Fired As A Midnight-Blue Enamel Mural (`wayfinding-cartography-signage-midnight-transit-diagram`, winning catalog challenger, seed key `8f32e3f3`).
- **FINISH**: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
