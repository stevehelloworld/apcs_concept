---
name: OP-APCS 識讀實驗室
description: Teenage Engineering 模組合成器風格的國高中 Python APCS 互動程式追蹤與班級管理設計系統
colors:
  signal-orange-action: "#D93B09"
  signal-orange-led: "#FF4F17"
  signal-orange-soft: "#FFF1EC"
  teacher-emerald: "#007A5B"
  teacher-emerald-soft: "#E6F7F2"
  mod-cobalt: "#1D4ED8"
  mod-mint: "#007A57"
  mod-violet: "#6D28D9"
  mod-amber: "#9A5800"
  chassis-aluminum: "#E6E9EE"
  faceplate-silver: "#F8F9FB"
  panel-white: "#FFFFFF"
  recess-bay: "#DDE2EA"
  border-seam: "#C4CBD6"
  bezel-obsidian: "#161A22"
  oled-screen: "#0D1117"
  oled-header: "#161B24"
  oled-border: "#1E2533"
  oled-text: "#EEF2F8"
  ink-primary: "#11151C"
  ink-secondary: "#4B5565"
  ink-muted: "#647082"
  status-success: "#007A57"
  status-error: "#C62828"
typography:
  display:
    fontFamily: "Chakra Petch, JetBrains Mono, sans-serif"
    fontSize: "clamp(1.5rem, 3vw, 1.875rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "0.04em"
  headline:
    fontFamily: "Noto Sans TC, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "clamp(1.875rem, 4vw, 2.5rem)"
    fontWeight: 900
    lineHeight: 1.18
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Noto Sans TC, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.35
  body:
    fontFamily: "Noto Sans TC, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.65
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
  xs: "4px"
  sm: "6px"
  md: "10px"
  lg: "12px"
  oled: "14px"
  xl: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-orange:
    backgroundColor: "{colors.signal-orange-action}"
    textColor: "{colors.panel-white}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "10px 18px"
  button-emerald:
    backgroundColor: "{colors.teacher-emerald}"
    textColor: "{colors.panel-white}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "10px 18px"
  button-pad:
    backgroundColor: "{colors.panel-white}"
    textColor: "{colors.ink-primary}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  oled-monitor:
    backgroundColor: "{colors.oled-screen}"
    textColor: "{colors.panel-white}"
    rounded: "{rounded.lg}"
    padding: "14px"
  module-card:
    backgroundColor: "{colors.panel-white}"
    textColor: "{colors.ink-primary}"
    rounded: "{rounded.xl}"
    padding: "20px"
---

# Design System: OP-APCS 識讀實驗室

## Overview

**Creative North Star: "The Modular Trace Synthesizer"**

OP-APCS 識讀實驗室專為國高中生與資訊科教師設計，將 Python 程式識讀與 2025 APCS 0915 全 30 題轉化為一台高對比的實體模組合成器工作台。全站拋棄傳統灰白試卷表格感，採用在白天教室投影機與筆電螢幕上依然清晰銳利的霧銀陽極鋁機殼網格底，讓程式碼追蹤器、五大知識模組與 30 個序列化關卡方塊具備立體儀器按壓手感與即時視覺回饋。

系統明確區分「學生實戰端」與「教師主控台」兩種場域能量，同時維持同一套機殼結構與鍵帽語彙：學生以訊號橘與五大模組通道色彩進行單步除錯與破關亮燈；教師則以深翡翠綠主控介面管理班級、指派作業與檢視熱度矩陣。

**Key Characteristics:**
- 霧銀陽極鋁打點底紋搭配外露 2px 深墨色儀器邊框，構築不顯幼稚卻充滿好奇心的青少年操作環境。
- 程式碼與執行狀態集中於凹槽式純黑高對比 OLED 螢幕內呈現，執行中行號以橘紅邊框與播放指標高亮標示。
- 五大主題各自擁有高飽和識別色彩與 `MOD-01` 至 `MOD-05` 模組編號，六大考法對應 `PAD-A` 至 `PAD-F` 觸發墊。
- 任何狀態更新（步驟推桿、滑動測資條、題庫過關綠燈）皆以明確色點 LED 與數值暫存器即時呈現。

## Colors

