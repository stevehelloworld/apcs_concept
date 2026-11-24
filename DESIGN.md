---
name: APCS RAIL 程式識讀路網
description: 午夜藍琺瑯都市捷運圖風格（Midnight-Blue Enamel Transit Diagram）的國高中 Python APCS 互動路網與班級調度後台設計系統
colors:
  enamel-ground: "#0B1230"
  enamel-deep: "#070C22"
  enamel-plate: "#111B45"
  enamel-hover: "#172459"
  enamel-kiln-edge: "#132055"
  enamel-track-well: "#1A275C"
  enamel-muted-fill: "#1E2A5E"
  enamel-scrim: "#040817"
  enamel-input-focus: "#09102D"
  enamel-thumb: "#273873"
  enamel-thumb-hover: "#3B529E"
  porcelain-white: "#FFFFFF"
  porcelain-secondary: "#B8C5E0"
  porcelain-muted: "#7E91B8"
  line-scarlet: "#E21D2D"
  line-scarlet-hover: "#C51624"
  line-scarlet-soft: "#FF7A85"
  line-cobalt: "#1E5BFF"
  line-cobalt-hover: "#1646CC"
  line-cobalt-soft: "#7AA4FF"
  line-green: "#22B14C"
  line-green-btn: "#168A3B"
  line-green-hover: "#127230"
  line-green-soft: "#4ADE80"
  line-amber: "#FFC20E"
  line-amber-hover: "#E0AA00"
  line-amber-soft: "#FFD452"
  line-cyan: "#14B8C4"
  line-cyan-hover: "#0E9AA5"
  line-cyan-soft: "#5EEAD4"
typography:
  display:
    fontFamily: "Barlow Condensed, Noto Sans TC, sans-serif"
    fontSize: "clamp(1.75rem, 3.2vw, 3rem)"
    fontWeight: 800
    lineHeight: 1.06
    letterSpacing: "0.04em"
  title:
    fontFamily: "Noto Sans TC, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 900
    lineHeight: 1.3
  body:
    fontFamily: "Noto Sans TC, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
  code:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.6
  label:
    fontFamily: "JetBrains Mono, Noto Sans TC, monospace"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.4
  badge:
    fontFamily: "JetBrains Mono, Noto Sans TC, monospace"
    fontSize: "11px"
    fontWeight: 700
    lineHeight: 1.3
  micro:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "10px"
    fontWeight: 600
    lineHeight: 1.2
rounded:
  xs: "2px"
  sm: "4px"
  btn: "5px"
  md: "6px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.line-scarlet}"
    textColor: "{colors.porcelain-white}"
    typography: "{typography.label}"
    rounded: "{rounded.btn}"
    padding: "8px 16px"
  button-teacher:
    backgroundColor: "{colors.line-green-btn}"
    textColor: "{colors.porcelain-white}"
    typography: "{typography.label}"
    rounded: "{rounded.btn}"
    padding: "8px 16px"
  button-secondary:
    backgroundColor: "{colors.enamel-deep}"
    textColor: "{colors.porcelain-white}"
    typography: "{typography.label}"
    rounded: "{rounded.btn}"
    padding: "8px 16px"
  concourse-frame:
    backgroundColor: "{colors.enamel-ground}"
    textColor: "{colors.porcelain-white}"
    rounded: "{rounded.md}"
    padding: "16px"
---

# Design System: APCS RAIL 程式識讀路網

## Overview

**Creative North Star: "Midnight-Blue Enamel Transit Diagram"**

APCS RAIL 將 2025 APCS Python 0915 全 30 題與五大知識單元轉化為一面燒製在午夜深藍琺瑯底板（`#0B1230`）上的城市捷運路網圖與調度時刻表。全站放棄盒裝白底卡片與冗長導讀文字，讓 `45°`／`90°` 五色幾何路線（`L1`–`L5`）、30 座可直接點擊的瓷白車站節點、凹槽式 Python 程式碼執行窗與緊湊時刻表成為唯一視覺主角。

系統統一使用左欄垂直軌道導覽（桌面）與底部 4 鍵分頁列（手機），並以**號誌綠（`#22B14C` / `#168A3B`）**識別教師頂部水平調度分頁。

## Colors

- **Midnight Enamel Ground (`#0B1230`)** / **Kiln Depth (`#070C22`)**：沉靜深邃的底層畫布與程式碼內凹井。
- **Porcelain Hairlines (`rgba(255,255,255,0.22)`)** / **Porcelain Inks (`#FFFFFF`, `#B8C5E0`, `#7E91B8`)**：1px 細線分隔欄框與高對比文字。
- **Line Inks**:
  - `L1 控制流` Scarlet (`#E21D2D` / `#FF7A85`)
  - `L2 迴圈` Cobalt (`#1E5BFF` / `#7AA4FF`)
  - `L3 陣列` Signal Green (`#22B14C` / `#168A3B` / `#4ADE80`)
  - `L4 遞迴` Amber (`#FFC20E` / `#FFD452`，實心按鈕搭配深藍 `#0B1230` 前景確保 AA 對比)
  - `L5 演算法` Cyan (`#14B8C4` / `#5EEAD4`，實心按鈕搭配深藍 `#0B1230` 前景)

## Typography & Concise Copy

- **Display**：`Barlow Condensed` 負責英文路線編號、大字統計數字（全面啟用 `tabular-nums`）與濃縮標題。
- **Body / Code**：`Noto Sans TC` 搭配 `JetBrains Mono`。
- **Minimal Copy Discipline**：全站移除頁首敘述段落與卡片冗餘副標，控制項只保留動作名稱、題號、`LINE`、數值與必要題幹。

## Layout & Navigation

- **Desktop**：固定左側 216px 瓷框垂直軌道（品牌、`路網`/`路線`/`刷題`/`進度`或`控台`、登入狀態）＋主視覺畫布（最大 `1320px`）。
- **Mobile (`390px`)**：精簡頂列＋固定底部 4 格分頁列，無任何水平捲動溢位。
- **Teacher Console (`/teacher/*`)**：採頂部水平調度分頁列（`總覽`、`班級`、`學生`、`題庫`、`講義`、`作業`），移除側邊卡片牆。

## Do's and Don'ts

- **Do** keep every rail segment in SVG diagrams strictly aligned at `45°` or `90°` angles with clear `CENTRAL` interchange separation.
- **Do** maintain crisp `1px` porcelain hairlines, zero blur block shadows, and high-contrast dark foreground ink (`#0B1230`) whenever filling Amber (`#FFC20E`), Cyan (`#14B8C4`), or Porcelain White (`#FFFFFF`) badges.
- **Don't** place eyebrows/kickers above headings, stack verbose multi-line explanation paragraphs in headers, use `>1px` colored left/right border stripes, or reintroduce light SaaS card grids.
