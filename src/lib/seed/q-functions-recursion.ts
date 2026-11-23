import type { SeedQuestionInput } from "./q-control-flow";

export const SEED_QUESTIONS_FUNCTIONS_RECURSION: SeedQuestionInput[] = [
  {
    topic_slug: "functions-recursion",
    official_ref: "0915-Q1",
    title: "正負號交替的線性遞迴乘積",
    prompt: "給定右側函式 f( )，當執行 f(10) 時，最終回傳結果為何？",
    code: `def f(i):\n    if i > 0:\n        if (i // 2) % 2 == 0:\n            return f(i - 2) * i\n        return f(i - 2) * (-i)\n    else:\n        return 1`,
    question_type: "trace",
    difficulty: "basic",
    options: [
      {
        key: "A",
        text: "1",
        misconception: "只看到最後 else: return 1 而忘記把前面每一層的乘法乘回去。",
      },
      {
        key: "B",
        text: "3840",
        misconception: "算對數值大小 10×8×6×4×2 = 3840，但漏看了奇數層會乘以負號 (-i) 或算錯負號個數。",
      },
      {
        key: "C",
        text: "-3840",
        misconception: "正確解答！乘積為 (-10)*(+8)*(-6)*(+4)*(-2)*1 = -3840。",
      },
      {
        key: "D",
        text: "執行時導致無窮迴圈，不會停止執行",
        misconception: "每次遞迴呼叫都將 i 減 2（10→8→6→4→2→0），0 不大於 0 會進入 else 正常終止。",
      },
    ],
    correct_option: "C",
    explanation:
      "逐層追蹤參數 i 與條件 (i // 2) % 2 == 0：\n• f(10)：10//2 = 5（奇數）→ f(8) * (-10)\n• f(8)：8//2 = 4（偶數）→ f(6) * 8\n• f(6)：6//2 = 3（奇數）→ f(4) * (-6)\n• f(4)：4//2 = 2（偶數）→ f(2) * 4\n• f(2)：2//2 = 1（奇數）→ f(0) * (-2)\n• f(0)：不滿足 i > 0 → 回傳 1\n共有 3 個負號（-10, -6, -2），結果為 -(10×8×6×4×2) = -3840。",
    trace_steps: [
      { line: 5, vars: { i: 10, "i//2": 5 }, stack: ["f(10) -> *(-10)"], note: "5 % 2 != 0，待乘 (-10)" },
      { line: 4, vars: { i: 8, "i//2": 4 }, stack: ["f(10)", "f(8) -> *8"], note: "4 % 2 == 0，待乘 +8" },
      { line: 5, vars: { i: 6, "i//2": 3 }, stack: ["f(10)", "f(8)", "f(6) -> *(-6)"], note: "3 % 2 != 0，待乘 (-6)" },
      { line: 4, vars: { i: 4, "i//2": 2 }, stack: ["f(10)", "f(8)", "f(6)", "f(4) -> *4"], note: "2 % 2 == 0，待乘 +4" },
      { line: 5, vars: { i: 2, "i//2": 1 }, stack: ["f(10)", "f(8)", "f(6)", "f(4)", "f(2) -> *(-2)"], note: "1 % 2 != 0，待乘 (-2)" },
      { line: 7, vars: { i: 0, ret: 1 }, stack: ["f(0) -> 1"], note: "Base Case 回傳 1，依序相乘返回 -3840" },
    ],
  },
  {
    topic_slug: "functions-recursion",
    official_ref: "0915-Q3",
    title: "由多組已知回傳值反推遞迴參數",
    prompt: "給定右側函式 f( )，已知 f(14)、f(10)、f(6) 分別回傳 25、18、10，函式中的 (?) 應為下列何者？",
    code: `def f(n):\n    if n < 2:\n        return n\n    else:\n        return n + f( (?) )`,
    question_type: "fill",
    difficulty: "basic",
    options: [
      {
        key: "A",
        text: "(n+1)//2",
        misconception: "代入 f(6) = 6 + f(3) = 6 + 3 + f(2) = 6 + 3 + 2 + f(1) = 12，與題意 10 不符。",
      },
      {
        key: "B",
        text: "n//2",
        misconception: "正確解答！f(6)=6+3+1=10、f(10)=10+5+2+1=18、f(14)=14+7+3+1=25。",
      },
      {
        key: "C",
        text: "(n-1)//2",
        misconception: "代入 f(6) = 6 + f(2) = 6 + 2 + f(0) = 8，與題意 10 不符。",
      },
      {
        key: "D",
        text: "(n//2)+1",
        misconception: "代入 f(6) = 6 + f(4) = 6 + 4 + f(3) = ... 會遠大於 10（且對 n=2 會無限呼叫 f(2)）。",
      },
    ],
    correct_option: "B",
    explanation:
      "在考場遇到反推題，先挑最小的已知輸入 f(6) = 10 代入各選項最快：\n因為 f(6) = 6 + f(? ) = 10，表示 f(? ) 必須剛好等於 4，而當參數為 3 時：f(3) = 3 + f(3//2) = 3 + f(1) = 3 + 1 = 4！\n檢查 (B) n // 2：\n• f(6) = 6 + f(3) = 6 + 3 + f(1) = 10（合）\n• f(10) = 10 + f(5) = 10 + 5 + f(2) = 15 + 2 + f(1) = 18（合）\n• f(14) = 14 + f(7) = 14 + 7 + f(3) = 21 + 4 = 25（合）",
    trace_steps: [
      { line: 5, vars: { n: 6, "n//2": 3 }, note: "以最小已知輸入 f(6)=10 測試：需 f(?)=4" },
      { line: 5, vars: { n: 3, "n//2": 1 }, note: "選項 (B) 使 f(3) = 3 + f(1)" },
      { line: 3, vars: { n: 1, f3: 4, f6: 10 }, note: "Base Case f(1)=1，故 f(3)=4, f(6)=10 完全吻合" },
    ],
  },
  {
    topic_slug: "functions-recursion",
    official_ref: "0915-Q8",
    title: "相互遞迴的去程回程輸出與呼叫次數",
    prompt: "給定右側函式 f1( ) 及 f2( )。f1(1) 運算過程中，以下敘述何者為錯？",
    code: `def f1(m):\n    if m > 3:\n        print(m)\n        return\n    else:\n        print(m)\n        f2(m + 2)\n        print(m)\n\ndef f2(n):\n    if n > 3:\n        print(n)\n        return\n    else:\n        print(n)\n        f1(n - 1)\n        print(n)`,
    question_type: "static",
    difficulty: "medium",
    options: [
      {
        key: "A",
        text: "印出的數字最大的是 4",
        misconception: "呼叫至 f2(4) 時印出 4 即 return，故最大數字確實為 4（敘述正確）。",
      },
      {
        key: "B",
        text: "f1 一共被呼叫二次",
        misconception: "分別是最初的 f1(1) 與中段的 f1(2)，共 2 次（敘述正確）。",
      },
      {
        key: "C",
        text: "f2 一共被呼叫三次",
        misconception: "正確解答！f2 只被呼叫 2 次（f2(3) 與 f2(4)），故「三次」是錯的敘述。",
      },
      {
        key: "D",
        text: "數字 2 被印出兩次",
        misconception: "f1(2) 走進 else，呼叫 f2(4) 前後各印一次 2（敘述正確）。",
      },
    ],
    correct_option: "C",
    explanation:
      "畫出 f1(1) 的完整呼叫鏈：\n1. f1(1)：1 <= 3 → 印 1 → 呼叫 f2(3)\n2. f2(3)：3 <= 3 → 印 3 → 呼叫 f1(2)\n3. f1(2)：2 <= 3 → 印 2 → 呼叫 f2(4)\n4. f2(4)：4 > 3 → 印 4 → return\n5. 回到 f1(2) 印 2 → 回到 f2(3) 印 3 → 回到 f1(1) 印 1。\n統計呼叫次數：f1 共 2 次（f1(1), f1(2)）；f2 共 2 次（f2(3), f2(4)）。選項 (C) 說 f2 被呼叫三次為錯誤敘述。",
    trace_steps: [
      { line: 6, vars: { func: "f1(1)" }, stack: ["f1(1)"], output: "1", note: "去程：f1(1) 印出 1 後呼叫 f2(3)" },
      { line: 15, vars: { func: "f2(3)" }, stack: ["f1(1)", "f2(3)"], output: "1\n3", note: "去程：f2(3) 印出 3 後呼叫 f1(2)" },
      { line: 6, vars: { func: "f1(2)" }, stack: ["f1(1)", "f2(3)", "f1(2)"], output: "1\n3\n2", note: "去程：f1(2) 印出 2 後呼叫 f2(4)" },
      { line: 12, vars: { func: "f2(4)" }, stack: ["f1(1)", "f2(3)", "f1(2)", "f2(4)"], output: "1\n3\n2\n4", note: "觸底：4 > 3 印出 4 並返回（f2 合計 2 次）" },
      { line: 8, vars: { func: "f1(2)" }, stack: ["f1(1)", "f2(3)", "f1(2)"], output: "1\n3\n2\n4\n2", note: "回程：f1(2) 第二次印出 2" },
      { line: 17, vars: { func: "f2(3)" }, stack: ["f1(1)", "f2(3)"], output: "1\n3\n2\n4\n2\n3", note: "回程：f2(3) 第二次印出 3" },
      { line: 8, vars: { func: "f1(1)" }, stack: ["f1(1)"], output: "1\n3\n2\n4\n2\n3\n1", note: "回程：f1(1) 第二次印出 1 並結束" },
    ],
  },
  {
    topic_slug: "functions-recursion",
    official_ref: "0915-Q11",
    title: "階乘函式的 Base Case 等號陷阱",
    prompt: "右側為一個計算 n 階乘的函式，請問該如何修改才會得到正確的結果？",
    code: `def fun(n):\n    fac = 1\n    if n >= 0:\n        fac = n * fun(n - 1)\n    return fac`,
    question_type: "debug",
    difficulty: "basic",
    options: [
      {
        key: "A",
        text: "第 2 行，改為 fac = n",
        misconception: "當 n=0 時仍會進入 if 計算 0 * fun(-1)，而 fun(-1) 會回傳 -1 且算錯 0!。",
      },
      {
        key: "B",
        text: "第 3 行，改為 if n > 0:",
        misconception: "正確解答！讓 n=0 直接跳過乘法並回傳預設的 fac = 1（0! = 1）。",
      },
      {
        key: "C",
        text: "第 4 行，改為 fac = n * fun(n+1)",
        misconception: "參數往正無窮遞增，會導致無窮遞迴（RecursionError）。",
      },
      {
        key: "D",
        text: "第 4 行，改為 fac = fac * fun(n-1)",
        misconception: "原本的 fac=1，這會只算 1 * 1 * 1... 永遠回傳 1。",
      },
    ],
    correct_option: "B",
    explanation:
      "原程式當輸入 n = 3 時：fun(3) = 3 * fun(2) = 3 * 2 * fun(1) = 3 * 2 * 1 * fun(0)。\n問題出在第 3 行寫了 n >= 0，導致 fun(0) 也會進入第 4 行計算 0 * fun(-1)，把整串乘積全部乘以 0 變成 0！\n只要將第 3 行改為 if n > 0:，當 n = 0 時跳過 if 直接回傳 fac = 1，即可正確算出 0! = 1 與任意正整數階乘。",
    trace_steps: [
      { line: 4, vars: { n: 2 }, stack: ["fun(2) -> 2*fun(1)"], note: "n=2 > 0，等待 fun(1)" },
      { line: 4, vars: { n: 1 }, stack: ["fun(2)", "fun(1) -> 1*fun(0)"], note: "n=1 > 0，等待 fun(0)" },
      { line: 3, vars: { n: 0, "n>=0": true }, stack: ["fun(2)", "fun(1)", "fun(0) -> 0*fun(-1)"], note: "原碼錯誤：n=0 竟也進入 if，乘上 0 毀掉結果！" },
      { line: 5, vars: { n: -1, ret: 1 }, note: "若改第 3 行為 if n > 0:，fun(0) 直接回傳 1，結果正確" },
    ],
  },
  {
    topic_slug: "functions-recursion",
    official_ref: "0915-Q13",
    title: "遞迴加總迴圈 g(4) 追蹤",
    prompt: "右側 g(4) 函式呼叫執行後，回傳值為何？",
    code: `def f(n):\n    if n > 3:\n        return 1\n    elif n == 2:\n        return 3 + f(n + 1)\n    else:\n        return 1 + f(n + 1)\n\ndef g(n):\n    j = 0\n    for i in range(1, n):\n        j = j + f(i)\n    return j`,
    question_type: "trace",
    difficulty: "medium",
    options: [
      {
        key: "A",
        text: "6",
        misconception: "只算了單一的 f(1) = 6，忘記 g(4) 要用迴圈加總 f(1) + f(2) + f(3)。",
      },
      {
        key: "B",
        text: "11",
        misconception: "算錯 f(2) 與 f(3) 的值或少加其中一項。",
      },
      {
        key: "C",
        text: "13",
        misconception: "正確解答！f(3)=2、f(2)=5、f(1)=6，總和 6 + 5 + 2 = 13。",
      },
      {
        key: "D",
        text: "14",
        misconception: "誤把 range(1, 4) 當成包含 4，多加了一個 f(4) = 1，得出 13 + 1 = 14。",
      },
    ],
    correct_option: "C",
    explanation:
      "先由大到小算出 f(4) 到 f(1) 的值（自底向上最不易錯）：\n• f(4) = 1（因 4 > 3）\n• f(3) = 1 + f(4) = 1 + 1 = 2\n• f(2) = 3 + f(3) = 3 + 2 = 5（注意 n == 2 是加 3！）\n• f(1) = 1 + f(2) = 1 + 5 = 6\n接著執行 g(4)：range(1, 4) 包含 i = 1, 2, 3（不含 4），故回傳 f(1) + f(2) + f(3) = 6 + 5 + 2 = 13。",
    trace_steps: [
      { line: 2, vars: { "f(4)": 1 }, note: "先求 Base Case：4 > 3 故 f(4) = 1" },
      { line: 7, vars: { "f(3)": 2 }, note: "f(3) = 1 + f(4) = 2" },
      { line: 5, vars: { "f(2)": 5 }, note: "f(2) 走 elif n == 2：3 + f(3) = 5" },
      { line: 7, vars: { "f(1)": 6 }, note: "f(1) = 1 + f(2) = 6" },
      { line: 12, vars: { i: "1,2,3", j: 13 }, note: "g(4) 加總 f(1)+f(2)+f(3) = 6+5+2 = 13" },
    ],
  },
  {
    topic_slug: "functions-recursion",
    official_ref: "0915-Q14",
    title: "從 Mystery(9) = 34 反推費氏遞迴運算式",
    prompt: "右側 Mystery( ) 函式 else 部分運算式應為何，才能使得 Mystery(9) 的回傳值為 34。",
    code: `def Mystery(x):\n    if x <= 1:\n        return x\n    else:\n        return ______`,
    question_type: "fill",
    difficulty: "basic",
    options: [
      {
        key: "A",
        text: "x + Mystery(x-1)",
        misconception: "這是計算 1+2+...+9 總和，Mystery(9) = 45，不是 34。",
      },
      {
        key: "B",
        text: "x * Mystery(x-1)",
        misconception: "這是計算階乘（且 x=0 回 0 會導致全部為 0）。",
      },
      {
        key: "C",
        text: "Mystery(x-2) + Mystery(x+2)",
        misconception: "包含 Mystery(x+2) 會讓參數往無限大發散，造成無窮遞迴。",
      },
      {
        key: "D",
        text: "Mystery(x-2) + Mystery(x-1)",
        misconception: "正確解答！這正是標準費氏數列，F(9) = 34。",
      },
    ],
    correct_option: "D",
    explanation:
      "根據 Base Case：F(0)=0, F(1)=1。\n代入 (D) Mystery(x-2) + Mystery(x-1) 即為費氏數列：\n0, 1, 1, 2, 3, 5, 8, 13, 21, 34（第 9 項恰好為 34）。\n同時也可直接排除會無限遞增的 (C) 及算出 45 的 (A)。",
    trace_steps: [
      { line: 3, vars: { F0: 0, F1: 1, F2: 1, F3: 2, F4: 3 }, note: "依選項 (D) 自底向上建表至 F(4)=3" },
      { line: 5, vars: { F5: 5, F6: 8, F7: 13, F8: 21, F9: 34 }, note: "F(9) = F(7) + F(8) = 13 + 21 = 34，符合題意！" },
    ],
  },
  {
    topic_slug: "functions-recursion",
    official_ref: "0915-Q16",
    title: "從 F(7) = 12 反推二元遞迴中止條件",
    prompt: "右側函式以 F(7) 呼叫後回傳值為 12，則 <condition> 應為何？",
    code: `def F(a):\n    if <condition>:\n        return 1\n    else:\n        return F(a-2) + F(a-3)`,
    question_type: "fill",
    difficulty: "advanced",
    options: [
      {
        key: "A",
        text: "a < 3",
        misconception: "若 a<3 回傳 1：F(0)=F(1)=F(2)=1 → F(3)=2, F(4)=2, F(5)=3, F(6)=4, F(7)=5。",
      },
      {
        key: "B",
        text: "a < 2",
        misconception: "若 a<2 回傳 1：F(0)=F(1)=1 → F(2)=2, F(3)=2, F(4)=3, F(5)=4, F(6)=5, F(7)=7。",
      },
      {
        key: "C",
        text: "a < 1",
        misconception: "若 a<1 回傳 1：F(0)=1 → F(1)=2, F(2)=2, F(3)=3, F(4)=4, F(5)=5, F(6)=7, F(7)=9。",
      },
      {
        key: "D",
        text: "a < 0",
        misconception: "正確解答！F(0)=2, F(1)=2, F(2)=3, F(3)=4, F(4)=5, F(5)=7, F(6)=9, F(7)=12。",
      },
    ],
    correct_option: "D",
    explanation:
      "二元分支遞迴最佳解法為「自底向上建表」：\n每個選項都讓很小的負數回傳 1。\n測試 (D) a < 0：\n• F(-3) = F(-2) = F(-1) = 1\n• F(0) = F(-2)+F(-3) = 2\n• F(1) = F(-1)+F(-2) = 2\n• F(2) = F(0)+F(-1) = 2+1 = 3\n• F(3) = F(1)+F(0) = 2+2 = 4\n• F(4) = F(2)+F(1) = 3+2 = 5\n• F(5) = F(3)+F(2) = 4+3 = 7\n• F(6) = F(4)+F(3) = 5+4 = 9\n• F(7) = F(5)+F(4) = 7+5 = 12，完全吻合！",
    trace_steps: [
      { line: 2, vars: { "F(-3..-1)": "1, 1, 1", "F(0)": 2, "F(1)": 2 }, note: "若條件為 a < 0，負數皆為 1；F(0)=1+1=2, F(1)=1+1=2" },
      { line: 5, vars: { "F(2)": 3, "F(3)": 4, "F(4)": 5 }, note: "F(2)=F(0)+F(-1)=3, F(3)=4, F(4)=5" },
      { line: 5, vars: { "F(5)": 7, "F(6)": 9, "F(7)": 12 }, note: "F(5)=7, F(6)=9, F(7)=F(5)+F(4)=12！" },
    ],
  },
  {
    topic_slug: "functions-recursion",
    official_ref: "0915-Q21",
    title: "遞迴計算冪次 G(3, 7)",
    prompt: "右側 G( ) 為遞迴函式，G(3, 7) 執行後回傳值為何？",
    code: `def G(a, x):\n    if x == 0:\n        return 1\n    else:\n        return a * G(a, x - 1)`,
    question_type: "trace",
    difficulty: "basic",
    options: [
      {
        key: "A",
        text: "128",
        misconception: "把 a 與 x 寫反了（算成 2 的 7 次方 = 128，但底數是 3）。",
      },
      {
        key: "B",
        text: "2187",
        misconception: "正確解答！G(3, 7) 計算 3 的 7 次方 = 2187。",
      },
      {
        key: "C",
        text: "6561",
        misconception: "多乘了一層，算成 3 的 8 次方 = 6561。",
      },
      {
        key: "D",
        text: "1024",
        misconception: "誤算為 2 的 10 次方（1024）。",
      },
    ],
    correct_option: "B",
    explanation:
      "觀察 G(a, x)：每次 x 減 1 並乘上一個 a，直到 x == 0 回傳 1，等價於計算 a 的 x 次方。\n因此 G(3, 7) = 3^7。\n• 3^4 = 81\n• 3^5 = 243\n• 3^6 = 729\n• 3^7 = 2187（注意個位數循環 3, 9, 7, 1, 3, 9, 7，第 7 個位數必為 7，也可一眼秒選 2187！）。",
    trace_steps: [
      { line: 5, vars: { a: 3, x: 7 }, stack: ["3 * G(3,6)"], note: "展開第 1 層：3 * G(3,6)" },
      { line: 3, vars: { a: 3, x: 0, ret: 1 }, stack: ["...", "G(3,0)=1"], note: "觸底 x=0 回傳 1" },
      { line: 5, vars: { "3^7": 2187 }, note: "逐層乘上 7 個 3，回傳 2187" },
    ],
  },
  {
    topic_slug: "functions-recursion",
    official_ref: "0915-Q23",
    title: "遞迴版輾轉相除法回傳參數填寫",
    prompt: "右側函式兩個回傳式分別該如何撰寫，才能正確計算並回傳兩參數 a, b 之最大公因數 (Greatest Common Divisor)？",
    code: `def GCD(a, b):\n    r = a % b\n    if r == 0:\n        return ____\n    return ____`,
    question_type: "fill",
    difficulty: "basic",
    options: [
      {
        key: "A",
        text: "a, GCD(b, r)",
        misconception: "當 r == 0（表示 a 能被 b 整除）時，最大公因數是較小的除數 b 而非較大的被除數 a。",
      },
      {
        key: "B",
        text: "b, GCD(b, r)",
        misconception: "正確解答！整除時回傳除數 b；否則用 (b, r) 繼續遞迴。",
      },
      {
        key: "C",
        text: "a, GCD(a, r)",
        misconception: "兩格皆錯：整除應回 b，遞迴應傳 (b, r)（傳 (a, r) 沒縮小成原 b）。",
      },
      {
        key: "D",
        text: "b, GCD(a, r)",
        misconception: "第一格 b 正確，但第二格錯寫成 GCD(a, r)，依照歐幾里得定理應為 gcd(a, b) = gcd(b, a % b)。",
      },
    ],
    correct_option: "B",
    explanation:
      "根據歐幾里得輾轉相除法：gcd(a, b) = gcd(b, r)，其中 r = a % b。\n• 若 r == 0，代表 b 整除 a，故 b 即為兩數的最大公因數，第一格填 b。\n• 若 r != 0，下一輪要把除數 b 變成被除數、餘數 r 變成除數，故第二格填 GCD(b, r)。\n實例驗證：GCD(12, 8) → r=4 → GCD(8, 4) → r=0 → 回傳 4。",
    trace_steps: [
      { line: 2, vars: { a: 12, b: 8, r: 4 }, stack: ["GCD(12, 8)"], note: "12 % 8 = 4 != 0，呼叫 GCD(b=8, r=4)" },
      { line: 4, vars: { a: 8, b: 4, r: 0 }, stack: ["GCD(12, 8)", "GCD(8, 4)"], note: "8 % 4 = 0，進入 if r == 0，回傳除數 b = 4" },
    ],
  },
];
