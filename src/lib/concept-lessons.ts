import type { TraceStep } from "./types";

export interface ConceptPredictOption {
  label: string;
  isCorrect: boolean;
  why: string;
}

export interface ConceptLesson {
  id: string;
  syllabusTag: string;
  title: string;
  mentalModel: [string, string, string];
  code: string;
  rule: string;
  predictQuestion: string;
  predictOptions: ConceptPredictOption[];
  steps: TraceStep[];
}

export const TOPIC_SYLLABUS_TAGS: Record<string, string[]> = {
  "control-flow": ["資料型態", "常數變數", "指定表達式", "選擇控制結構"],
  "loops-range": ["重複控制結構", "range 邊界", "迴圈流程", "執行次數分析"],
  "lists-grid": ["陣列與串列", "參考與切片", "二維索引"],
  "functions-recursion": ["函式與模組化", "區域作用域", "遞迴結構", "呼叫堆疊"],
  "algorithms-complexity": ["堆疊與佇列", "自訂資料型態", "排序與搜尋", "效能分析"],
};

export const CONCEPT_LESSONS_BY_TOPIC: Record<string, ConceptLesson[]> = {
  "control-flow": [
    {
      id: "cf-floor-shortcircuit",
      syllabusTag: "資料型態・表達式",
      title: "負數 // 與 % ＋ 邏輯短路",
      mentalModel: ["// 向負無窮取整", "a = q*b + r 餘數與除數同號", "and 左偽 / or 左真即跳過右側"],
      code: `calls = 0
def bump():
    global calls
    calls += 1
    return True
q = -7 // 3
r = -7 % 3
x = (q + r > 0) and bump()
y = (r == 2) or bump()
print(q, r, calls)`,
      rule: "Python 的 // 永遠往更小的整數取（-7 // 3 = -3），且短路時右邊函式不會被呼叫。",
      predictQuestion: "執行後印出的 q, r, calls 為何？",
      predictOptions: [
        { label: "-2 -1 2", isCorrect: false, why: "-2 是 C 語言向零截斷結果，且忽略短路跳過。" },
        { label: "-3 2 0", isCorrect: true, why: "-3 * 3 + 2 = -7，且 and 左偽、or 左真雙雙短路，calls = 0。" },
        { label: "-3 2 1", isCorrect: false, why: "第 8、9 行皆已確定結果，bump() 一次都沒執行。" },
      ],
      steps: [
        { line: 6, vars: { q: -3, calls: 0 }, note: "-7 / 3 = -2.33 往負無窮取整為 -3" },
        { line: 7, vars: { q: -3, r: 2, calls: 0 }, note: "餘數滿足 -3*3 + 2 = -7，故 r = 2" },
        { line: 8, vars: { x: false, calls: 0 }, note: "q + r = -1 > 0 為 False，and 短路跳過 bump()" },
        { line: 9, vars: { y: true, calls: 0 }, note: "r == 2 為 True，or 短路跳過 bump()" },
        { line: 10, vars: { q: -3, r: 2, calls: 0 }, output: "-3 2 0", note: "印出 -3 2 0" },
      ],
    },
    {
      id: "cf-precedence",
      syllabusTag: "表達式・笛摩根",
      title: "優先序 (not > and > or) 與否定展開",
      mentalModel: ["and 比 or 先綁定", "not 進入括號內", "or ↔ and 互換並反轉不等號"],
      code: `age, score, vip = 15, 85, False
cond1 = not (age < 12 or score >= 80 and not vip)
cond2 = age >= 12 and (score < 80 or vip)
print(cond1 == cond2)`,
      rule: "not > and > or；看到沒有括號的 a or b and c，一律先括住 (b and c) 再展開 not。",
      predictQuestion: "age=15, score=85, vip=False 時，cond1 的結果為何？",
      predictOptions: [
        { label: "True", isCorrect: false, why: "score >= 80 且 not vip 為 True，故括號內為 True，取 not 後得 False。" },
        { label: "False", isCorrect: true, why: "85 >= 80 and True 為 True，經 or 仍為 True，最後 not 翻轉為 False。" },
      ],
      steps: [
        { line: 1, vars: { age: 15, score: 85, vip: false }, note: "設定測試值" },
        { line: 2, vars: { right_and: true, inner_or: true, cond1: false }, note: "先算 score>=80 and not vip (=True)，整體 or 為 True，取 not 得 False" },
        { line: 3, vars: { cond2: false }, note: "15>=12 (True) and (False or False) = False，與 cond1 完全等價" },
        { line: 4, vars: { equal: true }, output: "True", note: "對所有輸入均恆為 True" },
      ],
    },
    {
      id: "cf-elif-shadow",
      syllabusTag: "選擇控制結構",
      title: "獨立 if vs elif 互斥與區間遮蔽",
      mentalModel: ["兩個 if：各自獨立評估", "if-elif：命中上方即跳過下方", "寬條件寫上方會吃掉窄區間"],
      code: `def pay(p):
    if p >= 1000:
        p -= 400
    if p >= 700:
        p -= 100
    return p
print(pay(1050), pay(1100))`,
      rule: "互斥折扣要用 elif；改為獨立 if 時，前段扣款後的數值會直接影響下一道門檻！",
      predictQuestion: "p = 1050 與 p = 1100 分別扣完後，哪一個付得比較少？",
      predictOptions: [
        { label: "pay(1050) = 650 較少", isCorrect: false, why: "1050 減 400 為 650 (<700)，沒觸發第二刀；1100 減 400 剩 700 會再被砍 100！" },
        { label: "pay(1100) = 600 反而較少", isCorrect: true, why: "1100 >= 1000 減 400 變 700，剛好再觸發 if p >= 700 變 600。" },
      ],
      steps: [
        { line: 2, vars: { p: 1050 }, note: "測試 1050：進入 p >= 1000" },
        { line: 4, vars: { p: 650 }, note: "650 < 700，跳過第二個 if，回傳 650" },
        { line: 2, vars: { p: 1100 }, note: "測試 1100：進入 p >= 1000 減為 700" },
        { line: 5, vars: { p: 600 }, note: "700 >= 700 再減 100 變成 600" },
        { line: 7, vars: { out: "650 600" }, output: "650 600", note: "印出 650 600" },
      ],
    },
  ],

  "loops-range": [
    {
      id: "lr-range-bound",
      syllabusTag: "重複控制結構",
      title: "range 左閉右開與負步長次數公式",
      mentalModel: ["含 start、永遠不含 stop", "正步長：x < stop 才繼續", "負步長：x > stop 且 step < 0"],
      code: `a = list(range(0, 100, 5))
b = list(range(5, 100, 5))
c = list(range(6, 0, -1))
print(len(a), len(b), c[0], c[-1])`,
      rule: "寫出頭尾兩項就能秒抓差 1 錯誤：range(start, stop, step) 永遠停在抵達 stop 之前。",
      predictQuestion: "len(a) 與 len(b) 差了幾個元素？",
      predictOptions: [
        { label: "a 有 20 個、b 有 19 個（差 1）", isCorrect: true, why: "a 從 0..95 共 20 個；b 少了 0 也少了 100 只剩 19 個。" },
        { label: "兩者都是 20 個", isCorrect: false, why: "b = range(5, 100, 5) 停在 95，比 0..95 少了起點 0。" },
      ],
      steps: [
        { line: 1, vars: { "a[0]": 0, "a[-1]": 95, "len(a)": 20 }, note: "0 到 95 每隔 5 共 20 個" },
        { line: 2, vars: { "b[0]": 5, "b[-1]": 95, "len(b)": 19 }, note: "從 5 到 95 只剩 19 個" },
        { line: 3, vars: { c: [6, 5, 4, 3, 2, 1] }, note: "負步長停在 stop=0 之前的 1" },
        { line: 4, vars: { out: "20 19 6 1" }, output: "20 19 6 1", note: "輸出 20 19 6 1" },
      ],
    },
    {
      id: "lr-for-else",
      syllabusTag: "迴圈流程控制",
      title: "continue、break 與 for...else 規則",
      mentalModel: ["continue：直接進下一輪", "break：立刻中止整條迴圈", "else：沒遇過 break 才執行"],
      code: `s = 0
for x in range(1, 6):
    if x % 2 == 0:
        continue
    s += x
    if s >= 4:
        break
else:
    s += 100
print(s)`,
      rule: "Python 的 for...else 不是「迴圈沒跑才進」，而是「正常跑完沒觸發 break 才進」。",
      predictQuestion: "這段程式最終會印出 4 還是 104？",
      predictOptions: [
        { label: "4", isCorrect: true, why: "x=1 (s=1), x=3 (s=4 >= 4) 觸發 break，跳過 else。" },
        { label: "104", isCorrect: false, why: "由於觸發了第 7 行的 break，第 8 行的 else 不會執行。" },
      ],
      steps: [
        { line: 5, vars: { x: 1, s: 1 }, note: "x=1 奇數累加 s = 1" },
        { line: 4, vars: { x: 2, s: 1 }, note: "x=2 偶數觸發 continue 跳過" },
        { line: 5, vars: { x: 3, s: 4 }, note: "x=3 累加得 s = 4 (>= 4)" },
        { line: 7, vars: { s: 4 }, note: "執行 break 跳出迴圈並略過 else" },
        { line: 10, vars: { s: 4 }, output: "4", note: "印出 4" },
      ],
    },
    {
      id: "lr-digit-while",
      syllabusTag: "重複・效能分析",
      title: "while 整數拆位與內層起點變動次數",
      mentalModel: ["n % 10 取最右個位", "n //= 10 消去個位", "隨外層 i 變動時應分段計數"],
      code: `n, out = 2594, []
while n > 0:
    out.append(n % 10)
    n //= 10
print(out)`,
      rule: "% 10 與 //= 10 是「由右向左」取出數字，與從左向右讀字串順序相反。",
      predictQuestion: "out 的內容順序為何？",
      predictOptions: [
        { label: "[2, 5, 9, 4]", isCorrect: false, why: "2594 % 10 第一輪拿到的最右邊的 4。" },
        { label: "[4, 9, 5, 2]", isCorrect: true, why: "每次先取個位數，依序放入 4 → 9 → 5 → 2。" },
      ],
      steps: [
        { line: 3, vars: { n: 2594, digit: 4, out: [4] }, note: "第 1 輪取個位 4" },
        { line: 3, vars: { n: 259, digit: 9, out: [4, 9] }, note: "第 2 輪取 9" },
        { line: 3, vars: { n: 25, digit: 5, out: [4, 9, 5] }, note: "第 3 輪取 5" },
        { line: 3, vars: { n: 2, digit: 2, out: [4, 9, 5, 2] }, note: "第 4 輪取 2，隨後 n 變 0 停機" },
        { line: 5, vars: { out: [4, 9, 5, 2] }, output: "[4, 9, 5, 2]", note: "印出 [4, 9, 5, 2]" },
      ],
    },
  ],

  "lists-grid": [
    {
      id: "lg-alias-trap",
      syllabusTag: "串列與參考別名",
      title: "[[0]*3]*3 淺拷貝別名 vs 重新賦值",
      mentalModel: ["[row] * 3 複製的是參考", "改 element g[0][1] 連坐三列", "改整列 g[1] = [...] 才脫離"],
      code: `g = [[0] * 3] * 3
g[0][1] = 5
g[2][1] += 3
g[1] = [1, 2, 3]
print(g[0][1], g[1][1], g[2][1])`,
      rule: "建立獨立二維陣列一定要用 [[0]*c for _ in range(r)]，不能用乘號複製內層串列！",
      predictQuestion: "第 4 行執行後，g[0][1] 與 g[1][1] 分別是多少？",
      predictOptions: [
        { label: "8 與 2", isCorrect: true, why: "g[0] 與 g[2] 仍共用同一列（值 8），g[1] 已重綁成獨立串列 [1,2,3]。" },
        { label: "5 與 2", isCorrect: false, why: "第 3 行透過 g[2][1] += 3 也加進了 g[0] 所共用的串列中。" },
        { label: "2 與 2", isCorrect: false, why: "g[1] = [1, 2, 3] 只改變 g[1] 參考位置，不會覆寫原本的共享串列。" },
      ],
      steps: [
        { line: 1, vars: { g: "3 pointers -> same [0,0,0]" }, note: "[[0]*3]*3 使三列指向同一份串列物件" },
        { line: 2, vars: { shared: [0, 5, 0] }, note: "g[0][1]=5 同時改到 g[0], g[1], g[2]" },
        { line: 3, vars: { shared: [0, 8, 0] }, note: "g[2][1]+=3 再把共用位置加為 8" },
        { line: 4, vars: { "g[0]": [0, 8, 0], "g[1]": [1, 2, 3], "g[2]": [0, 8, 0] }, note: "g[1] 切換指向全新串列 [1, 2, 3]" },
        { line: 5, vars: { out: "8 2 8" }, output: "8 2 8", note: "印出 8 2 8" },
      ],
    },
    {
      id: "lg-neg-slice",
      syllabusTag: "陣列與切片",
      title: "負索引切片產生獨立複本",
      mentalModel: ["切片一律回傳新串列", "a[-2] 指向倒數第 2 個", "stop=0 時不含索引 0"],
      code: `a = [10, 20, 30, 40, 50, 60, 70]
b = a[-2:0:-2]
b[0] = 99
print(a[-2], b)`,
      rule: "對切片 b 的元素進行修改，絕對不會影響原本的串列 a（整數等不可變元素彼此完全獨立）。",
      predictQuestion: "最後印出的 a[-2] 是 99 還是 60？",
      predictOptions: [
        { label: "60，且 b = [99, 40, 20]", isCorrect: true, why: "切片取出索引 5, 3, 1 成獨立複本 [60, 40, 20]，改 b[0] 不影響 a。" },
        { label: "99，且 b = [99, 40, 20]", isCorrect: false, why: "切片會複製一份新串列，不會像直接 b = a 一樣共用別名。" },
      ],
      steps: [
        { line: 2, vars: { idxs: "5, 3, 1", b: [60, 40, 20] }, note: "從倒數第 2 格 (idx 5) 每次 -2 停在 idx 0 之前" },
        { line: 3, vars: { b: [99, 40, 20], "a[5]": 60 }, note: "修改複本 b[0]=99，原陣列 a 不動" },
        { line: 4, vars: { out: "60 [99, 40, 20]" }, output: "60 [99, 40, 20]", note: "輸出 60 [99, 40, 20]" },
      ],
    },
    {
      id: "lg-matrix-prefix",
      syllabusTag: "二維陣列・前綴和",
      title: "順時針 90° 映射與區間和邊界",
      mentalModel: ["順時針：(r, c) → (c, n-1-r)", "前綴和：a[R] - a[L]", "扣除包含 b[1..L]，保留 L+1..R"],
      code: `mat = [[1, 2], [3, 4]]
res = [[0]*2 for _ in range(2)]
for r in range(2):
    for c in range(2):
        res[c][1 - r] = mat[r][c]
print(res)`,
      rule: "考場忘記旋轉公式時，直接代左上 (0,0) → 右上 (0, n-1) 檢查座標對不對最快。",
      predictQuestion: "2×2 矩陣 [[1, 2], [3, 4]] 順時針轉 90° 後第一列為何？",
      predictOptions: [
        { label: "[3, 1]", isCorrect: true, why: "原本左側直欄 [3, 1]（由下而上）翻上來變成最上方第一列。" },
        { label: "[2, 4]", isCorrect: false, why: "[2, 4] 是「逆時針」旋轉 90° 後的第一列。" },
      ],
      steps: [
        { line: 5, vars: { r: 0, c: 0, target: "res[0][1]=1" }, note: "(0,0) 的 1 移至右上 (0,1)" },
        { line: 5, vars: { r: 1, c: 0, target: "res[0][0]=3" }, note: "(1,0) 的 3 移至左上 (0,0)" },
        { line: 6, vars: { res: "[[3, 1], [4, 2]]" }, output: "[[3, 1], [4, 2]]", note: "完成順時針旋轉 90°" },
      ],
    },
  ],

  "functions-recursion": [
    {
      id: "fr-scope-mut",
      syllabusTag: "函式與模組化",
      title: "參數傳遞：不可變重綁 vs 可變原地修改",
      mentalModel: ["區域重賦值 (=) 換新對象", "呼叫方法 (.append) 改同物件", "兩者混用只影響切換前"],
      code: `def f(num, arr):
    num += 10
    arr.append(num)
    arr = [99]
    arr.append(0)
x, lst = 5, [1]
f(x, lst)
print(x, lst)`,
      rule: "看到參數名稱被「=」重新指派新東西（如 arr = [99]），那一刻起它就與外層變數脫鉤。",
      predictQuestion: "呼叫 f(x, lst) 結束後，外層的 lst 會是什麼？",
      predictOptions: [
        { label: "[1, 15]", isCorrect: true, why: "第 3 行的 append(15) 先改了外層物件；第 4 行的 = [99] 只改區域參數指向。" },
        { label: "[99, 0]", isCorrect: false, why: "函式內重新指定 arr = [99] 不會覆寫外部的 lst。" },
      ],
      steps: [
        { line: 2, vars: { num: 15, x: 5 }, note: "num 指向新整數 15，外層 x 仍是 5" },
        { line: 3, vars: { lst: [1, 15] }, note: "第 3 行透過共同參考原地加 15" },
        { line: 4, vars: { local_arr: [99, 0], lst: [1, 15] }, note: "第 4-5 行只改動區域名稱指向的新串列" },
        { line: 8, vars: { x: 5, lst: [1, 15] }, output: "5 [1, 15]", note: "印出 5 [1, 15]" },
      ],
    },
    {
      id: "fr-call-stack",
      syllabusTag: "呼叫堆疊・遞迴",
      title: "去程執行 vs 回程折返（轉二進位實例）",
      mentalModel: ["呼叫前：由淺到深去程執行", "呼叫後：暫停等待子層返回", "觸底回傳後：LIFO 逆序執行"],
      code: `def conv(n):
    if n > 0:
        conv(n // 2)
        print(n % 2, end="")
conv(13)`,
      rule: "印出或乘算放在「遞迴呼叫之後」，就會先深入到底再從最深層一層一層吐回來。",
      predictQuestion: "conv(13) 的輸出為何？（13//2 餘 1、6//2 餘 0、3//2 餘 1、1//2 餘 1）",
      predictOptions: [
        { label: "1101", isCorrect: true, why: "print 在遞迴之後，最深層 conv(1) 的 1 最先印出，倒推為 1101。" },
        { label: "1011", isCorrect: false, why: "若把 print 寫在 conv(n // 2) 之前才會印出由低位到高位的 1011。" },
      ],
      steps: [
        { line: 3, vars: { n: 13 }, stack: ["conv(13)"], note: "去程壓入 conv(13)，先去呼叫 conv(6)" },
        { line: 3, vars: { n: 6 }, stack: ["conv(13)", "conv(6)", "conv(3)", "conv(1)"], note: "壓疊到底層 conv(1) 再呼叫 conv(0)" },
        { line: 4, vars: { n: 1 }, stack: ["conv(13)", "conv(6)", "conv(3)", "conv(1)"], output: "1", note: "conv(0) 直接返回，conv(1) 最先印出 1" },
        { line: 4, vars: { n: 13 }, stack: ["conv(13)"], output: "1101", note: "依序退回印出 1 → 1 → 0 → 1，完成 1101" },
      ],
    },
    {
      id: "fr-base-case",
      syllabusTag: "遞迴基底條件",
      title: "單位元素錯置造成全盤歸零（Q11 模型）",
      mentalModel: ["檢查最後一層呼叫是否進分支", "乘法單位元素為 1、加法為 0", "不會無窮遞迴，但可能乘上 0"],
      code: `def fun(n):
    fac = 1
    if n >= 0:
        fac = n * fun(n - 1)
    return fac
print(fun(4))`,
      rule: "看懂停機邊界：n=-1 不滿足 n>=0 故不會無窮遞迴，但多算的 fun(0) 把全部乘積變成 0。",
      predictQuestion: "fun(4) 會陷入無窮迴圈，還是算出特定整數？",
      predictOptions: [
        { label: "回傳 0（不會無窮迴圈）", isCorrect: true, why: "fun(0) 進入 if 後算出 0 * fun(-1) = 0，外層整串連乘跟著歸零。" },
        { label: "回傳 24", isCorrect: false, why: "要將條件寫成 n > 0 讓 fun(0) 直接回傳 1，才會得到 24。" },
      ],
      steps: [
        { line: 4, vars: { chain: "4 * fun(3) * ... * fun(0)" }, note: "n=4..1 逐層展開往下乘法" },
        { line: 3, vars: { n: 0 }, note: "關鍵錯誤：n=0 仍滿足 n >= 0 進入分支！" },
        { line: 5, vars: { "fun(-1)": 1, "fun(0)": 0 }, note: "fun(-1) 回傳 1 停止，但 fun(0)=0*1=0" },
        { line: 6, vars: { "fun(4)": 0 }, output: "0", note: "整串乘以 0 後輸出 0" },
      ],
    },
    {
      id: "fr-tree-table",
      syllabusTag: "遞迴・複雜度",
      title: "樹狀遞迴填表：區分回傳值 vs 呼叫次數",
      mentalModel: ["回傳值 F(n) = F(n-1) + F(n-2)", "呼叫次數多一個 + 1（自己）", "由 n=0 往上畫小表最精準"],
      code: `calls = 0
def fib(n):
    global calls
    calls += 1
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)
print(fib(5), calls)`,
      rule: "問「執行次數 / 呼叫幾次」時，遞推公式記得在兩個子樹後面加上「+ 1（目前這一層）」。",
      predictQuestion: "呼叫 fib(5) 時，總共進入 fib() 函式幾次？",
      predictOptions: [
        { label: "5 次", isCorrect: false, why: "5 是 fib(5) 的回傳數值，並非進入函式的次數。" },
        { label: "15 次", isCorrect: true, why: "C(0)=1, C(1)=1, C(2)=3, C(3)=5, C(4)=9, C(5)=15。" },
      ],
      steps: [
        { line: 5, vars: { "C(0)": 1, "C(1)": 1 }, note: "葉節點基底各計 1 次" },
        { line: 7, vars: { "C(2)": 3, "C(3)": 5, "C(4)": 9 }, note: "套用 C(n) = C(n-1) + C(n-2) + 1 向上累計" },
        { line: 8, vars: { "fib(5)": 5, calls: 15 }, output: "5 15", note: "總計呼叫 15 次、回傳 5" },
      ],
    },
  ],

  "algorithms-complexity": [
    {
      id: "ac-stack-rpn",
      syllabusTag: "基礎資料結構・堆疊",
      title: "堆疊 (LIFO) 後序求值的彈出順序",
      mentalModel: ["遇到數字：push 進堆疊", "遇到運算子：先彈右運算元 b", "減與除算 a - b，不可寫反"],
      code: `st = []
for t in ["12", "3", "5", "+", "-"]:
    if t in "+-":
        b, a = st.pop(), st.pop()
        st.append(a + b if t == "+" else a - b)
    else:
        st.append(int(t))
print(st[-1])`,
      rule: "a 比 b 早進入堆疊，所以執行兩次 pop() 時，第一次出來的是右運算元 b，第二次才是左運算元 a！",
      predictQuestion: "處理到 '-' 後，堆疊頂端是什麼數字？",
      predictOptions: [
        { label: "4", isCorrect: true, why: "3+5=8 推入後 st=[12, 8]；pop 出 b=8, a=12，計算 12 - 8 = 4。" },
        { label: "-4", isCorrect: false, why: "這是把兩次 pop() 順序弄反寫成 8 - 12 才會得到的誤算。" },
      ],
      steps: [
        { line: 7, vars: { t: "5", st: [12, 3, 5] }, note: "數字依序入疊：[12, 3, 5]" },
        { line: 5, vars: { t: "+", a: 3, b: 5, st: [12, 8] }, note: "3+5=8，堆疊剩下 [12, 8]" },
        { line: 4, vars: { t: "-", b: 8, a: 12 }, note: "先彈出 b=8，再彈出 a=12" },
        { line: 8, vars: { st: [4] }, output: "4", note: "算 a - b = 4，印出 4" },
      ],
    },
    {
      id: "ac-queue-fifo",
      syllabusTag: "基礎資料結構・佇列",
      title: "佇列 (FIFO) 雙指標與跨輪狀態",
      mentalModel: ["head 讀前端、tail 寫尾端", "未過條件則放回隊尾", "跨輪計數器沒重設會接續數"],
      code: `q = [1, 2, 3, 4]
head, cnt = 0, 0
while len(q) - head > 1:
    x = q[head]; head += 1; cnt += 1
    if cnt == 2:
        cnt = 0; q.append(x)
print(q[head])`,
      rule: "模擬佇列時，把放回隊尾的元素接在陣列後方寫出來，同時盯緊每輪結束時計數器 cnt 是否歸零。",
      predictQuestion: "每第 2 個元素留存重排，[1, 2, 3, 4] 最後留下的數字為何？",
      predictOptions: [
        { label: "4", isCorrect: true, why: "第一輪留 [2, 4]（cnt=0）；第二輪丟 2 留 4，最後只剩 [4]。" },
        { label: "2", isCorrect: false, why: "cnt=1 丟掉 2 後，讀到 4 時 cnt=2 會把 4 放回隊尾並結束。" },
      ],
      steps: [
        { line: 4, vars: { round: 1, cnt: 0, q: [1, 2, 3, 4, 2, 4], head: 4 }, note: "第 1 輪保留 2, 4，此時 head 指向 2、cnt=0" },
        { line: 4, vars: { round: 2, drop: 2, cnt: 1 }, note: "讀出 2 時 cnt=1，被丟棄" },
        { line: 6, vars: { round: 2, keep: 4, head: 6, cnt: 0 }, note: "讀出 4 時 cnt=2，放回 4 後只剩單元素停機" },
        { line: 7, vars: { ans: 4 }, output: "4", note: "印出 4" },
      ],
    },
    {
      id: "ac-user-type",
      syllabusTag: "自訂資料型態",
      title: "物件參考修改與指標繞過節點",
      mentalModel: ["p = a 共用同一顆頭物件", "p.next.val 改的是第 2 顆內容", "p.next = p.next.next 斷開第 2 顆"],
      code: `class Node:
    def __init__(self, v, nxt=None):
        self.v, self.next = v, nxt
a = Node(2, Node(4, Node(6)))
a.next.v += 5
a.next = a.next.next
print(a.v + a.next.v)`,
      rule: "看到鏈結節點改指標（.next = ...），先畫出物件箭頭圖，才不會把已踢出鏈結的舊數值加進去。",
      predictQuestion: "最後印出的 a.v + a.next.v 是多少？",
      predictOptions: [
        { label: "8", isCorrect: true, why: "第 6 行將中間節點 (9) 跳過，a.next 直接指向 Node(6)，2 + 6 = 8。" },
        { label: "11", isCorrect: false, why: "中間節點變成 9 但隨即被移除；尾節點一直是 6，並沒有變成 9。" },
      ],
      steps: [
        { line: 4, vars: { chain: "2 -> 4 -> 6" }, note: "建出 3 顆鏈結節點" },
        { line: 5, vars: { chain: "2 -> 9 -> 6" }, note: "第 2 顆的 .v 更新為 9" },
        { line: 6, vars: { chain: "2 -> 6" }, note: "頭節點 next 直接跳過 Node(9) 接上 Node(6)" },
        { line: 7, vars: { sum: 8 }, output: "8", note: "2 + 6 = 8" },
      ],
    },
    {
      id: "ac-sort-bsearch",
      syllabusTag: "排序・搜尋與效能",
      title: "插入排序不變式 vs 二分搜尋死迴圈",
      mentalModel: ["插入排序第 i 輪保證前 i+1 序", "右側未處理元素位置不動", "lo = mid 搭向下取整會卡 [0,1]"],
      code: `arr = [29, 10, 14, 37, 13]
for i in range(1, 3):
    key = arr[i]; j = i - 1
    while j >= 0 and arr[j] > key:
        arr[j + 1] = arr[j]; j -= 1
    arr[j + 1] = key
print(arr)`,
      rule: "考「執行 k 輪插入排序後」只要看前 k+1 格是否排好，後面元素完全不進場；二分搜尋寫 lo=mid 必須用 (lo+hi+1)//2。",
      predictQuestion: "只跑完 i = 1 與 i = 2 後，最後兩個數 (37, 13) 會動嗎？",
      predictOptions: [
        { label: "不會動，印出 [10, 14, 29, 37, 13]", isCorrect: true, why: "前 3 項重排為 [10, 14, 29]，後方 [37, 13] 維持原位。" },
        { label: "會把 13 往前換成 [10, 13, 14, 29, 37]", isCorrect: false, why: "要跑完 i=4 才會輪到 13 插入；氣泡/選擇與插入邏輯不同。" },
      ],
      steps: [
        { line: 6, vars: { i: 1, key: 10, arr: [10, 29, 14, 37, 13] }, note: "第 1 輪將 10 插入，前兩項有序" },
        { line: 6, vars: { i: 2, key: 14, arr: [10, 14, 29, 37, 13] }, note: "第 2 輪將 14 插入，前三項有序、後兩項不動" },
        { line: 7, vars: { arr: [10, 14, 29, 37, 13] }, output: "[10, 14, 29, 37, 13]", note: "印出中間態" },
      ],
    },
  ],
};
