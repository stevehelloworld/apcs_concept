import type { SeedQuestionInput } from "./q-control-flow";

export const SEED_QUESTIONS_LISTS_GRID: SeedQuestionInput[] = [
  {
    topic_slug: "lists-grid",
    official_ref: "0915-Q15",
    title: "列表反轉跑滿 n 次與雙向輸出陷阱",
    prompt: "右側程式碼執行後，輸出結果為何？",
    code: `a = [1, 3, 5, 7, 9, 8, 6, 4, 2]\nn = 9\nfor i in range(n):\n    a[i], a[n-i-1] = a[n-i-1], a[i]\nfor i in range(n//2 + 1):\n    print(a[i], a[n-i-1], end = ' ')`,
    question_type: "trace",
    difficulty: "medium",
    options: [
      {
        key: "A",
        text: "2 4 6 8 9 7 5 3 1 9",
        misconception:
          "誤以為第一個迴圈只反轉了一半（其實跑滿 range(9) 會把列表翻過去又翻回來），且沒把每輪成對印出 a[i] 與 a[8-i] 分清。",
      },
      {
        key: "B",
        text: "1 3 5 7 9 2 4 6 8 9",
        misconception:
          "把後半段當成直接印 a[i]，忽略第二個迴圈每次同時印出左端 a[i] 與右端 a[n-i-1]。",
      },
      {
        key: "C",
        text: "1 2 3 4 5 6 7 8 9 9",
        misconception: "正確解答！a 恢復原狀後，首尾交替成對印出 1 2、3 4、5 6、7 8、9 9。",
      },
      {
        key: "D",
        text: "2 4 6 8 5 1 3 7 9 9",
        misconception: "沒發現兩次交換把陣列還原，或是混淆了印出順序。",
      },
    ],
    correct_option: "C",
    explanation:
      "關鍵陷阱有兩個：\n1. 第一個迴圈跑 range(9) 即 i=0..8。i=0..3 時把左右對稱位置交換；i=4 時 a[4] 與自己交換；i=5..8 時又把剛剛換好的位置再次換回原位！所以跑完第一個迴圈後，a 依然是原本的 [1, 3, 5, 7, 9, 8, 6, 4, 2]。\n2. 第二個迴圈跑 range(9//2 + 1) 即 range(5)，i=0..4 依序印出 (a[0], a[8]), (a[1], a[7]), (a[2], a[6]), (a[3], a[5]), (a[4], a[4])，也就是 1 2 3 4 5 6 7 8 9 9。",
    trace_steps: [
      { line: 1, vars: { a: [1, 3, 5, 7, 9, 8, 6, 4, 2], n: 9 }, note: "初始列表 a" },
      { line: 4, vars: { i: "0..3", a: [2, 4, 6, 8, 9, 7, 5, 3, 1] }, note: "前半段交換完成時，列表暫時反轉" },
      { line: 4, vars: { i: "5..8", a: [1, 3, 5, 7, 9, 8, 6, 4, 2] }, note: "繼續跑到 i=8，每一對都被再次換回原始位置！" },
      { line: 6, vars: { i: 0 }, output: "1 2 ", note: "印出 a[0] 與 a[8]" },
      { line: 6, vars: { i: 1 }, output: "1 2 3 4 ", note: "印出 a[1] 與 a[7]" },
      { line: 6, vars: { i: 2 }, output: "1 2 3 4 5 6 ", note: "印出 a[2] 與 a[6]" },
      { line: 6, vars: { i: 3 }, output: "1 2 3 4 5 6 7 8 ", note: "印出 a[3] 與 a[5]" },
      { line: 6, vars: { i: 4 }, output: "1 2 3 4 5 6 7 8 9 9 ", note: "i=4 時 n-i-1 也是 4，故印出兩次 9" },
    ],
  },
  {
    topic_slug: "lists-grid",
    official_ref: "0915-Q18",
    title: "5x5 迷宮內圈四方向鄰居計數",
    prompt: "右側程式片段執行後，count 的值為何？",
    code: `maze = [[1, 1, 1, 1, 1],\n        [1, 0, 1, 0, 1],\n        [1, 1, 0, 0, 1],\n        [1, 0, 0, 1, 1],\n        [1, 1, 1, 1, 1]]\ncount = 0\nfor i in range(1, 4):\n    for j in range(1, 4):\n        dir = [[-1,0], [0,1], [1,0], [0,-1]]\n        for d in range(4):\n            if maze[i+dir[d][0]][j+dir[d][1]] == 1:\n                count = count + 1`,
    question_type: "trace",
    difficulty: "medium",
    options: [
      {
        key: "A",
        text: "36",
        misconception: "誤以為 3×3 個格子每個檢查 4 個方向就會全部加 1（忽略了鄰居也有 0）。",
      },
      {
        key: "B",
        text: "20",
        misconception: "正確解答！內圈 9 格各自上下左右為 1 的次數加總為 20。",
      },
      {
        key: "C",
        text: "12",
        misconception: "漏算了某些方向或把 1 的個數誤當成掃描次數。",
      },
      {
        key: "D",
        text: "3",
        misconception: "僅數了內圈中本身數值為 1 的格子數量（共有 3 個），但程式碼檢查的是「四鄰居」而非格子本身。",
      },
    ],
    correct_option: "B",
    explanation:
      "外層雙迴圈 range(1, 4) 只走訪列索引 1~3、欄索引 1~3 這 9 個內圈格子（外圍圍牆全為 1）。\n針對每個 (i, j) 統計上下左右四鄰居等於 1 的數量：\n• 第 1 列：(1,1)=4、(1,2)=1、(1,3)=3 → 小計 8\n• 第 2 列：(2,1)=1、(2,2)=2、(2,3)=2 → 小計 5\n• 第 3 列：(3,1)=3、(3,2)=2、(3,3)=2 → 小計 7\n總和：8 + 5 + 7 = 20。",
    trace_steps: [
      { line: 7, vars: { "(1,1)": 4, "(1,2)": 1, "(1,3)": 3, count: 8 }, note: "i=1 列四鄰居為 1 的次數分別為 4, 1, 3（累計 8）" },
      { line: 7, vars: { "(2,1)": 1, "(2,2)": 2, "(2,3)": 2, count: 13 }, note: "i=2 列四鄰居為 1 的次數分別為 1, 2, 2（累計 13）" },
      { line: 7, vars: { "(3,1)": 3, "(3,2)": 2, "(3,3)": 2, count: 20 }, note: "i=3 列四鄰居為 1 的次數分別為 3, 2, 2（最終 20）" },
    ],
  },
  {
    topic_slug: "lists-grid",
    official_ref: "0915-Q24",
    title: "單趟找最大最小值後的不變式檢驗",
    prompt:
      "若 A 是一個可儲存 n 筆整數的列表，且資料儲存於 A[0]~A[n-1]。經過右側程式碼運算後，以下何者敘述不一定正確？",
    code: `A = [...]\np = q = A[0]\nfor i in range(1, n):\n    if A[i] > p:\n        p = A[i]\n    if A[i] < q:\n        q = A[i]`,
    question_type: "counterexample",
    difficulty: "basic",
    options: [
      {
        key: "A",
        text: "p 是 A 列表資料中的最大值",
        misconception: "此程式使用兩個獨立 if，確實能正確找出最大值 p。",
      },
      {
        key: "B",
        text: "q 是 A 列表資料中的最小值",
        misconception: "此程式使用兩個獨立 if，確實能正確找出最小值 q。",
      },
      {
        key: "C",
        text: "q < p",
        misconception: "正確解答！當列表所有元素都相等（或只有 1 筆資料 n=1）時，q == p，因此嚴格小於不一定成立。",
      },
      {
        key: "D",
        text: "A[0] <= p",
        misconception: "p 初始值即為 A[0]，之後只會在遇到更大的數時變大，故永遠滿足 A[0] <= p。",
      },
    ],
    correct_option: "C",
    explanation:
      "p 記錄最大值、q 記錄最小值，一般情況下最小值小於最大值，但只要輸入一個全相等列表例如 A = [5, 5, 5] 或單元素列表 A = [5]，運算結束後會有 p = 5 且 q = 5，此時 q < p 為 False（真正恆成立的是 q <= p）。",
    trace_steps: [
      { line: 2, vars: { A: "[7, 7, 7]", p: 7, q: 7 }, note: "反例：當列表元素全部相同時" },
      { line: 4, vars: { i: 1, p: 7, q: 7 }, note: "7 > 7 為 False，7 < 7 為 False，兩者皆不更新" },
      { line: 7, vars: { p: 7, q: 7, "q < p": false }, note: "結束時 q == p，故嚴格不等式 q < p 不一定成立" },
    ],
  },
  {
    topic_slug: "lists-grid",
    official_ref: "0915-Q25",
    title: "模數位移索引寫入列表",
    prompt:
      "右側 F( ) 函式執行時，若輸入依序為整數 0, 1, 2, 3, 4, 5, 6, 7, 8, 9，請問 X 列表的元素值依順序為何？",
    code: `def F():\n    X = [0] * 10\n    for i in range(10):\n        X[(i + 2) % 10] = int(input())`,
    question_type: "trace",
    difficulty: "basic",
    options: [
      {
        key: "A",
        text: "0, 1, 2, 3, 4, 5, 6, 7, 8, 9",
        misconception: "沒有考慮到 (i + 2) % 10 造成的 2 格右移偏移量。",
      },
      {
        key: "B",
        text: "2, 0, 2, 0, 2, 0, 2, 0, 2, 0",
        misconception: "誤以為每次只改偶數位置或誤算了索引取餘數公式。",
      },
      {
        key: "C",
        text: "9, 0, 1, 2, 3, 4, 5, 6, 7, 8",
        misconception: "對應的是向右移 1 格（(i + 1) % 10）而非 2 格。",
      },
      {
        key: "D",
        text: "8, 9, 0, 1, 2, 3, 4, 5, 6, 7",
        misconception: "正確解答！輸入 8 與 9 繞回索引 0 與 1，其餘依序右移兩格。",
      },
    ],
    correct_option: "D",
    explanation:
      "將每個輸入的位置列出：\n• i=0 (輸入 0) → X[(0+2)%10] = X[2] = 0\n• i=1 (輸入 1) → X[3] = 1\n...\n• i=7 (輸入 7) → X[9] = 7\n• i=8 (輸入 8) → X[(8+2)%10] = X[0] = 8\n• i=9 (輸入 9) → X[(9+2)%10] = X[1] = 9\n排列 X[0]..X[9] 即得 8, 9, 0, 1, 2, 3, 4, 5, 6, 7。",
    trace_steps: [
      { line: 4, vars: { i: 0, idx: 2, val: 0 }, note: "X[2] = 0" },
      { line: 4, vars: { i: 7, idx: 9, val: 7 }, note: "依序寫入至 X[9] = 7" },
      { line: 4, vars: { i: 8, idx: 0, val: 8 }, note: "(8+2)%10 = 0，繞回 X[0] = 8" },
      { line: 4, vars: { i: 9, idx: 1, val: 9, X: [8, 9, 0, 1, 2, 3, 4, 5, 6, 7] }, note: "(9+2)%10 = 1，X[1] = 9" },
    ],
  },
  {
    topic_slug: "lists-grid",
    official_ref: "0915-Q30",
    title: "列表推導式與前綴和區間相減",
    prompt: "經過運算後，右側程式的輸出為何？",
    code: `a = [0] * 101\nb = [i for i in range(101)]\nfor i in range(1, 101):\n    a[i] = b[i] + a[i - 1]\nprint(a[50] - a[30])`,
    question_type: "trace",
    difficulty: "basic",
    options: [
      {
        key: "A",
        text: "1275",
        misconception: "1275 是 1+2+...+50（也就是只算了 a[50] 而忘記減掉 a[30]）。",
      },
      {
        key: "B",
        text: "20",
        misconception: "誤把 a[50] - a[30] 當成計算 b[50] - b[30]（50 - 30 = 20），忽略了 a 是累加前綴和。",
      },
      {
        key: "C",
        text: "1000",
        misconception: "估算區間總和時錯把項數與平均數乘成 50 × 20。",
      },
      {
        key: "D",
        text: "810",
        misconception: "正確解答！代表 b[31] + b[32] + ... + b[50] = (31+50)*20/2 = 810。",
      },
    ],
    correct_option: "D",
    explanation:
      "b = [0, 1, 2, ..., 100]。\n迴圈計算 a[i] = 1 + 2 + ... + i（前綴和）：\n• a[50] = 1 + 2 + ... + 50\n• a[30] = 1 + 2 + ... + 30\n兩者相減 a[50] - a[30] = 31 + 32 + ... + 50。\n這是首項 31、末項 50、共 20 項的等差級數，總和為 (31 + 50) × 20 ÷ 2 = 81 × 10 = 810。",
    trace_steps: [
      { line: 2, vars: { "b[0..5]": "[0,1,2,3,4,5]" }, note: "b[i] 等於索引 i 本身" },
      { line: 4, vars: { "a[30]": 465 }, note: "a[30] = 1+2+...+30 = (1+30)*30/2 = 465" },
      { line: 4, vars: { "a[50]": 1275 }, note: "a[50] = 1+2+...+50 = (1+50)*50/2 = 1275" },
      { line: 5, vars: { result: 810 }, output: "810", note: "1275 - 465 = 810（亦即 31+32+...+50）" },
    ],
  },
];
