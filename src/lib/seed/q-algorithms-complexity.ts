import type { SeedQuestionInput } from "./q-control-flow";

export const SEED_QUESTIONS_ALGORITHMS_COMPLEXITY: SeedQuestionInput[] = [
  {
    topic_slug: "algorithms-complexity",
    official_ref: "0915-Q4",
    title: "陣列佇列模擬與跨輪保留的淘汰遊戲",
    prompt: "給定右側程式片段，當程式執行完後，輸出結果為何？",
    code: `Q = [0] * 200\nval = 0\ncount = 0\nhead = tail = 0\nfor i in range(1, 31):\n    Q[tail] = i\n    tail = tail + 1\nwhile tail > head + 1:\n    val = Q[head]\n    head = head + 1\n    count = count + 1\n    if count == 3:\n        count = 0\n        Q[tail] = val\n        tail = tail + 1\nprint(Q[head])`,
    question_type: "trace",
    difficulty: "advanced",
    options: [
      {
        key: "A",
        text: "9",
        misconception: "第一輪留下 3, 6, ..., 30 後，第二輪算錯 count==3 放回的元素或誤在輪次交界歸零 count。",
      },
      {
        key: "B",
        text: "18",
        misconception: "正確解答！經過 4 輪模擬（每第 3 個放回隊尾）最後僅剩 18。",
      },
      {
        key: "C",
        text: "27",
        misconception: "算到第三輪留下 [9, 18, 27] 或最後輪誤以為保留最後一個 27。",
      },
      {
        key: "D",
        text: "30",
        misconception: "誤以為每次都會保留最後一個數 30，忽略 count 跨輪延續的行為。",
      },
    ],
    correct_option: "B",
    explanation:
      "程式把 1~30 放進佇列後，每次從隊頭取出 1 個並讓 count+1；只有 count == 3 時才放回隊尾並把 count 歸 0（等於每三個留最後一個）。注意 count 在每一輪之間不會自動重設：\n• 第 1 輪（30 個，起始 count=0）：留下 3, 6, 9, 12, 15, 18, 21, 24, 27, 30（結束時 count=0）\n• 第 2 輪（10 個，起始 count=0）：留 9, 18, 27；讀完 30 時 count=1（未進 if！）\n• 第 3 輪（共 3 個 [9, 18, 27]，承接 count=1）：\n  - 讀 9 → count=2（淘汰）\n  - 讀 18 → count=3（歸 0 並放回隊尾！）\n  - 讀 27 → count=1（淘汰）\n• 此時佇列僅剩 1 個元素（tail == head + 1），while 迴圈停止，印出 Q[head] = 18！",
    trace_steps: [
      { line: 7, vars: { 佇列長度: 30, count: 0 }, note: "1~30 入列，head=0, tail=30" },
      { line: 12, vars: { 本輪留存: "[3,6,9,12,15,18,21,24,27,30]", count: 0 }, note: "第 1 輪取完 30 個，共放回 10 個 3 的倍數" },
      { line: 12, vars: { 本輪留存: "[9, 18, 27]", count: 1 }, note: "第 2 輪讀完 30 時 count=1，跨輪保留！" },
      { line: 11, vars: { val: 9, count: 2 }, note: "讀出 9 -> count=2（不放回）" },
      { line: 14, vars: { val: 18, count: 0, 放回: 18 }, note: "讀出 18 -> count=3，歸零並把 18 放回隊尾！" },
      { line: 11, vars: { val: 27, count: 1 }, note: "讀出 27 -> count=1（淘汰），只剩 [18]" },
      { line: 16, vars: { "Q[head]": 18 }, output: "18", note: "tail == head + 1 結束迴圈，印出 18" },
    ],
  },
  {
    topic_slug: "algorithms-complexity",
    official_ref: "0915-Q6",
    title: "線性搜尋與二分搜尋執行次數比較",
    prompt:
      "給定一整數列表 a[0]、a[1]、…、a[99] 且 a[k]=3k+1，以 value=100 呼叫以下兩函式，假設函式 f1 及 f2 之 while 迴圈主體分別執行 n1 與 n2 次（即計算 if 敘述執行次數，不包含 elif），請問 n1 與 n2 之值為何？（註：(low+high)//2 只取整數部分）",
    code: `def f1(a, value):\n    r_value = -1\n    i = 0\n    while i < 100:\n        n1 += 1\n        if a[i] == value:\n            r_value = i\n            break\n        i = i + 1\n    return r_value\n\ndef f2(a, value):\n    r_value = -1\n    low = 0\n    high = 99\n    while low <= high:\n        n2 += 1\n        mid = (low + high) // 2\n        if a[mid] == value:\n            r_value = mid\n            break\n        elif a[mid] < value:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return r_value`,
    question_type: "trace",
    difficulty: "medium",
    options: [
      {
        key: "A",
        text: "n1=33, n2=4",
        misconception: "n1 誤以為索引 k=33 就是次數（漏算 i=0 那次），且二分搜尋也少算 1 次。",
      },
      {
        key: "B",
        text: "n1=33, n2=5",
        misconception: "二分搜尋次數 5 正確，但線性搜尋 i=0..33 共有 34 次而非 33 次。",
      },
      {
        key: "C",
        text: "n1=34, n2=4",
        misconception: "n1=34 正確，但二分搜尋手算 mid 時多除掉一次或少數了最後命中的第 5 次。",
      },
      {
        key: "D",
        text: "n1=34, n2=5",
        misconception: "正確解答！f1 從 i=0 找到 33 共 34 次；f2 依序取 mid=49, 24, 36, 30, 33 共 5 次。",
      },
    ],
    correct_option: "D",
    explanation:
      "先求目標索引：3k + 1 = 100 → 3k = 99 → k = 33。\n1. 線性搜尋 f1：i 從 0 依序檢查到 33（含），於 a[33]==100 時 break，總執行次數 n1 = 33 - 0 + 1 = 34 次。\n2. 二分搜尋 f2（目標 mid = 33）：\n• 第 1 次：[0, 99] → mid = 49 (太大，high=48)\n• 第 2 次：[0, 48] → mid = 24 (太小，low=25)\n• 第 3 次：[25, 48] → mid = 36 (太大，high=35)\n• 第 4 次：[25, 35] → mid = 30 (太小，low=31)\n• 第 5 次：[31, 35] → mid = 33 (命中 break！)\n故 n2 = 5 次。",
    trace_steps: [
      { line: 6, vars: { target_index: 33, "f1_i": "0 -> 33", n1: 34 }, note: "線性搜尋從 i=0 到 i=33 命中 break，n1 = 34" },
      { line: 19, vars: { low: 0, high: 99, mid: 49, n2: 1 }, note: "f2 第 1 次：mid=49, a[49]=148 > 100 -> high=48" },
      { line: 19, vars: { low: 0, high: 48, mid: 24, n2: 2 }, note: "f2 第 2 次：mid=24, a[24]=73 < 100 -> low=25" },
      { line: 19, vars: { low: 25, high: 48, mid: 36, n2: 3 }, note: "f2 第 3 次：mid=36, a[36]=109 > 100 -> high=35" },
      { line: 19, vars: { low: 25, high: 35, mid: 30, n2: 4 }, note: "f2 第 4 次：mid=30, a[30]=91 < 100 -> low=31" },
      { line: 19, vars: { low: 31, high: 35, mid: 33, n2: 5 }, note: "f2 第 5 次：mid=33, a[33]=100 命中，n2 = 5" },
    ],
  },
  {
    topic_slug: "algorithms-complexity",
    official_ref: "0915-Q7",
    title: "滾動雙變數計算費氏數列填空",
    prompt:
      "一個費氏數列定義第一個數為 0，第二個數為 1，之後的每個數都等於前兩個數相加（0, 1, 1, 2, 3, 5, 8...）。右列的程式用以計算並印出第 N 個 (N >= 2) 費氏數列的數值，請問 (a) 與 (b) 兩個空格的敘述應該為何？",
    code: `a = 0\nb = 1\nfor i in range(2, N + 1):\n    temp = b\n    (a)\n    a = temp\nprint( (b) )`,
    question_type: "fill",
    difficulty: "basic",
    options: [
      {
        key: "A",
        text: "(a) f[i] = f[i-1]+f[i-2]   (b) f[N]",
        misconception: "右側程式完全沒有宣告列表 f，執行時會引發 NameError。",
      },
      {
        key: "B",
        text: "(a) a = a+b   (b) a",
        misconception: "若 (a) 改動了 a，下一行 a = temp 會直接把剛算出的和覆寫掉！",
      },
      {
        key: "C",
        text: "(a) b = a+b   (b) a",
        misconception: "正確解答！每次迴圈結束時，a 是第 i 個費氏數（舊 b），最後印出 a。",
      },
      {
        key: "D",
        text: "(a) f[i] = f[i-1]+f[i-2]   (b) f[i]",
        misconception: "右側程式沒有定義陣列 f。",
      },
    ],
    correct_option: "C",
    explanation:
      "觀察題目對第 N 個數的定義：「第一個數（N=1）為 0，第二個數（N=2）為 1」，題目從 1 開始編號，所以程式變數對應：\n• 進入迴圈前：a 是第 1 個（0），b 是第 2 個（1）。\n• 執行 i=2（共執行 N-1 次中的第 1 次）：temp = b (1)，空格 (a) 應更新下一項 b = a + b (0+1=1)，接著 a = temp (1，變成第 2 個)。\n• 迴圈共跑 range(2, N+1) 即 N-1 次：跑完後 a 剛好前進了 N-1 步，成為第 1+(N-1) = N 個數！\n例如代入最小邊界 N=2：迴圈跑 i=2 一次後，a=1（第 2 個數）、b=1（第 3 個數）；若 N=3 再跑一次，a=1（第 3 個數）、b=2（第 4 個數）。故第 (b) 格應印 a。",
    trace_steps: [
      { line: 2, vars: { N: 4, a: 0, b: 1 }, note: "初始：a=第1數(0), b=第2數(1)" },
      { line: 6, vars: { i: 2, temp: 1, b: 1, a: 1 }, note: "i=2 後：a=第2數(1), b=第3數(1)" },
      { line: 6, vars: { i: 3, temp: 1, b: 2, a: 1 }, note: "i=3 後：a=第3數(1), b=第4數(2)" },
      { line: 7, vars: { i: 4, temp: 2, b: 3, a: 2 }, output: "2", note: "i=4 後：a=第4數(2)，印出 a 即得第 4 個數 2" },
    ],
  },
  {
    topic_slug: "algorithms-complexity",
    official_ref: "0915-Q9",
    title: "迭代版輾轉相除法三行賦值順序",
    prompt:
      "右側程式片段擬以輾轉除法求 i 與 j 的最大公因數。請問 while 迴圈內容何者正確？",
    code: `i = 76\nj = 48\nwhile (i % j) != 0:\n    ____________\n    ____________\n    ____________\nprint(j)`,
    question_type: "fill",
    difficulty: "basic",
    options: [
      {
        key: "A",
        text: "k = i % j / i = j / j = k",
        misconception: "正確解答！先算餘數存入 k，再把 j 移入 i，最後把餘數 k 移入 j。",
      },
      {
        key: "B",
        text: "i = j / j = k / k = i % j",
        misconception: "尚未用到舊的 i 就被覆寫成 j，且一開始 k 根本還沒有值。",
      },
      {
        key: "C",
        text: "i = j / j = i % k / k = i",
        misconception: "一開始 k 尚未定義，且覆寫順序全部錯亂。",
      },
      {
        key: "D",
        text: "k = i / i = j / j = i % k",
        misconception: "第三行算的是 i % k（即 j % old_i），反過來用小數除以大數，無法收斂。",
      },
    ],
    correct_option: "A",
    explanation:
      "輾轉相除每一輪要將 (i, j) 更新為 (j, i % j)。\n為了避免 i 被 j 覆寫後找不到原本的 i % j，必須先把新餘數算出來放進暫存變數 k = i % j，再依序執行 i = j 與 j = k。\n執行過程：76, 48 → k=28, i=48, j=28 → k=20, i=28, j=20 → k=8, i=20, j=8 → k=4, i=8, j=4 → 8 % 4 == 0 跳出，印出 4。",
    trace_steps: [
      { line: 4, vars: { i: 76, j: 48, k: 28 }, note: "第 1 輪：k=76%48=28 -> i=48, j=28" },
      { line: 4, vars: { i: 48, j: 28, k: 20 }, note: "第 2 輪：k=48%28=20 -> i=28, j=20" },
      { line: 4, vars: { i: 28, j: 20, k: 8 }, note: "第 3 輪：k=28%20=8 -> i=20, j=8" },
      { line: 7, vars: { i: 8, j: 4 }, output: "4", note: "第 4 輪後 8 % 4 == 0 跳出，印出最大公因數 4" },
    ],
  },
  {
    topic_slug: "algorithms-complexity",
    official_ref: "0915-Q22",
    title: "設計無解邊界反例偵測二分搜尋錯誤",
    prompt:
      "給定一個 1x8 的列表 A，A = [0, 2, 4, 6, 8, 10, 12, 14]。右側函式 Search(x) 真正目的是找到 A 之中大於 x 的最小值。然而，這個函式有誤。請問下列哪個函式呼叫可測出函式有誤？",
    code: `A = [0, 2, 4, 6, 8, 10, 12, 14]\ndef Search(x):\n    high = 7\n    low = 0\n    while high > low:\n        mid = (high + low) // 2\n        if A[mid] <= x:\n            low = mid + 1\n        else:\n            high = mid\n    return A[high]`,
    question_type: "counterexample",
    difficulty: "medium",
    options: [
      {
        key: "A",
        text: "Search(-1)",
        misconception: "大於 -1 的最小值是 0，Search(-1) 會收斂到 high=0 回傳 A[0]=0，結果正確測不出 Bug。",
      },
      {
        key: "B",
        text: "Search(0)",
        misconception: "大於 0 的最小值是 2，Search(0) 會收斂到 high=1 回傳 A[1]=2，結果正確測不出 Bug。",
      },
      {
        key: "C",
        text: "Search(10)",
        misconception: "大於 10 的最小值是 12，Search(10) 會收斂到 high=6 回傳 A[6]=12，結果正確測不出 Bug。",
      },
      {
        key: "D",
        text: "Search(16)",
        misconception: "正確解答！A 中沒有任何大於 16 的數，函式卻仍回傳最大元素 A[7] = 14！",
      },
    ],
    correct_option: "D",
    explanation:
      "這個二分搜尋在尋找 lower-bound of (> x) 時，將搜尋上界設在合法索引 high = 7（而非虛擬無解位置 n=8），且最後未檢查 A[high] 是否真的 > x 就直接回傳。\n當輸入 x = 16（大於或等於陣列最大值 14）時，A[mid] <= 16 永遠成立，low 一路被推到 7 與 high=7 相遇後結束，程式錯誤地回傳 A[7] = 14（明明 14 不大於 16）。",
    trace_steps: [
      { line: 5, vars: { x: 16, low: 0, high: 7, mid: 3 }, note: "A[3]=6 <= 16 -> low = 4" },
      { line: 5, vars: { x: 16, low: 4, high: 7, mid: 5 }, note: "A[5]=10 <= 16 -> low = 6" },
      { line: 5, vars: { x: 16, low: 6, high: 7, mid: 6 }, note: "A[6]=12 <= 16 -> low = 7，與 high=7 相遇跳出" },
      { line: 11, vars: { ret: 14 }, note: "未驗證 14 > 16 就直接回傳 14，成功測出無解邊界 Bug！" },
    ],
  },
  {
    topic_slug: "algorithms-complexity",
    official_ref: "0915-Q28",
    title: "三層迴圈執行次數數學建模",
    prompt: "給定右側函式 F( )，F( ) 執行完所回傳的 x 值為何？",
    code: `def F(n):\n    x = 0\n    for i in range(1, n+1):\n        for j in range(i, n+1):\n            k = 1\n            while k <= n:\n                x = x + 1\n                k = k * 2\n    return x`,
    question_type: "complexity",
    difficulty: "advanced",
    options: [
      {
        key: "A",
        text: "n(n+1)√⌊log₂ n⌋",
        misconception: "代入 n=1 得出 0，但 F(1) 真實回傳 1。",
      },
      {
        key: "B",
        text: "n²(n+1)/2",
        misconception: "誤以為內層 while k <= n 會跑 n 次（其實每次倍增只跑對數級次數）。",
      },
      {
        key: "C",
        text: "n(n+1)⌊log₂ n + 1⌋/2",
        misconception: "正確解答！外兩層共 n(n+1)/2 次，乘上內層倍增迴圈 ⌊log₂ n⌋ + 1 次。",
      },
      {
        key: "D",
        text: "n(n+1)/2",
        misconception: "漏算了最內層 while 迴圈執行的次數（僅當 n=1 時恰好相等，代入 n=2 會看出 F(2)=6 而非 3）。",
      },
    ],
    correct_option: "C",
    explanation:
      "拆分內外結構：\n1. 外兩層：當 i=1 時 j 跑 n 次；i=2 時跑 n-1 次；...；i=n 時跑 1 次。總和為 n + (n-1) + ... + 1 = n(n+1)/2 次。\n2. 最內層：k 從 1 開始每次乘 2（1, 2, 4, ..., 2^m <= n），共有 m + 1 = ⌊log₂ n⌋ + 1 次。\n兩者相乘即得 n(n+1)(⌊log₂ n⌋ + 1) / 2。\n考場速驗：代入 n=2，手算 F(2)：(i=1,j=1),(1,2),(2,2) 共 3 組 × 內層 k=1,2 共 2 次 = 6；四個選項只有 (C) 代 n=2 得出 2×3×2/2 = 6！",
    trace_steps: [
      { line: 3, vars: { n: 2, "(i,j)組數": "3 組：(1,1),(1,2),(2,2)" }, note: "外兩層上三角合計 n(n+1)/2 = 3 次" },
      { line: 6, vars: { k: "1 -> 2 -> 4(停)", 內層次數: 2 }, note: "n=2 時 k=1, 2 跑 ⌊log₂ 2⌋ + 1 = 2 次" },
      { line: 9, vars: { "F(2)": 6 }, note: "回傳 3 × 2 = 6，只有選項 (C) 代入 n=2 等於 6" },
    ],
  },
];