以冷灰霧銀金屬機殼作為白天教室易讀基底，結合高對比深黑 OLED 螢幕與具備 WCAG AA 4.5:1 以上字體對比度的飽和訊號通道。

### Primary
- **Signal Orange Action** (`#D93B09`): 用於學生端核心送出、模擬考觸發與主要操作鍵帽，確保白色粗體字在 12px 尺寸下仍保有高對比可讀性。
- **Signal Orange LED** (`#FF4F17`): 僅用於 8px 指示燈號、步驟滑桿推頭、選取文字底色與模組色條，不用作小尺寸白字按鈕滿版底色。
- **Studio Emerald** (`#007A5B`): 教師管理後台（`/teacher/*`）專用主色，用於側邊欄啟動鍵、表單確認按鈕與班級管理互動控制。

### Secondary
- **Module 02 Cobalt** (`#1D4ED8`): 專屬於「迴圈、range 與基本運算（MOD-02）」模組色帶、按鈕與進度條。
- **Module 03 Mint** (`#007A57`): 專屬於「列表、二維陣列與索引操作（MOD-03）」模組與全站答對通關提示。
- **Module 04 Violet** (`#6D28D9`): 專屬於「函式與遞迴思維（MOD-04）」模組與呼叫堆疊激活框。
- **Module 05 Amber** (`#9A5800`): 專屬於「經典演算法、資料結構與複雜度（MOD-05）」模組與反例警示標籤。

### Neutral
- **Chassis Aluminum** (`#E6E9EE`): 全站頁面基礎背景色，疊加 `20px × 20px` 細微金屬孔位打點底紋。
- **Faceplate Silver** (`#F8F9FB`): 次級儀器面板與雙欄右半關卡矩陣區域底色。
- **Panel White** (`#FFFFFF`): 焦點模組與互動卡片表面，確保長題幹閱讀對比度。
- **Recessed Bay** (`#DDE2EA`): 模式切換槽與拉桿軌道底槽，製造向內凹陷的儀器分區層次。
- **Obsidian Bezel** (`#161A22`): 焦點面板 2px 外框、鍵帽陰影基準線、Active 分頁底色與官方題號徽章。
- **OLED Screen** (`#0D1117`): Python 程式碼監視器、變數暫存器、標準輸出端與儀表板數據螢幕背景。

### Named Rules
**The Button Contrast Rule.** 凡帶有白色文字（`#FFFFFF`）的操作按鈕與鍵帽，一律採用加深飽和版色碼（訊號橘按鈕使用 `#D93B09`、翡翠綠按鈕使用 `#007A5B`、模組按鈕使用各通道 `buttonBg`），嚴禁將亮色 LED 專用的 `#FF4F17` 或 `#00C48C` 直接鋪成小字白字按鈕背景。
**The OLED Containment Rule.** 所有 Python 程式碼預覽、執行步驟堆疊、標準輸出與即時數值儀表皆收容於純黑 OLED 凹槽面（`#0D1117`）內，禁止將深色背景擴大成全站夜間模式而犧牲日間投影閱讀性。

## Typography

**Display Font:** Chakra Petch (fallback: JetBrains Mono, sans-serif)
**Body Font:** Noto Sans TC (fallback: -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif)
**Code Font:** JetBrains Mono (fallback: ui-monospace, SFMono-Regular, Menlo, monospace)

**Character:** 以銳利幾何的 `Chakra Petch` 擔綱 `MOD-01`、`PAD-A`、`OP-APCS`、`STEP 01/03` 等拉丁與數字絲印編碼，搭配高字重筆畫紮實的 `Noto Sans TC` 承載繁體中文主標題與題幹閱讀，形成現代合成器面板與雙語教學的俐落比例。

### Hierarchy
- **Display** (`700`, `clamp(1.5rem, 3vw, 1.875rem)`, `1.15`, `+0.04em`): 僅用於英文機身型號、模組代號（`MOD-01`..`05`）、題型墊代號（`PAD-A`..`F`）與 OLED 巨型統計數字。
- **Headline** (`900`, `clamp(1.875rem, 4vw, 2.5rem)`, `1.18`, `-0.02em`): 頁面 `<h1>` 主標語與主題單元大標題，直接置於頁面頂端領銜。
- **Title** (`700`, `1.125rem`, `1.35`): 模組卡片名稱、題目標題與雙欄子區段標題。
- **Body** (`400`, `0.9375rem`, `1.65`): 題幹敘述、觀念摘要與詳解內文，長段落維持於 `65ch` 可讀欄寬內。
- **Label / Mono** (`700`, `0.75rem`, `1.4`): 等寬行號、變數值、`0915-Q1` 徽章、對齊數值（全面啟用 `tabular-nums`）。

