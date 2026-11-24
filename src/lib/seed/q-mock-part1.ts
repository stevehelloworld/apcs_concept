import type { SeedQuestionInput } from "./q-control-flow";

export const SEED_MOCK_QUESTIONS_PART1: SeedQuestionInput[] = [
  // ========================
  // L1: control-flow (SIM-01 .. SIM-04)
  // ========================
  {
    topic_slug: "control-flow",
    official_ref: "SIM-01",
    title: "負數地板除法與邏輯短路求值",
    prompt: "執行右側 Python 程式後，螢幕會印出什麼結果？",
    code: `calls = 0
def bump(v):
    global calls
    calls += 1
    return v
a = -7 // 3
b = -7 % 3
ok = (a + b > 0) and (bump(1) > 0)
ans = (b == 2) or (bump(5) > 0)
print(a, b, calls, ans)`,
    question_type: "trace",
    difficulty: "basic",
    options: [
      {
        key: "A",
        text: "-2 -1 0 True",
        misconception:
          "誤套用 C/Java 的向零截斷規則把 -7 // 3 算成 -2；在 Python 中 // 恆向負無窮取整，因此 -7 // 3 = -3、餘數 -7 % 3 = 2，且 b == 2 為真。",
      },
      {
        key: "B",
        text: "-3 2 0 True",
        misconception:
          "完全正確！Python 負數地板除法滿足 a * 3 + b == -7，且 and 左偽、or 左真雙雙觸發短路求值。",
      },
      {
        key: "C",
        text: "-3 2 2 True",
        misconception:
          "算對了 // 與 %，但忽略 Python 邏輯運算子 and / or 具短路求值特性，右側的 bump() 一次都不會被呼叫。",
      },
      {
        key: "D",
        text: "-3 2 1 True",
        misconception:
          "漏判其中一處短路：第 8 行左側為 False 使 and 跳過右側，第 9 行左側為 True 使 or 同樣跳過右側，calls 維持 0。",
      },
    ],
    correct_option: "B",
    explanation:
      "1. Python 的地板除法 // 向負無窮取整：-7 / 3 = -2.333... 向下取整為 a = -3；餘數須滿足 -3 × 3 + b = -7，因此 b = 2。\n2. 第 8 行 a + b = -1 > 0 為 False，and 運算子直接短路確定結果為 False，不呼叫 bump(1)。\n3. 第 9 行 b == 2 為 True，or 運算子直接短路確定結果為 True，也不呼叫 bump(5)。\n4. 最終印出 -3 2 0 True。",
    trace_steps: [
      { line: 6, vars: { calls: 0, a: -3 }, note: "-7 // 3 向負無窮取整得到 a = -3" },
      { line: 7, vars: { calls: 0, a: -3, b: 2 }, note: "-7 % 3 與除數 3 同號，得 b = 2" },
      {
        line: 8,
        vars: { calls: 0, a: -3, b: 2, ok: false },
        note: "a + b = -1 > 0 為 False，and 短路跳過 bump(1)，calls 維持 0",
      },
      {
        line: 9,
        vars: { calls: 0, a: -3, b: 2, ans: true },
        note: "b == 2 為 True，or 短路跳過 bump(5)，calls 仍為 0",
      },
      {
        line: 10,
        vars: { calls: 0, a: -3, b: 2, ans: true },
        output: "-3 2 0 True",
        note: "輸出 -3 2 0 True",
      },
    ],
  },
  {
    topic_slug: "control-flow",
    official_ref: "SIM-02",
    title: "運算子優先序與笛摩根等價條件分析",
    prompt:
      "已知 age 與 score 為整數、vip 為布林值。下列哪一個布林運算式對所有輸入都與右側 allow() 的回傳值完全等價？",
    code: `def allow(age, score, vip):
    return not (age < 12 or score >= 80 and not vip)`,
    question_type: "static",
    difficulty: "medium",
    options: [
      {
        key: "A",
        text: "age >= 12 and (score < 80 or vip)",
        misconception:
          "完全正確！先依 and 高於 or 結合括號，再套用笛摩根定律即可化簡至此式。",
      },
      {
        key: "B",
        text: "age >= 12 or score < 80 and vip",
        misconception:
          "套用笛摩根定律時忘記把括號內的 or 反轉為 and、且把 and 反轉為 or。",
      },
      {
        key: "C",
        text: "(age >= 12 and score < 80) or vip",
        misconception:
          "誤以為原本式子中 or 比 and 先算；實際上 Python 優先序為 not > and > or。",
      },
      {
        key: "D",
        text: "age > 12 and (score <= 80 or vip)",
        misconception:
          "否定比較運算子時邊界誤判：not (age < 12) 應為 age >= 12（含 12），且 not (score >= 80) 應為 score < 80。",
      },
    ],
    correct_option: "A",
    explanation:
      "1. 依 Python 運算子優先序 not > and > or，括號內部實際為：(age < 12) or (score >= 80 and not vip)。\n2. 外層加上 not 後套用笛摩根定律：\n   not (age < 12) and not (score >= 80 and not vip)\n   = (age >= 12) and (not (score >= 80) or not (not vip))\n   = age >= 12 and (score < 80 or vip)。",
    trace_steps: [
      { line: 2, vars: { precedence: "not > and > or" }, note: "先將內部拆解為 (age < 12) or (score >= 80 and not vip)" },
      { line: 2, vars: { negated_left: "age >= 12" }, note: "not (age < 12) 化為 age >= 12，且外層 or 翻轉為 and" },
      { line: 2, vars: { negated_right: "score < 80 or vip" }, note: "not (score >= 80 and not vip) 翻轉為 (score < 80 or vip)" },
    ],
  },
  {
    topic_slug: "control-flow",
    official_ref: "SIM-03",
    title: "階梯折扣重複扣款的觸發金額區間",
    prompt:
      "結帳規則原意為：「消費滿 1000 元折抵 400 元；未滿 1000 元但滿 700 元折抵 100 元（兩者不可疊加）」。右列程式誤將第二組條件寫成獨立 if，導致部分消費金額被重複扣款，請問所有「實際扣款與原意不符」的整數輸入金額 p 為何？",
    code: `def pay(p):
    if p >= 1000:
        p -= 400
    if p >= 700:
        p -= 100
    return p`,
    question_type: "debug",
    difficulty: "medium",
    options: [
      {
        key: "A",
        text: "p >= 1000 的所有整數",
        misconception:
          "忽略了當 1000 <= p <= 1099 時，扣掉 400 後只剩 600~699（小於 700），反而不會進第二個 if。",
      },
      {
        key: "B",
        text: "1000 <= p <= 1099",
        misconception:
          "正好判反！1000..1099 減去 400 後落在 [600, 699]，剛好閃過第二個 if；反而是 1100 以上會中招。",
      },
      {
        key: "C",
        text: "p >= 1100 的所有整數",
        misconception:
          "完全正確！當 p >= 1100 時，先減 400 仍 >= 700，導致又進第二個 if 再多扣 100 元。",
      },
      {
        key: "D",
        text: "700 <= p <= 999",
        misconception:
          "700..999 不會進入第一個 if，只會正確執行第二個 if 扣 100 元。",
      },
    ],
    correct_option: "C",
    explanation:
      "1. 當 p < 1000：第一個 if 不成立，第二個 if 僅對 700..999 扣 100 元，符合規格。\n2. 當 1000 <= p <= 1099：進入第一個 if 後 p 落在 600..699，因此到達 if p >= 700 時條件為 False，恰好逃過重複扣款！這也是為什麼僅測試 p = 1000 會測不出這個 Bug。\n3. 當 p >= 1100：扣完 400 後 p - 400 >= 700，會繼續進入第二個 if 多扣 100 元（例如 p = 1100 只付 600，竟比 p = 1050 付 650 還便宜）。",
    trace_steps: [
      { line: 2, vars: { p: 1050 }, note: "以 p=1050 測試：進入第 2 行 if p >= 1000" },
      { line: 3, vars: { p: 650 }, note: "1050 - 400 = 650 < 700，跳過第 4 行故看起來正確" },
      { line: 2, vars: { p: 1100 }, note: "改測 p=1100：進入第 2 行 if p >= 1000" },
      { line: 3, vars: { p: 700 }, note: "1100 - 400 = 700，仍滿足第 4 行條件！" },
      { line: 5, vars: { p: 600 }, note: "被重複扣減 100 元變成 600，暴露 p >= 1100 的錯誤" },
    ],
  },
  {
    topic_slug: "control-flow",
    official_ref: "SIM-04",
    title: "設計反例偵測三角形合法性與等腰順序誤置",
    prompt:
      "右側 tri(a, b, c) 試圖依邊長回傳類型（不合法應回傳 INVALID），但條件順序有誤。下列哪一組測試輸入能直接讓此函式回傳錯誤結果？",
    code: `def tri(a, b, c):
    if a <= 0 or b <= 0 or c <= 0:
        return "INVALID"
    if a == b == c:
        return "EQUILATERAL"
    elif a == b or b == c or a == c:
        return "ISOSCELES"
    elif a + b <= c or a + c <= b or b + c <= a:
        return "INVALID"
    return "SCALENE"`,
    question_type: "counterexample",
    difficulty: "advanced",
    options: [
      {
        key: "A",
        text: "tri(2, 3, 5)",
        misconception:
          "2, 3, 5 三邊互不相等，會走到第 8 行並正確回傳 INVALID，無法暴露順序錯誤。",
      },
      {
        key: "B",
        text: "tri(2, 2, 5)",
        misconception:
          "完全正確！2 + 2 <= 5 根本無法構成三角形，但第 6 行的等腰判斷先成立而誤判為 ISOSCELES。",
      },
      {
        key: "C",
        text: "tri(0, 4, 4)",
        misconception:
          "因為第 2 行有檢查 <= 0，a = 0 會提前正確回傳 INVALID，測不出後續的分支錯置。",
      },
      {
        key: "D",
        text: "tri(4, 4, 6)",
        misconception:
          "4 + 4 > 6 是合法的等腰三角形，回傳 ISOSCELES 正好符合預期。",
      },
    ],
    correct_option: "B",
    explanation:
      "程式把「兩邊相等 (elif a == b or ...)」寫在「三角不等式檢查 (elif a + b <= c or ...)」之前。\n要揭露此錯誤，測資必須滿足：\n1. 全為正數且有兩邊相等（才會進第 6 行）；\n2. 同時違反三角不等式（兩短邊和 <= 第三邊）。\ntri(2, 2, 5) 滿足 2 + 2 <= 5 應為 INVALID，卻在第 6 行被誤判為 ISOSCELES。",
    trace_steps: [
      { line: 2, vars: { a: 2, b: 2, c: 5 }, note: "三邊皆 > 0，通過第 2 行" },
      { line: 4, vars: { a: 2, b: 2, c: 5 }, note: "非三邊全等，跳過第 4 行" },
      { line: 6, vars: { match: "a == b (2 == 2)" }, note: "先遇到第 6 行 elif a == b 條件成立！" },
      {
        line: 7,
        vars: { returned: "ISOSCELES", expected: "INVALID" },
        note: "直接提前回傳 ISOSCELES，第 8 行三角不等式驗證從未被執行",
      },
    ],
  },

  // ========================
  // L2: loops-range (SIM-05 .. SIM-08)
  // ========================
  {
    topic_slug: "loops-range",
    official_ref: "SIM-05",
    title: "continue、break 與 for...else 子句追蹤",
    prompt: "執行右側 Python 程式後，會印出什麼數值？",
    code: `res = 0
for n in range(2, 10):
    if n % 2 == 0:
        continue
    res += n
    if res > 10:
        res -= 4
        break
else:
    res += 100
print(res)`,
    question_type: "trace",
    difficulty: "basic",
    options: [
      {
        key: "A",
        text: "11",
        misconception:
          "完全正確！for...else 只在迴圈未被 break 中斷時才執行，因此不會加 100。",
      },
      {
        key: "B",
        text: "111",
        misconception:
          "誤以為 for...else 的 else 在迴圈結束後一律執行；實際上被 break 中斷時會跳過 else。",
      },
      {
        key: "C",
        text: "15",
        misconception:
          "誤以為 if res > 10 就立即離開迴圈，忽略了第 7 行的 res -= 4 先將 15 減為 11 才 break。",
      },
      {
        key: "D",
        text: "108",
        misconception:
          "同時算錯終止條件（少跑 n=7）與誤觸 else（加了 100）。",
      },
    ],
    correct_option: "A",
    explanation:
      "1. range(2, 10) 依序產生 2..9，所有偶數於第 4 行 continue 跳過。\n2. 奇數累加過程：n=3 得 res=3；n=5 得 res=8；n=7 得 res=15。\n3. 15 > 10 成立，執行 res -= 4 得 res=11 後觸發 break 跳離迴圈。\n4. 由於是經由 break 中斷，第 9 行的 else 子句不執行，最終印出 11。",
    trace_steps: [
      { line: 2, vars: { n: 2, res: 0 }, note: "n=2 為偶數，第 4 行 continue" },
      { line: 5, vars: { n: 3, res: 3 }, note: "n=3 累加得 res = 3" },
      { line: 5, vars: { n: 5, res: 8 }, note: "跳過 4 後 n=5 累加得 res = 8" },
      { line: 5, vars: { n: 7, res: 15 }, note: "跳過 6 後 n=7 累加得 res = 15，滿足 > 10" },
      { line: 7, vars: { n: 7, res: 11 }, note: "執行 res -= 4 更新為 11" },
      { line: 8, vars: { res: 11 }, note: "執行 break 中斷迴圈，直接跳過 else 子句" },
      { line: 11, vars: { res: 11 }, output: "11", note: "輸出最終結果 11" },
    ],
  },
  {
    topic_slug: "loops-range",
    official_ref: "SIM-06",
    title: "整數逐位拆解與奇偶位加權累加",
    prompt: "執行右側整數拆位程式後，螢幕輸出為何？",
    code: `n = 2594
pos = 1
total = 0
while n > 0:
    d = n % 10
    if pos % 2 == 1:
        total += d
    else:
        total -= d * 2
    pos += 1
    n //= 10
print(total)`,
    question_type: "trace",
    difficulty: "medium",
    options: [
      {
        key: "A",
        text: "-7",
        misconception:
          "從左到右順讀位數（把 pos=1 當最高位 2）：2 - 10 + 9 - 8 = -7；用 % 10 與 //= 10 拆位是由右到左（個位起算）。",
      },
      {
        key: "B",
        text: "-13",
        misconception:
          "完全正確！由右向左依序取出 4(+4)、9(-18)、5(+5)、2(-4)，總和為 -13。",
      },
      {
        key: "C",
        text: "0",
        misconception:
          "拆位時忘記偶數位需乘以 2，算成 +4 - 9 + 5 - 2 = -2，或把 d 乘錯權重。",
      },
      {
        key: "D",
        text: "-9",
        misconception:
          "最後一輪 n = 2 時誤以為迴圈只看 n > 2 而漏掉最高位 2（4 - 18 + 5 = -9）。",
      },
    ],
    correct_option: "B",
    explanation:
      "利用 n % 10 永遠取得「目前最右邊（個位）」數字，再以 n //= 10 砍掉個位數：\n- pos=1 (奇): d=4 → total = 0 + 4 = 4，n=259\n- pos=2 (偶): d=9 → total = 4 - 18 = -14，n=25\n- pos=3 (奇): d=5 → total = -14 + 5 = -9，n=2\n- pos=4 (偶): d=2 → total = -9 - 4 = -13，n=0\n離開 while 迴圈後印出 -13。",
    trace_steps: [
      { line: 5, vars: { n: 2594, pos: 1, d: 4, total: 4 }, note: "第 1 輪取出個位 4，pos=1 加 4 得 total=4" },
      { line: 9, vars: { n: 259, pos: 2, d: 9, total: -14 }, note: "第 2 輪取出 9，pos=2 減去 9×2 得 total=-14" },
      { line: 7, vars: { n: 25, pos: 3, d: 5, total: -9 }, note: "第 3 輪取出 5，pos=3 加 5 得 total=-9" },
      { line: 9, vars: { n: 2, pos: 4, d: 2, total: -13 }, note: "第 4 輪取出 2，pos=4 減去 2×2 得 total=-13" },
      { line: 12, vars: { n: 0, total: -13 }, output: "-13", note: "n 歸零結束迴圈，印出 -13" },
    ],
  },
  {
    topic_slug: "loops-range",
    official_ref: "SIM-07",
    title: "5×5 雙對角線星號矩陣條件填空",
    prompt:
      "右側程式執行後必須剛好印出右下方 5×5 的 X 字形對角線圖樣：\n*...*\n.*.*.\n..*..\n.*.*.\n*...*\n請問第 4 行 (?) 處應填入哪一個條件式？",
    code: `for r in range(5):
    row = ""
    for c in range(5):
        if (?):
            row += "*"
        else:
            row += "."
    print(row)`,
    question_type: "fill",
    difficulty: "medium",
    options: [
      {
        key: "A",
        text: "r == c and r + c == 4",
        misconception:
          "用 and 會要求同時在兩條對角線上，整張圖只剩正中央 (2, 2) 是星號。",
      },
      {
        key: "B",
        text: "r == c or r + c == 5",
        misconception:
          "5×5 的索引範圍為 0..4，副對角線關係應為 r + c == 4；寫成 5 會向右下方偏移一格並漏掉 (0, 4)。",
      },
      {
        key: "C",
        text: "r == c or r + c == 4",
        misconception:
          "完全正確！主對角線滿足 r == c，副對角線滿足 r + c == n - 1 = 4。",
      },
      {
        key: "D",
        text: "r == c or abs(r - c) == 4",
        misconception:
          "abs(r - c) == 4 只包含角落兩點 (0, 4) 與 (4, 0)，中間的 (1, 3) 和 (3, 1) 會變成點號。",
      },
    ],
    correct_option: "C",
    explanation:
      "列出需要印出 * 的座標：\n- r=0: (0,0), (0,4)\n- r=1: (1,1), (1,3)\n- r=2: (2,2)\n- r=3: (3,1), (3,3)\n- r=4: (4,0), (4,4)\n主對角線座標皆滿足 r == c；副對角線每一格座標和均為 0+4 = 1+3 = 2+2 = 4，因此條件為 r == c or r + c == 4。",
    trace_steps: [
      { line: 4, vars: { r: 0, row: "*...*" }, note: "r=0 時 c=0 (r==c) 與 c=4 (r+c==4) 為 *" },
      { line: 4, vars: { r: 1, row: ".*.*." }, note: "r=1 時 c=1 與 c=3 為 *" },
      { line: 4, vars: { r: 2, row: "..*.." }, note: "r=2 時 c=2 同時滿足兩條件，印 1 顆 *" },
      { line: 8, vars: { pattern: "5x5 X-cross" }, output: "*...*\n.*.*.\n..*..\n.*.*.\n*...*", note: "完整輸出雙對角線 X 圖形" },
    ],
  },
  {
    topic_slug: "loops-range",
    official_ref: "SIM-08",
    title: "隨外層變動的內層倍增迴圈執行次數分析",
    prompt: "右側程式執行完畢後，輸出的 cnt 數值為何？",
    code: `cnt = 0
for i in range(1, 9):
    j = i
    while j <= 8:
        cnt += 1
        j *= 2
print(cnt)`,
    question_type: "complexity",
    difficulty: "advanced",
    options: [
      {
        key: "A",
        text: "15",
        misconception:
          "完全正確！將 i=1..8 各輪內層迴圈執行次數相加：4 + 3 + 2 + 2 + 1 + 1 + 1 + 1 = 15。",
      },
      {
        key: "B",
        text: "16",
        misconception:
          "多算了一次：注意 j 從 i 開始而不是從 1 開始（或誤以為 range(1, 9) 包含 i=9 的邊界）。",
      },
      {
        key: "C",
        text: "24",
        misconception:
          "直接用外層 8 次 × log2(8)=3 估算成 24，忽略內層起點 j = i 會使後半輪次縮短。",
      },
      {
        key: "D",
        text: "32",
        misconception:
          "把所有 i 的倍增次數都套用 i=1 的最大值 4 次（8 × 4 = 32），這是寬鬆上界而非實際計數。",
      },
    ],
    correct_option: "A",
    explanation:
      "外層 i 從 1 跑到 8，逐一列舉內層 while j <= 8 的 j 值序列：\n- i=1: 1, 2, 4, 8 → 4 次\n- i=2: 2, 4, 8 → 3 次\n- i=3: 3, 6 → 2 次\n- i=4: 4, 8 → 2 次\n- i=5, 6, 7, 8: 各只執行 j=i 這 1 次 → 4 × 1 = 4 次\n合計 cnt = 4 + 3 + 2 + 2 + 4 = 15。",
    trace_steps: [
      { line: 4, vars: { i: 1, cnt: 4 }, note: "i=1 時 j=1,2,4,8 共累加 4 次" },
      { line: 4, vars: { i: 2, cnt: 7 }, note: "i=2 時 j=2,4,8 共累加 3 次 (cnt=7)" },
      { line: 4, vars: { i: 3, cnt: 9 }, note: "i=3 時 j=3,6 共 2 次 (cnt=9)" },
      { line: 4, vars: { i: 4, cnt: 11 }, note: "i=4 時 j=4,8 共 2 次 (cnt=11)" },
      { line: 4, vars: { i: "5..8", cnt: 15 }, note: "i=5..8 各只執行 1 次，累加 4 次得 15" },
      { line: 7, vars: { cnt: 15 }, output: "15", note: "印出最終執行總次數 15" },
    ],
  },

  // ========================
  // L3: lists-grid (SIM-09 .. SIM-12)
  // ========================
  {
    topic_slug: "lists-grid",
    official_ref: "SIM-09",
    title: "二維串列乘號淺拷貝別名與元素重綁",
    prompt: "執行右側操作二維串列的程式後，螢幕會輸出什麼？",
    code: `g = [[0] * 3] * 3
g[0][1] = 5
g[2][1] += 3
g[1] = [1, 2, 3]
print(sum(g[0]), sum(g[1]), sum(g[2]))`,
    question_type: "trace",
    difficulty: "medium",
    options: [
      {
        key: "A",
        text: "5 6 3",
        misconception:
          "把 [[0] * 3] * 3 當成建立了三個各自獨立的子串列；實際上三列參考同一個底層串列物件。",
      },
      {
        key: "B",
        text: "8 6 8",
        misconception:
          "完全正確！第 2-3 行的索引寫入會同步影響共享的 g[0] 與 g[2]，而第 4 行把 g[1] 重新指向全新串列 [1, 2, 3]。",
      },
      {
        key: "C",
        text: "6 6 6",
        misconception:
          "誤以為第 4 行 g[1] = [1, 2, 3] 也會連帶改變共享別名的 g[0] 與 g[2]；重新賦值僅改變該參考位置，不會覆寫原本的物件內容。",
      },
      {
        key: "D",
        text: "8 8 8",
        misconception:
          "忘記第 4 行已將 g[1] 替換為新串列 [1, 2, 3]（總和 6）。",
      },
    ],
    correct_option: "B",
    explanation:
      "1. [[0] * 3] * 3 只建立了一個內層串列物件 row0 = [0, 0, 0]，然後讓 g[0], g[1], g[2] 全部指向它。\n2. g[0][1] = 5 修改元素，共享的 row0 變成 [0, 5, 0]。\n3. g[2][1] += 3 同樣寫入 row0[1]，使 row0 變成 [0, 8, 0]（此時 g[0] 與 g[2] 總和皆為 8）。\n4. 第 4 行 g[1] = [1, 2, 3] 是「重新綁定參考」，讓 g[1] 改指全新的串列物件，並不改動 row0。\n5. 輸出 8 6 8。",
    trace_steps: [
      { line: 1, vars: { "g[0..2]": "shared [0, 0, 0]" }, note: "*3 複製參考，三列指向同一個串列物件" },
      { line: 2, vars: { shared: [0, 5, 0] }, note: "透過 g[0][1] 修改共享列，三列同步變為 [0, 5, 0]" },
      { line: 3, vars: { shared: [0, 8, 0] }, note: "透過 g[2][1] 再加 3，共享列變為 [0, 8, 0]" },
      { line: 4, vars: { "g[0]": [0, 8, 0], "g[1]": [1, 2, 3], "g[2]": [0, 8, 0] }, note: "g[1] 重綁為獨立新串列 [1, 2, 3]，不影響 g[0] 與 g[2]" },
      { line: 5, vars: { output: "8 6 8" }, output: "8 6 8", note: "印出各列總和 8 6 8" },
    ],
  },
  {
    topic_slug: "lists-grid",
    official_ref: "SIM-10",
    title: "負索引與負步長切片複製追蹤",
    prompt: "執行右側串列切片程式後，會印出什麼結果？",
    code: `a = [10, 20, 30, 40, 50, 60, 70]
b = a[-2:0:-2]
b[1] = a[0] + b[-1]
print(a[3], b)`,
    question_type: "trace",
    difficulty: "basic",
    options: [
      {
        key: "A",
        text: "30 [60, 30, 20]",
        misconception:
          "誤以為切片 b 指向原本的 a，修改 b[1] 會同步改動 a[3]；在 Python 中切片永遠產生新串列複本。",
      },
      {
        key: "B",
        text: "40 [60, 30, 20]",
        misconception:
          "完全正確！切片從倒數第 2 個 (60) 往左步長 -2 走到不含 index 0 產生 [60, 40, 20]，且互不共用。",
      },
      {
        key: "C",
        text: "40 [60, 20, 10]",
        misconception:
          "以為負切片停在 0 時會包含 a[0]，或算錯步長 -2 的索引（應取 5, 3, 1）。",
      },
      {
        key: "D",
        text: "40 [70, 50, 30]",
        misconception:
          "誤把 -2 當成最後一個元素 70；負索引 -1 才是 70，-2 對應 60（index 5）。",
      },
    ],
    correct_option: "B",
    explanation:
      "1. a 有 7 個元素，索引為 0..6；a[-2] 等價於 a[5] = 60。\n2. 切片 a[-2:0:-2] 從 index 5 開始每次減 2，在到達邊界 0（不含 0）前停止，取出索引 5, 3, 1 → b = [60, 40, 20]（全新複本）。\n3. b[1] = a[0] + b[-1] = 10 + 20 = 30，因此 b 變為 [60, 30, 20]，原串列 a 完全不變，a[3] 仍為 40。",
    trace_steps: [
      { line: 2, vars: { start_idx: 5, stop_idx: 0, b: [60, 40, 20] }, note: "從 a[-2]=60 每次索引 -2 停在 >0，取 [60, 40, 20]" },
      { line: 3, vars: { "a[0]": 10, "b[-1]": 20, b: [60, 30, 20] }, note: "將 b[1] 改寫為 10 + 20 = 30，不影響原串列 a" },
      { line: 4, vars: { "a[3]": 40, b: [60, 30, 20] }, output: "40 [60, 30, 20]", note: "輸出 40 [60, 30, 20]" },
    ],
  },
  {
    topic_slug: "lists-grid",
    official_ref: "SIM-11",
    title: "3×3 方陣順時針旋轉 90 度座標映射",
    prompt:
      "右方函式需將 n×n 方陣 mat 順時針旋轉 90 度後存入 res。請問第 5 行目標位置應寫成哪一個索引組合？",
    code: `def rotate90(mat):
    n = len(mat)
    res = [[0] * n for _ in range(n)]
    for r in range(n):
        for c in range(n):
            res[(?)] = mat[r][c]
    return res`,
    question_type: "fill",
    difficulty: "medium",
    options: [
      {
        key: "A",
        text: "c][n - 1 - r",
        misconception:
          "完全正確！第 0 列元素轉成最右側欄（c=n-1），第 c 欄轉成第 c 列。",
      },
      {
        key: "B",
        text: "n - 1 - c][r",
        misconception:
          "這個公式對應的是「逆時針」旋轉 90 度，會使左上角 (0, 0) 移到左下角 (n-1, 0)。",
      },
      {
        key: "C",
        text: "n - 1 - r][n - 1 - c",
        misconception:
          "這是旋轉 180 度的上下左右全反轉公式。",
      },
      {
        key: "D",
        text: "c][r",
        misconception:
          "這是矩陣主對角線轉置（Transpose），並非順時針旋轉 90 度。",
      },
    ],
    correct_option: "A",
    explanation:
      "拿 3×3 矩陣的三個角點實測最準確：\n- 原左上 (r=0, c=0) 順時針轉 90° 後移至右上 (0, 2)\n- 原右上 (r=0, c=2) 順時針轉 90° 後移至右下 (2, 2)\n代入選項 (A) res[c][n - 1 - r]：(0,0) → res[0][2]、(0,2) → res[2][2]，完全吻合！",
    trace_steps: [
      { line: 5, vars: { from: "(0, 0)", to: "(0, 2)" }, note: "左上 (0,0) 順時針轉至右上：列=c=0, 欄=3-1-0=2" },
      { line: 5, vars: { from: "(0, 2)", to: "(2, 2)" }, note: "右上 (0,2) 順時針轉至右下：列=c=2, 欄=3-1-0=2" },
      { line: 5, vars: { from: "(2, 0)", to: "(0, 0)" }, note: "左下 (2,0) 順時針轉至左上：列=c=0, 欄=3-1-2=0" },
    ],
  },
  {
    topic_slug: "lists-grid",
    official_ref: "SIM-12",
    title: "滑動視窗最大總和的邊界漏測反例",
    prompt:
      "右側函式試圖回傳長度為 k 的連續子陣列最大總和，但第 3 行 range 上限少寫了 1（漏掉最後一組視窗）。若固定傳入 k = 2，下列哪一組 arr 輸入能偵測出函式回傳值錯誤？",
    code: `def max_win(arr, k):
    best = sum(arr[:k])
    for i in range(1, len(arr) - k):
        best = max(best, sum(arr[i : i + k]))
    return best`,
    question_type: "debug",
    difficulty: "advanced",
    options: [
      {
        key: "A",
        text: "arr = [9, 8, 1, 2, 3]",
        misconception:
          "最大視窗在最左側 arr[0:2] = [9, 8] (17)，一開始就被 best = sum(arr[:k]) 抓住，無法測出末端漏跑。",
      },
      {
        key: "B",
        text: "arr = [1, 9, 8, 2, 3]",
        misconception:
          "最大視窗在中間 i = 1 的 [9, 8] (17)，range(1, 3) 有跑到 i=1，因此仍回傳正確的 17。",
      },
      {
        key: "C",
        text: "arr = [1, 5, 2, 4, 6]",
        misconception:
          "完全正確！最後兩個元素 [4, 6] 總和 10 為全體最大，但 range(1, 3) 只跑到 i=2 漏掉 i=3，導致誤回傳 7。",
      },
      {
        key: "D",
        text: "arr = [4, 4, 4, 4, 4]",
        misconception:
          "所有視窗總和都是 8，即使漏掉最後一組仍回傳 8。",
      },
    ],
    correct_option: "C",
    explanation:
      "當 len(arr) = 5, k = 2 時，合法的起點索引 i 應包含 0, 1, 2, 3（對應最後一段 arr[3:5]）。\n但 range(1, 5 - 2) = range(1, 3) 只檢查 i = 1, 2，漏掉了最後的 i = 3。\n只有當最後一組視窗 arr[3:5] 嚴格大於前面所有視窗時，錯碼才無法更新出正確答案。對 [1, 5, 2, 4, 6] 而言，前幾組分別為 6, 7, 6，唯有最後一組 4 + 6 = 10 最大，因此錯碼回傳 7 而暴露漏洞。",
    trace_steps: [
      { line: 2, vars: { i: 0, slice: [1, 5], best: 6 }, note: "初始化 best = arr[0]+arr[1] = 6" },
      { line: 4, vars: { i: 1, slice: [5, 2], best: 7 }, note: "i=1 時視窗 [5, 2] = 7，更新 best = 7" },
      { line: 4, vars: { i: 2, slice: [2, 4], best: 7 }, note: "i=2 時視窗 [2, 4] = 6，best 維持 7" },
      {
        line: 5,
        vars: { missed_i: 3, missed_sum: 10, returned: 7 },
        note: "range(1, 3) 結束，漏掉 i=3 的 [4, 6]=10，錯誤回傳 7",
      },
    ],
  },
];
