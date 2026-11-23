import type { Difficulty, OptionItem, QuestionType, TraceStep } from "../types";

export interface SeedQuestionInput {
  topic_slug: string;
  official_ref: string;
  title: string;
  prompt: string;
  code: string;
  question_type: QuestionType;
  difficulty: Difficulty;
  options: OptionItem[];
  correct_option: "A" | "B" | "C" | "D";
  explanation: string;
  trace_steps: TraceStep[];
}

export const SEED_QUESTIONS_CONTROL_FLOW: SeedQuestionInput[] = [
  {
    topic_slug: "control-flow",
    official_ref: "0915-Q10",
    title: "巢狀縮排與 0 的 Falsy 判斷",
    prompt: "右側程式執行過後所輸出數值為何？",
    code: `count = 10\nif count > 0:\n    count = 11\nif count > 10:\n    count = 12\n    if count % 3 == 4:\n        count = 1\n    else:\n        count = 0\nelif count > 11:\n    count = 13\nelse:\n    count = 14\nif count:\n    count = 15\nelse:\n    count = 16\nprint(count)`,
    question_type: "trace",
    difficulty: "basic",
    options: [
      {
        key: "A",
        text: "11",
        misconception:
          "誤以為第二個 if count > 10 不成立或看錯最初的 count=10，忽略了第一個獨立 if 已將 count 改為 11。",
      },
      {
        key: "B",
        text: "13",
        misconception:
          "誤把 elif count > 11 當成獨立 if，或是忽略了進入 if count > 10 後整個 elif/else 連鎖分支都會被跳過。",
      },
      {
        key: "C",
        text: "15",
        misconception:
          "誤以為 0 會讓最後的 if count: 成立，或是忽略了內層 else 把 count 設為 0。",
      },
      {
        key: "D",
        text: "16",
        misconception: "正確解答！完全掌握縮排結構與 0 的 Falsy 特性。",
      },
    ],
    correct_option: "D",
    explanation:
      "1. count=10 滿足第一個 if count > 0，故 count 變為 11。\n2. 接著第二組 if count > 10 為真（11 > 10），進入後 count 設為 12。\n3. 檢查內層 if count % 3 == 4（12 % 3 為 0，不等於 4，且任何整數除以 3 的餘數都不可能是 4），進入內層 else，count 變為 0。\n4. 因為已進入第二組的 if 分支，外層的 elif count > 11 與 else 直接跳過。\n5. 最後執行 if count:，在 Python 中 0 視為 False，因此走進 else 把 count 設為 16 並印出。",
    trace_steps: [
      { line: 1, vars: { count: 10 }, note: "初始化變數 count = 10" },
      { line: 2, vars: { count: 10 }, note: "判斷 count > 0（10 > 0 為 True）" },
      { line: 3, vars: { count: 11 }, note: "更新 count = 11" },
      { line: 4, vars: { count: 11 }, note: "獨立的 if count > 10（11 > 10 為 True），進入分支" },
      { line: 5, vars: { count: 12 }, note: "更新 count = 12" },
      { line: 6, vars: { count: 12 }, note: "12 % 3 == 0 != 4，條件為 False" },
      { line: 9, vars: { count: 0 }, note: "進入內層 else，將 count 更新為 0；外層 elif/else 全跳過" },
      { line: 14, vars: { count: 0 }, note: "判斷 if count:，因 0 為 Falsy（False），跳至 else" },
      { line: 17, vars: { count: 16 }, note: "執行 count = 16" },
      { line: 18, vars: { count: 16 }, output: "16", note: "印出最終數值 16" },
    ],
  },
  {
    topic_slug: "control-flow",
    official_ref: "0915-Q17",
    title: "分數等第區間遮蔽錯誤數量計算",
    prompt:
      "右側是依據分數 s 評定等第的程式碼片段，正確的等第公式應為：\n90~100 判為 A 等\n80~89 判為 B 等\n70~79 判為 C 等\n60~69 判為 D 等\n0~59 判為 F 等\n這段程式碼在處理 0~100 的分數時，有幾個分數的等第是錯的？",
    code: `if s >= 90:\n    print('A')\nelif s >= 80:\n    print('B')\nelif s > 60:\n    print('D')\nelif s > 70:\n    print('C')\nelse:\n    print('F')`,
    question_type: "debug",
    difficulty: "medium",
    options: [
      {
        key: "A",
        text: "20",
        misconception:
          "誤以為 C 與 D 兩段（70~79 與 60~69 共 20 個分數）全都判錯，忽略了 61~69 其實仍會印出正確的 'D'。",
      },
      {
        key: "B",
        text: "11",
        misconception: "正確解答！70~79（10 個）誤判為 D，且 60（1 個）誤判為 F。",
      },
      {
        key: "C",
        text: "2",
        misconception:
          "只注意到第 5 行與第 7 行的 > 漏寫等號（或只抓了 60 與 70 兩個邊界），忽略了 71~79 也被 elif s > 60 攔截。",
      },
      {
        key: "D",
        text: "10",
        misconception:
          "只算到 70~79 這 10 個分數被 s > 60 攔截，漏算了邊界值 s = 60 因寫成嚴格大於 > 60 而落入 F。",
      },
    ],
    correct_option: "B",
    explanation:
      "逐段比對 0~100 的所有整數分數：\n• 90~100：正確輸出 A。\n• 80~89：正確輸出 B。\n• 70~79：應為 C，但執行到第 5 行 elif s > 60 即為真，全部錯誤輸出 D（錯 10 個：70, 71, ..., 79）。\n• 61~69：符合 s > 60，正確輸出 D。\n• 60：應為 D，但不滿足 s > 60（也不滿足 s > 70），落入 else 錯誤輸出 F（錯 1 個：60）。\n• 0~59：落入 else，正確輸出 F。\n合計共有 10 + 1 = 11 個分數等第錯誤。",
    trace_steps: [
      { line: 1, vars: { s: 75 }, note: "測試 s = 75：75 >= 90 為 False" },
      { line: 3, vars: { s: 75 }, note: "75 >= 80 為 False" },
      { line: 5, vars: { s: 75 }, note: "75 > 60 為 True！直接被 elif s > 60 攔截" },
      { line: 6, vars: { s: 75 }, output: "D", note: "70~79 共 10 個分數全誤印為 D，底下 elif s > 70 永遠觸發不到" },
      { line: 5, vars: { s: 60 }, note: "改測邊界 s = 60：60 > 60 為 False（漏了等號 >=）" },
      { line: 9, vars: { s: 60 }, output: "F", note: "掉進 else 誤印 F，故共 10 + 1 = 11 個錯誤分數" },
    ],
  },
  {
    topic_slug: "control-flow",
    official_ref: "0915-Q27",
    title: "迴圈後置條件與靜態不可達死碼",
    prompt: "給定右側函式 F( )，執行 F( ) 時哪一行程式碼永遠不會被執行到？",
    code: `def F(a):\n    while a < 10:\n        a = a + 5\n    if a < 12:\n        a = a + 2\n    if a < 11:\n        a = 5`,
    question_type: "static",
    difficulty: "advanced",
    options: [
      {
        key: "A",
        text: "a = a + 5",
        misconception: "只要傳入 a < 10（例如 a = 1），就會進入 while 執行 a = a + 5。",
      },
      {
        key: "B",
        text: "a = a + 2",
        misconception:
          "當離開 while 時若 a 落在 10 或 11（例如輸入 a = 1 跳出迴圈時為 11，或直接傳入 a = 10），就會滿足 if a < 12 而執行 a = a + 2。",
      },
      {
        key: "C",
        text: "a = 5",
        misconception: "正確解答！離開 while 時必滿足 a >= 10，經過 if a < 12 加 2 後必滿足 a >= 12，因此 a < 11 恆為 False。",
      },
      {
        key: "D",
        text: "每一行都執行得到",
        misconception:
          "看到 if a < 11 就以為只要把原本的輸入設為小於 11（如 5 或 -3）就能觸發；忽略了 while a < 10 跳出條件與其後的 +2 平移效果。",
      },
    ],
    correct_option: "C",
    explanation:
      "利用靜態「區間不變式（Invariant）」分段分析：\n1. 第 2–3 行的 while a < 10 結束後，a 必然滿足後置條件 a >= 10。\n2. 接著進入第 4 行的 if a < 12：\n   • 若 a ∈ [10, 12)（例如 10 或 11），執行 a = a + 2 後會平移到 [12, 14)，必 >= 12。\n   • 若 a >= 12，本來就已經 >= 12。\n3. 因此不論原始傳入的 a 為何（正數、0 或負數），到達第 6 行 if a < 11 時必然滿足 a >= 12 > 11，第 7 行 a = 5 永遠不可能被執行到。",
    trace_steps: [
      { line: 2, vars: { a: 1 }, note: "以輸入 a = 1 為例：1 < 10 進入 while" },
      { line: 3, vars: { a: 6 }, note: "第 1 圈：a = 1 + 5 = 6（仍 < 10）" },
      { line: 3, vars: { a: 11 }, note: "第 2 圈：a = 6 + 5 = 11（>= 10，跳出 while！）" },
      { line: 4, vars: { a: 11 }, note: "檢查外層 if a < 12：11 < 12 為 True" },
      { line: 5, vars: { a: 13 }, note: "執行 a = a + 2，a 成為 13（區間強制推入 >= 12）" },
      { line: 6, vars: { a: 13 }, note: "檢查 if a < 11：13 < 11 為 False，第 7 行 a = 5 永遠不可達！" },
    ],
  },
  {
    topic_slug: "control-flow",
    official_ref: "0915-Q29",
    title: "以特定序列反例偵測 elif 最大最小值錯誤",
    prompt:
      "右側程式擬找出列表 A 中的最大值 (M) 和最小值 (N)。不過，這段程式碼有誤，請問 A 初始值如何設定就可以測出程式有誤？",
    code: `M, N, s = -1, 101, 3\nA = [80, 90, 100]\nfor i in range(s):\n    if A[i] > M:\n        M = A[i]\n    elif A[i] < N:\n        N = A[i]\nprint(f'M = {M}, N = {N}')`,
    question_type: "counterexample",
    difficulty: "medium",
    options: [
      {
        key: "A",
        text: "[90, 80, 100]",
        misconception:
          "i=0 時 M=90（跳過 N），但 i=1 時 A[1]=80 不大於 90，於是順利進到 elif 更新 N=80，最後 M=100, N=80 湊巧答對！",
      },
      {
        key: "B",
        text: "[80, 90, 100]",
        misconception: "正確解答！嚴格遞增時每次都命中第一個 if，導致 elif 從未被執行。",
      },
      {
        key: "C",
        text: "[100, 90, 80]",
        misconception:
          "i=0 更新 M=100，之後 90 與 80 都不大於 100，因此兩次都順利進入 elif 更新 N=90 再更新為 80，湊巧答對！",
      },
      {
        key: "D",
        text: "[90, 100, 80]",
        misconception:
          "i=2 時 A[2]=80 小於 M=100，進入 elif 更新 N=80，最後輸出 M=100, N=80 湊巧答對！",
      },
    ],
    correct_option: "B",
    explanation:
      "錯誤原因在於第 6 行使用了 elif 而非獨立的 if。由於 M 初始值設為極小值 -1，第一筆 A[0] 必然滿足 A[0] > M，因此 i=0 時一定不會檢查 N。若後續元素一路遞增（都大於前面的 M），就會每一輪都命中 if 而完全跳過 elif，最終 N 維持初始值 101。\n檢驗四個選項中只有 (B) [80, 90, 100]（剛好也是右側程式碼裡的範例值！）為嚴格遞增，輸出錯誤結果 M = 100, N = 101。",
    trace_steps: [
      { line: 1, vars: { M: -1, N: 101, s: 3 }, note: "初始化 M = -1, N = 101" },
      { line: 4, vars: { i: 0, "A[0]": 80, M: -1, N: 101 }, note: "i=0: 80 > -1 為 True，更新 M=80，跳過 elif" },
      { line: 4, vars: { i: 1, "A[1]": 90, M: 80, N: 101 }, note: "i=1: 90 > 80 為 True，更新 M=90，跳過 elif" },
      { line: 4, vars: { i: 2, "A[2]": 100, M: 90, N: 101 }, note: "i=2: 100 > 90 為 True，更新 M=100，跳過 elif" },
      { line: 8, vars: { M: 100, N: 101 }, output: "M = 100, N = 101", note: "N 從未被更新，輸出錯誤的最小值 101" },
    ],
  },
];