### Named Rules
**The Script Segregation Rule.** `Chakra Petch` 僅套用於英文與數字識別標記；所有繁體中文標題、按鈕標籤與內文必須使用 `Noto Sans TC`，防止混排時英文幾何字體替代造成筆畫粗細斷裂。
**The Direct Headline Rule.** 各頁與區塊主標題上方不放置任何微型 Kicker 或眉標膠囊；標題以字重與級距自行建立視覺焦點，相關單元編號則以行內標籤緊鄰顯示或置於專屬規格欄中。

## Layout

採用 `max-w-7xl`（`1280px`）響應式空間容器，外圍左右保留 `16px`（手機）至 `24px`（桌機）留白。首頁首屏以 `5 : 7` 十二欄切割為核心控制解說區與右側實境單步追蹤器；五大主題則捨棄單調條列，首頁採 `2 + 3` 不對稱機櫃格線，全主題總覽頁（`/topics`）移除佔據橫向空間的左側欄，改以頂部五通道快速跳轉列與兩欄式硬體機架（左側 340px 主題規格槽 × 右側多欄 30 題關卡矩陣方格）最大化利用全寬視窗。在 `390px` 行動裝置下，所有矩陣、選項墊與程式碼窗格均收斂為單欄垂直堆疊與獨立水平捲動表格，確保零水平溢位。

## Elevation & Depth

本系統結合精密機構分隔線與帶有柔化陰影的實體鍵帽倒角，呈現清晰可辨的「外框高度差」而非飄浮裝飾光暈。所有次級面板透過底槽凹陷（`inset 0 2px 5px`）與表層微立體按鈕（`box-shadow: 0 3px 6px -2px rgba(17, 21, 28, 0.18), inset 0 -2px 0 rgba(22, 26, 34, 0.14)`）形成按壓物理層次；點擊鍵帽時立即執行 `1.5px` 下沉壓縮回饋。

### Shadow Vocabulary
- **Machined Panel** (`box-shadow: 0 4px 10px -3px rgba(17, 21, 28, 0.08), inset 0 -2px 0 rgba(196, 203, 214, 0.55)`): 用於次級面板與導覽側欄機盒。
- **Active Hardware Casing** (`box-shadow: 0 6px 16px -4px rgba(17, 21, 28, 0.14), inset 0 -3px 0 rgba(22, 26, 34, 0.14)`): 用於主角作答卡、追蹤器主機、視覺化實驗室與主題機架。
- **Recessed OLED Monitor** (`box-shadow: inset 0 2px 12px rgba(0, 0, 0, 0.65), 0 3px 10px -3px rgba(13, 17, 23, 0.25)`): 營造玻璃內凹螢幕深度感，清楚與銀色機身區分閱讀層。

### Named Rules
**The Soft-Bevel Shadow Rule.** 本系統採實體儀器加工感，所有表面與按鍵陰影必須保留適度擴散模糊（Soft Blur）與內縮底角陰影，嚴禁使用無模糊純平面位移色塊陰影，亦不為靜態容器添加彩色發光外暈。

## Shapes

使用乾淨俐落的機械圓角階梯：微型徽章與程式碼標籤為 `6px`、觸發鍵帽按鈕為 `10px`、內凹控制槽與列表卡為 `12px`、OLED 螢幕與整機面板外殼為 `14px`–`16px`、狀態燈號與進度膠囊為正圓全圓角（`9999px`）。焦點外殼一律配搭實心 `2px` 頂部通道色條與 `2px` 深墨邊框；內部區塊改採 `1px` 細線隔板或淺灰底色區分，避免過度巢狀卡片套疊。

## Components

