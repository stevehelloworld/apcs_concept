import type { SeedQuestionInput } from "./q-control-flow";

export const SEED_QUESTIONS_LOOPS_RANGE: SeedQuestionInput[] = [
  {
    topic_slug: "loops-range",
    official_ref: "0915-Q2",
    title: "從輸出方括號反推內層 while 條件",
    prompt:
      "給定右側程式，若已知輸出的結果為 [1][2][3][5][4][6]，程式中的 (?) 應為下列何者？",
    code: `for i in range(5):\n    j = 0\n    while (?):\n        print(f'[{i + j}]', end = '')\n        j = j + 2`,
    question_type: "fill",
    difficulty: "basic",
    options: [
      {
        key: "A",
        text: "j < i",
        misconception: "正確解答！逐輪檢查 i=0..4 的輸出剛好對應 [1]、[2]、[3][5]、[4][6]。",
      },
      {
        key: "B",
        text: "j > i",
        misconception:
          "初始 j=0 時，對所有 i >= 0（0,1,2,3,4）來說 0 > i 皆為 False，導致完全沒有輸出。",
      },
      {
        key: "C",
        text: "j <= i",
        misconception:
          "當 i=0, j=0 時 0 <= 0 成立，第一項就會先印出 [0]，與題目開頭的 [1] 不符。",
      },
      {
        key: "D",
        text: "j >= i",
        misconception:
          "當 i=0, j=0 時成立且之後 j=2, 4, 6... 永遠大於等於 i，會形成無窮迴圈。",
      },
    ],
    correct_option: "A",
    explanation:
      "觀察輸出開頭第一個是 [1] 而非 [0]：因為 j 從 0 開始，所以 i=0 時內層迴圈不能執行！這直接淘汰了含等號的 (C) j <= i 與 (D) j >= i；又對 i=1, j=0 必須執行，故淘汰 (B) j > i。\n驗證 (A) j < i：\n• i=0: j=0 < 0 (F) → 不印\n• i=1: j=0 < 1 (T) → 印 [1]，j=2 停止\n• i=2: j=0 < 2 (T) → 印 [2]，j=2 停止\n• i=3: j=0, 2 < 3 → 印 [3][5]\n• i=4: j=0, 2 < 4 → 印 [4][6]\n完全吻合 [1][2][3][5][4][6]。",
    trace_steps: [
      { line: 1, vars: { i: 0, j: 0 }, note: "i=0, j=0: 0 < 0 為 False，不印出" },
      { line: 4, vars: { i: 1, j: 0 }, output: "[1]", note: "i=1, j=0 < 1 為 True，印出 [1] 後 j 變 2 跳出" },
      { line: 4, vars: { i: 2, j: 0 }, output: "[1][2]", note: "i=2, j=0 < 2 為 True，印出 [2] 後 j 變 2 跳出" },
      { line: 4, vars: { i: 3, j: 0 }, output: "[1][2][3]", note: "i=3, j=0 < 3 為 True，印出 [3]" },
      { line: 4, vars: { i: 3, j: 2 }, output: "[1][2][3][5]", note: "i=3, j=2 < 3 為 True，印出 [5] 後 j=4 跳出" },
      { line: 4, vars: { i: 4, j: 0 }, output: "[1][2][3][5][4]", note: "i=4, j=0 < 4 為 True，印出 [4]" },
      { line: 4, vars: { i: 4, j: 2 }, output: "[1][2][3][5][4][6]", note: "i=4, j=2 < 4 為 True，印出 [6] 後結束" },
    ],
  },
  {
    topic_slug: "loops-range",
    official_ref: "0915-Q5",
    title: "星號金字塔最少修改行數",
    prompt:
      "右側程式正確的輸出應該為第 1 列 1 顆星、第 2 列 3 顆、...、第 5 列 9 顆星（前導空格依次 4, 3, 2, 1, 0 格）。在不修改右側程式之第 4 行及第 5 行程式碼的前提下，最少需修改幾行程式碼以得到正確輸出？",
    code: `k = 4\nm = 1\nfor i in range(5):\n    print(' ' * k, end = '')\n    print('*' * m)\n    k = k - 1\n    m = m + 1`,
    question_type: "debug",
    difficulty: "basic",
    options: [
      {
        key: "A",
        text: "1",
        misconception: "正確解答！只需要把第 7 行 m = m + 1 改為 m = m + 2 即可。",
      },
      {
        key: "B",
        text: "2",
        misconception:
          "可能多改了第 6 行或第 1 行；請檢查各列前導空格數 4, 3, 2, 1, 0 是否剛好對應 k=4 每次減 1。",
      },
      {
        key: "C",
        text: "3",
        misconception:
          "誤以為星號之間還有空白或對齊需要重寫迴圈；題目圖案每顆星寬度與前導空格比為 1 格遞減。",
      },
      {
        key: "D",
        text: "4",
        misconception: "過度重寫程式碼，原程式僅星號遞增值有誤。",
      },
    ],
    correct_option: "A",
    explanation:
      "逐列檢查空格數 k 與星號數 m：\n• 第 1 列（i=0）：k=4 個空格，m=1 個星（正確）\n• 第 2 列（i=1）：k=3 個空格，題意需 m=3 個星，但原程式第 7 行寫 m = m + 1 只得到 2 個星！\n• 第 3~5 列：需要 5, 7, 9 個星，每列公差為 2。\n因此 k=4 與 k=k-1 完全正確，只需將第 7 行改為 m = m + 2，最少修改 1 行即可。",
    trace_steps: [
      { line: 1, vars: { k: 4, m: 1 }, note: "起始 k=4（空格數）, m=1（星號數）" },
      { line: 5, vars: { i: 0, k: 4, m: 1 }, output: "    *", note: "i=0 印 4 空格 + 1 星" },
      { line: 7, vars: { i: 0, k: 3, m: 2 }, note: "原第 7 行 m=m+1 變成 2（若改成 m=m+2 則為 3）" },
      { line: 5, vars: { i: 1, k: 3, m: 2 }, output: "    *\n   **", note: "原碼第 2 列少 1 顆星；修正第 7 行 1 行即可全對" },
    ],
  },
  {
    topic_slug: "loops-range",
    official_ref: "0915-Q12",
    title: "從輸出 2468 反推迴圈參數 (a), (b), (c)",
    prompt:
      "右側 f( ) 函式 (a), (b), (c) 處需分別填入哪些數字，方能使得 f(4) 輸出 2468 的結果？",
    code: `def f(n):\n    p = 0\n    i = n\n    while i >= (a):\n        p = 10 - (b) * i\n        print(p, end = '')\n        i = i - (c)`,
    question_type: "fill",
    difficulty: "basic",
    options: [
      {
        key: "A",
        text: "1, 2, 1",
        misconception: "正確解答！當 i=4,3,2,1 時，10-2*i 依序產出 2, 4, 6, 8。",
      },
      {
        key: "B",
        text: "0, 1, 2",
        misconception: "i=4, 2, 0 時會印出 (10-4), (10-2), (10-0) 即 6810，與 2468 不符。",
      },
      {
        key: "C",
        text: "0, 2, 1",
        misconception: "當 i 減到 0 時仍符合 i >= 0，會多印一組 p = 10 - 0 = 10，變成 246810。",
      },
      {
        key: "D",
        text: "1, 1, 1",
        misconception: "10 - 1 * i 在 i=4,3,2,1 時會印出 6, 7, 8, 9（即 6789）。",
      },
    ],
    correct_option: "A",
    explanation:
      "f(4) 一開始 i = 4，第一輪印出的數字必須是 2：\n代入 p = 10 - (b) * 4 = 2，解得 (b) = 2。\n接著希望依序印出 2, 4, 6, 8（共 4 次迴圈），因為 p 每次加 2 等同於 i 每次減 1，故 (c) = 1。\n最後一次印出 8 時對應的 i 為 1（10 - 2*1 = 8），之後 i=0 必須停止迴圈，因此終止條件 i >= (a) 的 (a) = 1。",
    trace_steps: [
      { line: 3, vars: { n: 4, i: 4, p: 0 }, note: "設定起始 i = 4" },
      { line: 6, vars: { i: 4, p: 2 }, output: "2", note: "10 - 2*4 = 2，印出 2，i 減 1 變 3" },
      { line: 6, vars: { i: 3, p: 4 }, output: "24", note: "10 - 2*3 = 4，印出 4，i 減 1 變 2" },
      { line: 6, vars: { i: 2, p: 6 }, output: "246", note: "10 - 2*2 = 6，印出 6，i 減 1 變 1" },
      { line: 6, vars: { i: 1, p: 8 }, output: "2468", note: "10 - 2*1 = 8，印出 8，i 減 1 變 0 < 1 跳出" },
    ],
  },
  {
    topic_slug: "loops-range",
    official_ref: "0915-Q19",
    title: "倒三角星號的負步長 range 終止條件",
    prompt:
      "右側程式片段中執行後若要印出 3 列倒三角圖案（第 1 列 6 顆星、第 2 列前空 1 格 4 顆星、第 3 列前空 2 格 2 顆星），(a) 的條件判斷式（range 終止值）該如何設定？",
    code: `for i in range(4):\n    for j in range(i):\n        print(' ', end = '')\n    for k in range(6-2*i, (a) , -1):\n        print('*', end = '')\n    print('')`,
    question_type: "fill",
    difficulty: "medium",
    options: [
      {
        key: "A",
        text: "2",
        misconception:
          "stop=2 不含 2，只能數到 3，第 1 列 range(6, 2, -1) 只會印出 6,5,4,3 共 4 顆星（且最後一列無星）。",
      },
      {
        key: "B",
        text: "1",
        misconception:
          "stop=1 不含 1，第 1 列 range(6, 1, -1) 印出 6,5,4,3,2 共 5 顆星（每列皆少 1 顆）。",
      },
      {
        key: "C",
        text: "0",
        misconception: "正確解答！負步長不包含 stop=0，剛好印出 6..1、4..1、2..1。",
      },
      {
        key: "D",
        text: "-1",
        misconception:
          "stop=-1 會包含 0，導致第 1 列印出 6,5,4,3,2,1,0 共 7 顆星（每列皆多 1 顆），且 i=3 時 range(0,-1,-1) 會多印 1 顆星。",
      },
    ],
    correct_option: "C",
    explanation:
      "當 step = -1 時，range(start, stop, -1) 會停在 stop + 1（不包含 stop）。\n觀察 i=0 時 start = 6 - 2*0 = 6，題目要求第 1 列印出 6 顆星，也就是需要 k 依序取 6, 5, 4, 3, 2, 1（最後一項為 1）。\n因此 stop = 1 - 1 = 0。\n檢查 i=3 時 start = 6 - 6 = 0，range(0, 0, -1) 為空序列不印星，符合只印 3 列圖案。",
    trace_steps: [
      { line: 4, vars: { i: 0, start: 6, stop: 0 }, output: "******", note: "i=0: range(6, 0, -1) 產生 6,5,4,3,2,1 共 6 顆星" },
      { line: 4, vars: { i: 1, start: 4, stop: 0 }, output: "******\n ****", note: "i=1: 1 空格 + range(4, 0, -1) 共 4 顆星" },
      { line: 4, vars: { i: 2, start: 2, stop: 0 }, output: "******\n ****\n  **", note: "i=2: 2 空格 + range(2, 0, -1) 共 2 顆星" },
      { line: 4, vars: { i: 3, start: 0, stop: 0 }, note: "i=3: range(0, 0, -1) 為空，不印任何星號" },
    ],
  },
  {
    topic_slug: "loops-range",
    official_ref: "0915-Q20",
    title: "找零錢程式中的冗餘區塊辨識",
    prompt:
      "下列程式碼是自動計算找零程式的一部分，三個主要變數為 Total（購買總額）、Paid（實際支付金額）、Change（找零金額）。此程式片段有冗餘的程式碼（移除該段程式碼之後不會影響程式的功能）。請找出冗餘程式碼的區塊。",
    code: `Change = Paid - Total\nprint(f'500 : {(Change-Change%500)//500} pieces')\nChange = Change % 500\nprint(f'100 : {(Change-Change%100)//100} coins')\nChange = Change % 100\n# A 區\nprint(f'50 : {(Change-Change%50)//50} coins')\nChange = Change % 50\n# B 區\nprint(f'10 : {(Change-Change%10)//10} coins')\nChange = Change % 10\n# C 區\nprint(f'5 : {(Change-Change%5)//5} coins')\nChange = Change % 5\n# D 區\nprint(f'1 : {(Change-Change%1)//1} coins')\nChange = Change % 1`,
    question_type: "static",
    difficulty: "medium",
    options: [
      {
        key: "A",
        text: "冗餘程式碼在 A 區",
        misconception: "若移除 A 區（50 元計算與取餘），後續 10 元就會多印出 50 的部分。",
      },
      {
        key: "B",
        text: "冗餘程式碼在 B 區",
        misconception: "移除 B 區會缺少 10 元硬幣找零且 5 元張數暴增。",
      },
      {
        key: "C",
        text: "冗餘程式碼在 C 區",
        misconception: "移除 C 區會導致 5 元硬幣沒有被扣除，全部灌進 1 元硬幣。",
      },
      {
        key: "D",
        text: "冗餘程式碼在 D 區",
        misconception:
          "正確解答！D 區最後的 Change = Change % 1（對整數恆為 0 且後續無任何讀取）與針對 1 元做多餘取餘運算屬於典型冗餘碼。",
      },
    ],
    correct_option: "D",
    explanation:
      "在整數貪婪找零鏈中：\n1. A、B、C 區都肩負列印該面額硬幣與把餘數 Change % coin 交棒給下一層的重要功能，缺一不可。\n2. 到達最末端的 D 區（1 元）時，不僅 (Change - Change % 1) // 1 中的 Change % 1 永遠等於 0，最後一行 Change = Change % 1 把 Change 清零後程式就結束了，後續沒有任何程式碼再讀取 Change，因此該區包含死賦值與冗餘運算。",
    trace_steps: [
      { line: 14, vars: { Change: 3 }, note: "經過 500/100/50/10/5 後，假設剩餘 Change = 3" },
      { line: 16, vars: { Change: 3 }, output: "1 : 3 coins", note: "3 % 1 恆為 0，計算 (3 - 0)//1 即直接使用 Change 本身" },
      { line: 17, vars: { Change: 0 }, note: "Dead Store：將 Change 設為 0 後程式結束，再無後續讀取" },
    ],
  },
  {
    topic_slug: "loops-range",
    official_ref: "0915-Q26",
    title: "辨識無法印出剛好 20 次的 range 修正",
    prompt:
      '右側程式片段無法正確列印 20 次的 "Hi!"，請問下列哪一個修正方式仍無法正確列印 20 次的 "Hi!"？',
    code: `for i in range(0, 101, 5):\n    print('Hi!')`,
    question_type: "debug",
    difficulty: "basic",
    options: [
      {
        key: "A",
        text: "將 range(0, 101, 5) 改為 range(0, 20, 1)",
        misconception: "產生 0, 1, 2, ..., 19，共有 20 個數字，會印 20 次。",
      },
      {
        key: "B",
        text: "將 range(0, 101, 5) 改為 range(5, 101, 5)",
        misconception: "產生 5, 10, 15, ..., 100（即 5×1 到 5×20），共有 20 個數字，會印 20 次。",
      },
      {
        key: "C",
        text: "將 range(0, 101, 5) 改為 range(0, 100, 5)",
        misconception: "產生 0, 5, 10, ..., 95（即 5×0 到 5×19），共有 20 個數字，會印 20 次。",
      },
      {
        key: "D",
        text: "將 range(0, 101, 5) 改為 range(5, 100, 5)",
        misconception: "正確解答！這會同時去掉 0 與 100，只產生 5..95 共 19 次。",
      },
    ],
    correct_option: "D",
    explanation:
      "原程式 range(0, 101, 5) 包含 0, 5, 10, ..., 100，共 21 次。\n要改為 20 次，只需去掉頭（0）或去掉尾（100）其中一個：\n• (B) start 改 5 去掉頭：5~100 共 20 次。\n• (C) stop 改 100 去掉尾：0~95 共 20 次。\n• (D) range(5, 100, 5) 把頭 0 與尾 100 同時去掉，剩下 5, 10, ..., 95 只有 19 個數，仍無法印出 20 次。",
    trace_steps: [
      { line: 1, vars: { "A: (0,20,1)": 20, "B: (5,101,5)": 20, "C: (0,100,5)": 20 }, note: "A, B, C 皆產生剛好 20 個整數" },
      { line: 1, vars: { "D: (5,100,5)": "5, 10, ..., 95 (19個)" }, note: "100 不含於右開區間，起點又少 0，僅 19 次！" },
    ],
  },
];
