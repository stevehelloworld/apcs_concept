import type { SeedQuestionInput } from "./q-control-flow";

export const SEED_MOCK_QUESTIONS_PART2: SeedQuestionInput[] = [
  // ========================
  // L4: functions-recursion (SIM-13 .. SIM-16)
  // ========================
  {
    topic_slug: "functions-recursion",
    official_ref: "SIM-13",
    title: "函式傳參：原地修改 vs 區域重新綁定",
    prompt: "執行右側包含函式呼叫的程式後，螢幕輸出為何？",
    code: `def tweak(num, arr):
    num += 10
    arr.append(num)
    arr = [99, 100]
    arr.append(1)

x = 5
lst = [1, 2]
tweak(x, lst)
print(x, lst)`,
    question_type: "trace",
    difficulty: "medium",
    options: [
      {
        key: "A",
        text: "15 [99, 100, 1]",
        misconception:
          "誤以為函式參數與外部共用變數綁定，連 num += 10 與 arr = [...] 都會覆蓋外層的 x 與 lst。",
      },
      {
        key: "B",
        text: "5 [1, 2]",
        misconception:
          "誤以為 Python 傳串列參數也採完全複製，忽略 arr.append(num) 會直接改動外層傳入的串列內容。",
      },
      {
        key: "C",
        text: "5 [1, 2, 15]",
        misconception:
          "完全正確！整數不可變且僅在區域重綁不影響 x；arr.append(15) 原地改動了 lst，之後區域重綁 arr = [99, 100] 則不再指向 lst。",
      },
      {
        key: "D",
        text: "5 [99, 100, 1]",
        misconception:
          "忽略了第 4 行 arr = [99, 100] 是對區域變數名稱 arr 重新指定新串列物件，並不會替換外層的 lst。",
      },
    ],
    correct_option: "C",
    explanation:
      "Python 參數傳遞皆為「物件參考傳值」：\n1. num += 10 讓區域變數 num 指向新整數 15，外層 x 依然指向 5。\n2. 第 3 行 arr.append(15) 透過相同串列參考原地新增元素，因此外層 lst 變成 [1, 2, 15]。\n3. 第 4 行 arr = [99, 100] 將區域名稱 arr 切換到新建立的串列，第 5 行的 append(1) 只影響該新串列，與外層 lst 無關。\n4. 最終印出 5 [1, 2, 15]。",
    trace_steps: [
      { line: 2, vars: { num: 15, x: 5 }, note: "num 重新綁定為 15；外層 x 維持 5" },
      { line: 3, vars: { lst: [1, 2, 15] }, note: "arr.append(15) 原地修改同一份串列，lst 成為 [1, 2, 15]" },
      { line: 4, vars: { local_arr: [99, 100], lst: [1, 2, 15] }, note: "arr 重新指派新串列，與外層 lst 切斷關聯" },
      { line: 5, vars: { local_arr: [99, 100, 1], lst: [1, 2, 15] }, note: "append(1) 僅改到局部新串列" },
      { line: 10, vars: { x: 5, lst: [1, 2, 15] }, output: "5 [1, 2, 15]", note: "印出 5 [1, 2, 15]" },
    ],
  },
  {
    topic_slug: "functions-recursion",
    official_ref: "SIM-14",
    title: "遞迴轉二進位的回程輸出順序追蹤",
    prompt: "執行右側遞迴函式 conv(13) 後，螢幕依序印出的字元為何？",
    code: `def conv(n):
    if n > 0:
        conv(n // 2)
        print(n % 2, end="")

conv(13)`,
    question_type: "trace",
    difficulty: "medium",
    options: [
      {
        key: "A",
        text: "1011",
        misconception:
          "若 print 寫在遞迴呼叫之前才會印出倒過來的餘數序列 1011；這題寫在遞迴返回後，會由最深層往前依序印出。",
      },
      {
        key: "B",
        text: "1101",
        misconception:
          "完全正確！先遞迴切半到底層 n=1，再於回程依序印出 1, 1, 0, 1（即 13 的二進位表示）。",
      },
      {
        key: "C",
        text: "01101",
        misconception:
          "誤以為 conv(0) 也會印出一個 0；當 n = 0 時不滿足 if n > 0，會直接返回不印字。",
      },
      {
        key: "D",
        text: "110",
        misconception:
          "忘記最外層 conv(13) 在返回前會執行第 4 行印出最後一碼 1。",
      },
    ],
    correct_option: "B",
    explanation:
      "去程暫停每一層並壓入呼叫堆疊：\n- conv(13) 呼叫 conv(6)，記住待會印 13%2 = 1\n- conv(6) 呼叫 conv(3)，記住待會印 6%2 = 0\n- conv(3) 呼叫 conv(1)，記住待會印 3%2 = 1\n- conv(1) 呼叫 conv(0)，記住待會印 1%2 = 1\nconv(0) 直接返回後，依後進先出依序執行每層的 print：1 → 1 → 0 → 1，得到 1101。",
    trace_steps: [
      { line: 3, vars: { n: 13 }, stack: ["conv(13)"], note: "去程呼叫 conv(6)，暫存餘數 1" },
      { line: 3, vars: { n: 6 }, stack: ["conv(13)", "conv(6)"], note: "去程呼叫 conv(3)，暫存餘數 0" },
      { line: 3, vars: { n: 3 }, stack: ["conv(13)", "conv(6)", "conv(3)", "conv(1)"], note: "一路展開到 conv(1) 再進 conv(0) 返回" },
      { line: 4, vars: { n: 1 }, stack: ["conv(13)", "conv(6)", "conv(3)", "conv(1)"], output: "1", note: "回程最先從 conv(1) 印出 1" },
      { line: 4, vars: { n: 3 }, stack: ["conv(13)", "conv(6)", "conv(3)"], output: "11", note: "回到 conv(3) 印出 1" },
      { line: 4, vars: { n: 6 }, stack: ["conv(13)", "conv(6)"], output: "110", note: "回到 conv(6) 印出 0" },
      { line: 4, vars: { n: 13 }, stack: ["conv(13)"], output: "1101", note: "回到 conv(13) 印出 1，完成 1101" },
    ],
  },
  {
    topic_slug: "functions-recursion",
    official_ref: "SIM-15",
    title: "樹狀遞迴 fib(5) 的總函式呼叫次數計算",
    prompt: "執行右側程式並呼叫 fib(5) 後，螢幕輸出的 v 與 calls 分別為何？",
    code: `calls = 0
def fib(n):
    global calls
    calls += 1
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)

v = fib(5)
print(v, calls)`,
    question_type: "complexity",
    difficulty: "advanced",
    options: [
      {
        key: "A",
        text: "5 8",
        misconception:
          "只數了遞迴樹最底層（n <= 1 的葉節點共 8 次）呼叫，忘記加上內部節點的呼叫次數。",
      },
      {
        key: "B",
        text: "5 15",
        misconception:
          "完全正確！由遞推式 C(n) = C(n-1) + C(n-2) + 1 自底建表可得 C(5) = 15，回傳值為 5。",
      },
      {
        key: "C",
        text: "5 14",
        misconception:
          "算錯其中一層或忘記把最外層最初呼叫 fib(5) 本身算入 1 次（少加 1）。",
      },
      {
        key: "D",
        text: "8 15",
        misconception:
          "calls 算對了 15，但把回傳值 fib(5) 誤算成費氏數列第 6 項 8（fib(0)=0, fib(1)=1, ..., fib(5)=5）。",
      },
    ],
    correct_option: "B",
    explanation:
      "令 C(n) 為呼叫 fib(n) 時總共進入 fib 的次數，則基底 C(0)=1, C(1)=1，且對 n >= 2 有 C(n) = C(n-1) + C(n-2) + 1（加上自己這一次呼叫）：\n- C(2) = 1 + 1 + 1 = 3\n- C(3) = 3 + 1 + 1 = 5\n- C(4) = 5 + 3 + 1 = 9\n- C(5) = 9 + 5 + 1 = 15\n而費氏值 fib(5) = fib(4) + fib(3) = 3 + 2 = 5，故印出 5 15。",
    trace_steps: [
      { line: 5, vars: { "C(0)": 1, "C(1)": 1 }, note: "基底條件 n=0 與 n=1 各消耗 1 次呼叫" },
      { line: 7, vars: { "C(2)": 3, "C(3)": 5 }, note: "C(2)=1+1+1=3，C(3)=3+1+1=5" },
      { line: 7, vars: { "C(4)": 9, "fib(4)": 3 }, note: "C(4)=5+3+1=9，fib(4)=3" },
      { line: 9, vars: { v: 5, calls: 15 }, note: "C(5)=9+5+1=15，fib(5)=3+2=5" },
      { line: 10, vars: { v: 5, calls: 15 }, output: "5 15", note: "印出 5 15" },
    ],
  },
  {
    topic_slug: "functions-recursion",
    official_ref: "SIM-16",
    title: "分治快速冪遞迴函式空白填補",
    prompt:
      "右側 fast_pow(a, n) 以折半遞迴計算 a 的 n 次方（n 為非負整數）。請問第 7 行 (?) 處應填入哪一個運算式才能確保對所有非負整數回傳正確且維持 O(log n) 效率？",
    code: `def fast_pow(a, n):
    if n == 0:
        return 1
    half = fast_pow(a, n // 2)
    if n % 2 == 0:
        return half * half
    return (?)`,
    question_type: "fill",
    difficulty: "advanced",
    options: [
      {
        key: "A",
        text: "half * a",
        misconception:
          "缺少了一次平方！half 只代表 a^(n//2)，奇數時總指數是 2*(n//2)+1，須把 half 平方後再乘一個 a。",
      },
      {
        key: "B",
        text: "half * half * a",
        misconception:
          "完全正確！當 n 為奇數時 a^n = a^(n//2) * a^(n//2) * a = half * half * a。",
      },
      {
        key: "C",
        text: "fast_pow(a, n - 1) * a",
        misconception:
          "這個寫法雖然數值也對，但因為上面已經呼叫過 fast_pow(a, n // 2) 且這行又呼叫一次遞迴，破壞了單分支分治的對數效率與變數 half 的意義。",
      },
      {
        key: "D",
        text: "half * half + a",
        misconception:
          "次方指數相加對應的是底數相乘，多出來的 1 次方應乘以 a 而非加上 a。",
      },
    ],
    correct_option: "B",
    explanation:
      "設法以 n = 5 代入檢驗：\n- n=5 時先取得 half = fast_pow(a, 2) = a^2。\n- 由於 5 = 2 × 2 + 1，目標結果為 a^5 = a^2 × a^2 × a = half * half * a。\n若填 (A) 只會算出 a^3；若填 (C) 則重複遞迴使呼叫樹暴增，應直接沿用算好的 half。",
    trace_steps: [
      { line: 2, vars: { a: 2, n: 0, ret: 1 }, note: "n=0 時回傳 1" },
      { line: 4, vars: { a: 2, n: 2, half: 2 }, note: "計算 fast_pow(2, 2)：取得 half=2 (n=1)，偶數回傳 2*2=4" },
      { line: 7, vars: { a: 2, n: 5, half: 4, ret: 32 }, note: "n=5 (奇數)：half=4，計算 4 * 4 * 2 = 32" },
    ],
  },

  // ========================
  // L5: algorithms-complexity (SIM-17 .. SIM-20)
  // ========================
  {
    topic_slug: "algorithms-complexity",
    official_ref: "SIM-17",
    title: "堆疊後序運算式求值與減法彈出順序",
    prompt: "執行右側利用堆疊 (Stack) 計算後序表示式的程式後，印出的結果為何？",
    code: `tokens = ["12", "3", "5", "+", "-", "2", "*"]
st = []
for t in tokens:
    if t in "+-*":
        b = st.pop()
        a = st.pop()
        if t == "+": st.append(a + b)
        elif t == "-": st.append(a - b)
        else: st.append(a * b)
    else:
        st.append(int(t))
print(st[-1])`,
    question_type: "trace",
    difficulty: "medium",
    options: [
      {
        key: "A",
        text: "-8",
        misconception:
          "把減法的左右運算元順序弄反：較晚 push 進堆疊的才是右運算元 b=8，應計算 a - b = 12 - 8 而非 8 - 12。",
      },
      {
        key: "B",
        text: "8",
        misconception:
          "完全正確！等價於中序運算式 (12 - (3 + 5)) * 2 = 4 * 2 = 8。",
      },
      {
        key: "C",
        text: "28",
        misconception:
          "忘記減法括號優先序，將中序錯讀成 (12 - 3 + 5) * 2 = 28。",
      },
      {
        key: "D",
        text: "4",
        misconception:
          "漏執行最後兩個 token（push 2 與乘號 *）。",
      },
    ],
    correct_option: "B",
    explanation:
      "堆疊具後進先出 (LIFO) 特性：\n1. 依序放入 12, 3, 5 → st = [12, 3, 5]\n2. 遇到 +：彈出 b=5, a=3，推入 3+5=8 → st = [12, 8]\n3. 遇到 -：先彈出者為右運算元 b=8，再彈出左運算元 a=12，計算 12 - 8 = 4 → st = [4]\n4. 放入 2 → st = [4, 2]，遇到 * 計算 4 * 2 = 8。\n最終堆疊剩 [8]，印出 8。",
    trace_steps: [
      { line: 11, vars: { token: "5", st: [12, 3, 5] }, note: "依序推入 12, 3, 5 進堆疊" },
      { line: 7, vars: { token: "+", a: 3, b: 5, st: [12, 8] }, note: "彈出 5 與 3 相加得 8，堆疊變為 [12, 8]" },
      { line: 8, vars: { token: "-", a: 12, b: 8, st: [4] }, note: "b=8, a=12，計算 a - b = 4，推入 4" },
      { line: 11, vars: { token: "2", st: [4, 2] }, note: "推入數字 2" },
      { line: 9, vars: { token: "*", a: 4, b: 2, st: [8] }, note: "彈出 2 與 4 相乘得 8" },
      { line: 12, vars: { top: 8 }, output: "8", note: "輸出結果 8" },
    ],
  },
  {
    topic_slug: "algorithms-complexity",
    official_ref: "SIM-18",
    title: "自訂類別節點鏈結與參考繞過追蹤",
    prompt: "右側以自訂類別 Node 建立單向鏈結串列並進行更新，程式執行後輸出為何？",
    code: `class Node:
    def __init__(self, val, nxt=None):
        self.val = val
        self.next = nxt

a = Node(2, Node(4, Node(6)))
p = a
p.next.val += 5
p.next = p.next.next
s = 0
cur = a
while cur is not None:
    s += cur.val
    cur = cur.next
print(s)`,
    question_type: "trace",
    difficulty: "medium",
    options: [
      {
        key: "A",
        text: "17",
        misconception:
          "算出了中間節點 val 變成 4 + 5 = 9，但忽略第 9 行 p.next = p.next.next 已經把中間節點從鏈結上繞過移除。",
      },
      {
        key: "B",
        text: "8",
        misconception:
          "完全正確！p 與 a 指向同一個頭節點，第 9 行將中間節點移出鏈結後，走訪只剩頭節點 (2) 與尾節點 (6)。",
      },
      {
        key: "C",
        text: "13",
        misconception:
          "誤以為第 8 行改的是尾節點 (6+5=11, 2+11=13)，或以為把 5 累加進總和。",
      },
      {
        key: "D",
        text: "12",
        misconception:
          "忽略中間的所有鏈結修改，直接把最初的 2 + 4 + 6 加總。",
      },
    ],
    correct_option: "B",
    explanation:
      "1. 第 6 行建出鏈結：a(2) → n2(4) → n3(6) → None。\n2. p = a 使 p 與 a 指向同一顆頭節點物件。\n3. 第 8 行將 n2.val 改為 9：a(2) → n2(9) → n3(6)。\n4. 第 9 行 p.next = p.next.next 直接讓頭節點 a 的 next 跨過 n2 改連向 n3(6)，因此鏈結只剩 a(2) → n3(6)。\n5. 走訪累加 2 + 6 = 8。",
    trace_steps: [
      { line: 6, vars: { chain: "2 -> 4 -> 6" }, note: "建立三個串接的 Node 物件" },
      { line: 8, vars: { chain: "2 -> 9 -> 6" }, note: "p.next.val += 5 將第 2 顆節點數值改為 9" },
      { line: 9, vars: { chain: "2 -> 6" }, note: "a.next 直接指向第 3 顆節點 (6)，繞過值為 9 的節點" },
      { line: 13, vars: { s: 2, cur: "Node(6)" }, note: "走訪頭節點累加 2" },
      { line: 13, vars: { s: 8, cur: "None" }, note: "走訪尾節點累加 6，cur 變 None" },
      { line: 15, vars: { s: 8 }, output: "8", note: "印出走訪總和 8" },
    ],
  },
  {
    topic_slug: "algorithms-complexity",
    official_ref: "SIM-19",
    title: "插入排序執行指定輪數後的陣列中間態",
    prompt:
      "右側函式實作插入排序，注意第 2 行 range(1, 4) 只執行 i = 1, 2, 3 共三輪即停。執行後螢幕會印出什麼？",
    code: `arr = [29, 10, 14, 37, 13]
for i in range(1, 4):
    key = arr[i]
    j = i - 1
    while j >= 0 and arr[j] > key:
        arr[j + 1] = arr[j]
        j -= 1
    arr[j + 1] = key
print(arr)`,
    question_type: "trace",
    difficulty: "medium",
    options: [
      {
        key: "A",
        text: "[10, 14, 29, 37, 13]",
        misconception:
          "完全正確！前 4 個元素 (index 0..3) 完成排序，最後的 13 (index 4) 因 range 上限為 4（不含 4）而尚未插入。",
      },
      {
        key: "B",
        text: "[10, 13, 14, 29, 37]",
        misconception:
          "多跑了一輪！range(1, 4) 只會跑 i = 1, 2, 3，不會執行到處理 13 的 i = 4。",
      },
      {
        key: "C",
        text: "[10, 14, 29, 13, 37]",
        misconception:
          "誤把演算法當成氣泡排序（把最大值 37 換到最尾端），忽略插入排序只會左移已排序區間。",
      },
      {
        key: "D",
        text: "[10, 13, 14, 37, 29]",
        misconception:
          "誤以為演算法在進行選擇排序，把 13 直接交換到前面來。",
      },
    ],
    correct_option: "A",
    explanation:
      "插入排序的迴圈不變式為「第 i 輪結束時，前 i+1 個元素 arr[0..i] 會是有序的」：\n- i=1 (key=10): [10, 29, 14, 37, 13]\n- i=2 (key=14): [10, 14, 29, 37, 13]\n- i=3 (key=37): 37 > 29 不移動 → [10, 14, 29, 37, 13]\n因為 range(1, 4) 不含 4，index 4 的 13 還沒輪到，輸出 [10, 14, 29, 37, 13]。",
    trace_steps: [
      { line: 8, vars: { i: 1, key: 10, arr: [10, 29, 14, 37, 13] }, note: "i=1 將 10 插入最前，前兩項有序" },
      { line: 8, vars: { i: 2, key: 14, arr: [10, 14, 29, 37, 13] }, note: "i=2 將 14 插入 10 與 29 之間" },
      { line: 8, vars: { i: 3, key: 37, arr: [10, 14, 29, 37, 13] }, note: "i=3 時 29 <= 37 不需搬移" },
      { line: 9, vars: { arr: [10, 14, 29, 37, 13] }, output: "[10, 14, 29, 37, 13]", note: "range(1, 4) 結束，13 尚未處理" },
    ],
  },
  {
    topic_slug: "algorithms-complexity",
    official_ref: "SIM-20",
    title: "二分搜尋左閉右閉取整造成無窮迴圈的反例",
    prompt:
      "右側 last_le(arr, x) 試圖在遞增陣列中尋找「小於等於 x 的最大索引」，但因中點取整與邊界更新搭配錯誤，部分測試會陷入無窮迴圈（Infinite Loop）。下列哪組測試呼叫會導致無窮迴圈？",
    code: `def last_le(arr, x):
    lo, hi = 0, len(arr) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if arr[mid] <= x:
            lo = mid
        else:
            hi = mid - 1
    return lo`,
    question_type: "counterexample",
    difficulty: "advanced",
    options: [
      {
        key: "A",
        text: "last_le([2, 8], 1)",
        misconception:
          "當 x = 1 時 arr[0] <= 1 為 False，會走 else 分支使 hi = -1，立刻打破 lo < hi 並終止。",
      },
      {
        key: "B",
        text: "last_le([5], 5)",
        misconception:
          "陣列長度為 1 時 lo == hi == 0，連 while 迴圈都沒進入就直接回傳 0。",
      },
      {
        key: "C",
        text: "last_le([2, 8], 5)",
        misconception:
          "完全正確！當區間縮到 lo=0, hi=1 時，mid 向下取整恆為 0 且 arr[0] <= 5 為真，執行 lo = mid 後區間卡死在 [0, 1]。",
      },
      {
        key: "D",
        text: "last_le([1, 3, 5, 7], 2)",
        misconception:
          "第 1 輪 mid=1 (arr[1]=3 > 2) 會進 else 使 hi 縮成 0，立刻滿足 lo == hi 跳出。",
      },
    ],
    correct_option: "C",
    explanation:
      "在寫法 lo = mid 搭配 while lo < hi 時，若區間長度為 2（例如 lo = 0, hi = 1）：\n- (lo + hi) // 2 向下取整永遠等於 lo (= 0)。\n- 只要 arr[lo] <= x 成立，執行 lo = mid 會令 lo 保持 0、hi 保持 1，搜尋區間大小完全沒有縮小，形成無窮迴圈！\n（正確修法為改用向上取整 mid = (lo + hi + 1) // 2）。",
    trace_steps: [
      { line: 2, vars: { lo: 0, hi: 1, x: 5 }, note: "初始區間 [0, 1] 符合 lo < hi，進入迴圈" },
      { line: 4, vars: { lo: 0, hi: 1, mid: 0 }, note: "(0 + 1) // 2 向下取整算出 mid = 0" },
      { line: 6, vars: { "arr[0]": 2, next_lo: 0, next_hi: 1 }, note: "2 <= 5 成立，lo = mid = 0；區間仍為 [0, 1] 無限重複" },
    ],
  },
];