### Buttons
- **Shape:** Tactile beveled keycap (`10px` radius) featuring dark outer hairline (`1.5px`) and physical bottom edge compression on press.
- **Primary Student:** Signal Orange Action (`#D93B09`) fill, pure white bold label, horizontal padding `18px–20px`, vertical padding `8px–10px`.
- **Primary Teacher:** Studio Emerald (`#007A5B`) fill, pure white bold label across admin forms and actions.
- **Secondary Keycap:** Crisp white fill (`#FFFFFF`), ink primary text (`#11151C`), transitions on hover with `-1px` vertical lift and deepens into `#F3F5F8`; disabled buttons drop opacity to `40%–45%` cleanly.

### Chips
- **Style:** Unit code pills use obsidian `#161A22` background with white monospace/display lettering (`6px` radius) and an inline 8px LED dot in the module's accent hue.
- **State:** Question status capsules permanently expose solved (`#E6FAF3` background / `#00C48C` LED), wrong/needs-review (`#FDECEC` / `#FF4757`), or unattempted (`#FFFFFF` / hollow slate ring).

### Cards / Containers
- **Corner Style:** `16px` radius on hardware casings (`synth-panel`, `synth-panel-hard`).
- **Background:** `#FFFFFF` for active focus decks, `#F8F9FB` for structural panels, tinted per-module soft ground only inside left spec bays of rack units.
- **Shadow Strategy:** Structural soft offset + bottom machined bevel; top accent delivered strictly via full-width horizontal channel bars (`6px–8px` height), never colored side-border stripes.
- **Internal Padding:** `16px` on compact pads and toolbars, `20px–24px` on primary cards and racks.

### Inputs / Fields
- **Style:** `1.5px solid #C4CBD6` on `#F8F9FB` surface (`12px` radius for text inputs, `8px–10px` for compact filter selects).
- **Focus:** Background snaps cleanly to `#FFFFFF`, border shifts to `#161A22`, keyboard focus outlines in `2.5px solid #D93B09` with `2px` offset.
- **Hardware Fader Sliders:** Custom `10px` recessed track (`#D1D7E1`) paired with a dark-outlined Signal Orange square thumb (`22px × 22px`, `6px` radius) driving live reactive state without submit latency.

### Navigation
- **Style:** Sticky anodized bar (`64px` height, `2px solid #161A22` bottom edge) housing an `OP-APCS` bezel emblem, a recessed segmented mode rail with latched obsidian tabs + active LED dots, and tactile right-hand auth/session controls. Mobile viewports collapse cleanly into a single-column drawer below the bezel bar.

### Signature Component: OP-TRACE Sequencer & OLED Code Monitor
- Combines a live `PythonCodeView` OLED pane (macOS/instrument 3-LED bezel, copy action, luminous `#FF4F17` active-line play marker) with clickable step number pads (`01`..`N`), a continuous hardware scrubber slider, delta-highlighted variable registers (`#FFB800` + `Δ` badge), stacked Call Stack frames, and an emerald-phosphor `STDOUT` console.

## Do's and Don'ts

### Do:
- **Do** keep `Chakra Petch` strictly for ASCII module codes (`MOD-01`..`05`), pad codes (`PAD-A`..`F`), and numeric counters, pairing with `Noto Sans TC` for all Traditional Chinese UI copy.
- **Do** route every code visualization, stack view, and `stdout` output inside recessed `#0D1117` OLED containers with clear contrast.
- **Do** mark top module channels using full-width horizontal color strips (`6px–8px`) and inline status LEDs so students spot module identity and completion state at a glance.
- **Do** make numeric telemetry (`tabular-nums`), sliders, and keyboard focus rings consistent across both desktop (`1440px`) and mobile (`390px`) layouts without clipping or wrapping inside segmented tab pills.

### Don't:
- **Don't** place small eyebrow labels, kickers, or badges above `<h1>`, `<h2>`, or `<h3>` headings.
- **Don't** use colored `border-left` or `border-right` stripes (`>1px`) on cards, alert boxes, tracklist rows, or callouts.
- **Don't** reintroduce warm beige (`#F7F6F2` / `#E2E0D8`) surfaces, muted slate-blue academic buttons (`#1E4E8C`), or text gradients anywhere in student or teacher pages.
- **Don't** fake missing illustrations with decorative glassmorphism blurs, emoji icons instead of Lucide strokes, or zero-blur harsh block shadows.
