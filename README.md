# APCS 識讀實驗室（APCS TraceLab）

以官方 2025 APCS「程式識讀 Python 題本範例（0915 版，全 30 題）」為核心的互動式教學、學生練習診斷與教師班級管理全端平台。

## 主要功能

- **五大主題六段式教學與專屬視覺化實驗室**
  - 條件判斷與控制流（分數數線遮蔽、區間平移死碼推導、`if` vs `elif` 對照）
  - 迴圈、`range` 與基本運算（互動 `range` 尺規、星號金字塔對照）
  - 列表、二維陣列與索引操作（對稱反轉陷阱、5×5 迷宮四方向雷達、前綴和相減）
  - 函式與遞迴思維（Call Stack 去程/回程追蹤、Base Case 乘零實驗、自底向上建表）
  - 經典演算法、資料結構與複雜度（線性 vs 二分搜尋競速、佇列跨輪模擬、GCD 賦值排序）
- **雙軸導覽與完整 30 題練習工作台**
  - 支援依五大主題與六大認知題型（執行追蹤、程式填空、除錯修正、測試反例、靜態分析、數學建模）篩選與 10 題隨機模擬測驗。
  - 每次提交皆提供對應錯誤選項的「迷思診斷」、考場手解法詳解與單步執行重播。
- **獨立師生帳號系統與教師管理後台（`/teacher/*`）**
  - 採用 `scrypt` 雜湊密碼與 `HttpOnly` Session Cookie，實施嚴格的角色權限與教師班級隔離。
  - 提供班級與學生名冊管理、題庫 CRUD（含班級專屬題目範圍設定）、五大主題 CMS、作業指派及「主題 × 題型」弱點矩陣分析。

## 本機開發啟動

環境需求：Node.js `24.x` 或 `26.x`（內建 `node:sqlite`）。

```bash
npm install
npm run dev
```

未設定雲端資料庫環境變數時，本機會自動使用 `data/apcs.db` 並於首次連線時建立結構與種子資料。

### 預載本機測試帳號

- **教師帳號**：`teacher_lin` / `teacher123`（管理「高二資訊甲班」，加入代碼 `APCS2A`）
- **教師帳號（隔離對照）**：`teacher_chen` / `teacher123`（管理「APCS 衝刺班」，加入代碼 `APCS99`）
- **學生帳號**：`stu_wang`、`stu_lee`、`stu_chang`（`APCS2A`）與 `stu_wu`（`APCS99`），密碼皆為 `student123`

## 部署至 Vercel + Turso 雲端持久化資料庫

本專案採雙驅動資料庫設計（[src/lib/db.ts](src/lib/db.ts)）：當環境存在 `TURSO_DATABASE_URL` 時自動切換為 Turso（`@libsql/client/web`）遠端永久儲存。

1. 於 Vercel 匯入此 GitHub 倉庫（`stevehelloworld/apcs_concept`）。
2. 在 Vercel 專案頁的 **Storage / Marketplace** 新增 **Turso** 整合（提供免費額度），系統會自動注入 `TURSO_DATABASE_URL` 與 `TURSO_AUTH_TOKEN` 環境變數。
3. 觸發 Production Redeploy 後，瀏覽 `/api/health` 確認回傳：
   ```json
   { "ok": true, "storage": "turso", "topics": 5, "questions": 30 }
   ```
