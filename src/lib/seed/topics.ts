import type { CoreConcept, PitfallItem, VisualizerType } from "../types";

export interface SeedTopicInput {
  slug: string;
  title: string;
  subtitle: string;
  summary: string;
  exam_weight: string;
  study_minutes: number;
  sort_order: number;
  visualizer_type: VisualizerType;
  core_concepts: CoreConcept[];
  pitfalls: PitfallItem[];
  is_published: boolean;
}

export const SEED_TOPICS: SeedTopicInput[] = [
  {
    slug: "control-flow",
    title: "條件判斷與控制流",
    subtitle: "掌握互斥分支、縮排歸屬與靜態區間推理",
    summary:
      "聚焦獨立 if 與 if-elif 鏈的互斥差異、Python 縮排決定 else 配對、數值真偽（Falsy），以及如何透過區間平移辨識永遠不會執行到的死碼。",
    exam_weight: "13%（官方範例 4 題：Q10, Q17, Q27, Q29）",
    study_minutes: 20,
    sort_order: 1,
    visualizer_type: "interval-branch",
    is_published: true,
    core_concepts: [
      {
        title: "獨立 if 與 if-elif 的互斥差異",
        summary:
          "兩個連續 if 會各自獨立評估；一旦改寫成 if-elif，只要第一個條件為真，後續所有 elif 分支都會被跳過，即使資料同時滿足下一個條件也一樣。",
        code: `if A[i] > M:\n    M = A[i]\nelif A[i] < N:\n    N = A[i]  # 若 M 先被更新，這行不會執行`,
        note: "求單一資料組的最大與最小值時，當第一筆同時需要更新 M 與 N（例如遞增序列 [80, 90, 100]），elif 會漏掉最初的最小值更新。",
      },
      {
        title: "由上而下的區間遮蔽效應",
        summary:
          "多重 elif 的條件必須嚴格從窄到寬（或互不重疊）。若寬鬆條件寫在上面（例如先寫 s > 60 再寫 s > 70），上方條件會直接攔截原本屬於下方的分數區間。",
        code: `elif s > 60:   # 攔截了 61~79！\n    print('D')\nelif s > 70:   # 永遠無機會觸發\n    print('C')`,
        note: "分析這類題目時，畫一條 0~100 數線並由上而下逐層塗色，就能精準數出到底錯了幾個數值。",
      },
      {
        title: "縮排配對與數值 0 的 Falsy 特性",
        summary:
          "Python 以縮排決定 if/else 歸屬而非大括號；此外數字 0 在布林上下文中視為 False，非零數字（含負數）皆為 True。",
        code: `if count:\n    count = 15\nelse:\n    count = 16  # 當 count == 0 時會進這支`,
        note: "遇到多層巢狀 if 時，先用尺規對齊每一組 if/elif/else 的縱向縮排欄位，再逐行追蹤變數值。",
      },
    ],
    pitfalls: [
      {
        title: "先判寬條件導致下層 elif 失效",
        wrongCode: `elif s > 60:\n    print('D')\nelif s > 70:\n    print('C')`,
        triggerInput: "s = 60 與 s = 70 ~ 79（共 11 個分數判錯）",
        fixedCode: `elif s >= 70:\n    print('C')\nelif s >= 60:\n    print('D')`,
        explanation:
          "不僅 s > 60 把 70~79 全部吃掉判成 D（10 個），還漏了邊界 s == 60 掉進 else 判成 F（1 個），總共錯 11 個分數。",
      },
      {
        title: "誤把獨立事件寫成 elif",
        wrongCode: `M, N = -1, 101\nif A[i] > M:\n    M = A[i]\nelif A[i] < N:\n    N = A[i]`,
        triggerInput: "A = [80, 90, 100]（首元素之後一路遞增）",
        fixedCode: `if A[i] > M:\n    M = A[i]\nif A[i] < N:\n    N = A[i]`,
        explanation:
          "當 A = [80, 90, 100] 時，i=0 更新 M=80 後跳過 elif，之後 90、100 皆大於 M 而永遠跳過 N 的更新，導致最後 N 仍維持初始值 101。",
      },
      {
        title: "未做區間分析誤判死碼位置",
        wrongCode: `while a < 10:\n    a = a + 5\nif a < 12:\n    a = a + 2\nif a < 11:\n    a = 5`,
        triggerInput: "不論輸入正數、0 或負數，離開 while 時必滿足 a >= 10",
        fixedCode: "若目標為測試 a < 11，須擺在 a = a + 2 之前或調整迴圈後置條件",
        explanation:
          "看清楚縮排位置！兩個 if 都在 while 迴圈之外。離開 while 時保證 a >= 10，若落在 [10, 12) 會被加 2 推升至 [12, 14)，因此到達 if a < 11 時數值必定 >= 12，使 a = 5 成為永遠不可達的死碼。",
      },
    ],
  },
  {
    slug: "loops-range",
    title: "迴圈、range 與基本運算",
    subtitle: "看穿左閉右開邊界、巢狀圖形規律與冗餘運算",
    summary:
      "訓練從輸出圖樣反推迴圈終止條件、掌握 range(start, stop, step) 的含頭不含尾與負步長規則，以及利用整數除法與餘數做找零計算與冗餘碼判讀。",
    exam_weight: "20%（官方範例 6 題：Q2, Q5, Q12, Q19, Q20, Q26）",
    study_minutes: 25,
    sort_order: 2,
    visualizer_type: "range-loop",
    is_published: true,
    core_concepts: [
      {
        title: "range(start, stop, step) 精確語意",
        summary:
          "正步長時產生滿足 start <= x < stop 的整數；負步長時產生滿足 start >= x > stop 的整數。不論正負，stop 本身永遠不被包含。",
        code: `range(0, 100, 5)   # 0, 5, ..., 95 -> 共 20 次\nrange(5, 100, 5)   # 5, 10, ..., 95 -> 僅 19 次！\nrange(6, 0, -1)    # 6, 5, 4, 3, 2, 1`,
        note: "當題目問「重複執行幾次」時，可速算 ceil((stop - start) / step)，或直接寫出前兩項與最後一項檢查。",
      },
      {
        title: "巢狀迴圈的「外層控列、內層控欄」",
        summary:
          "處理圖形輸出或二維標籤時，先記錄每一輪外層 i 對應到的內層迴圈終止條件與輸出個數，即可快速反推出 (?) 條件式。",
        code: `for i in range(5):\n    j = 0\n    while j < i:\n        print(f'[{i + j}]', end='')\n        j = j + 2`,
        note: "Q2 輸出共有 6 個方括號，且第 1 個出現的是 [1]（對應 i=1, j=0），代表 i=0 時內層一次都沒執行，馬上排除 <= 與 >=。",
      },
      {
        title: "貪婪找零與冗餘資料流（Dead Store）",
        summary:
          "使用 (Change - Change % coin) // coin 取該面額張數並以 Change %= coin 傳給下一面額；對任何整數 x，x % 1 恆等於 0，且最後一行對 Change 的改寫若後續無讀取即為冗餘。",
        code: `# D 區（1 元找零後已無更小面額）\nprint(f'1 : {(Change - Change % 1) // 1} coins')\nChange = Change % 1  # 後續不再使用 Change`,
        note: "注意 Q20 題目特別對 D 區提問整個區塊是否冗餘，關鍵在於題目問法與找零鏈末端無效取餘的特性。",
      },
    ],
    pitfalls: [
      {
        title: "把 range 終止值誤當成包含邊界",
        wrongCode: `for i in range(0, 101, 5):\n    print('Hi!')  # 印了 21 次（含 0 與 100）`,
        triggerInput: "若錯改成 range(5, 100, 5)，只會印出 19 次",
        fixedCode: `for i in range(0, 100, 5):  # 或 range(5, 101, 5)`,
        explanation:
          "數列從 0 到 100 每隔 5 步共有 21 個數字；要印 20 次必須少掉 100（改 stop=100）或少掉 0（改 start=5 且 stop=101）。",
      },
      {
        title: "等差星號數量增幅寫成 +1 而非 +2",
        wrongCode: `k = 4\nm = 1\nfor i in range(5):\n    print(' ' * k, end='')\n    print('*' * m)\n    k = k - 1\n    m = m + 1`,
        triggerInput: "預期每列 1, 3, 5, 7, 9 顆星，錯碼印出 1, 2, 3, 4, 5 顆",
        fixedCode: `    m = m + 2  # 只需修改第 7 行這 1 行`,
        explanation:
          "空格每次減 1（4→3→2→1→0）完全正確；星號數每列應增 2 才能對稱展開金字塔。",
      },
      {
        title: "負步長 range 誤用 -1 當 stop",
        wrongCode: `for k in range(6 - 2 * i, -1, -1):\n    print('*', end='')`,
        triggerInput: "當 i=0 時，從 6 數到 0 會印出 7 顆星（多一顆）",
        fixedCode: `for k in range(6 - 2 * i, 0, -1):`,
        explanation:
          "第 1 列需印 6 顆星，從 6 遞減步長 -1 要停在 1，故不含的 stop 必須設為 0。",
      },
    ],
  },
  {
    slug: "lists-grid",
    title: "列表、二維陣列與索引操作",
    subtitle: "平行賦值交換、模數位移、四方向掃描與前綴和",
    summary:
      "涵蓋 Python 同步解包交換 a[i], a[j] = a[j], a[i] 與迴圈範圍陷阱、環狀緩衝索引 (i+2)%n、二維迷宮方向向量位移，以及一維前綴和陣列的區間和相減。",
    exam_weight: "17%（官方範例 5 題：Q15, Q18, Q24, Q25, Q30）",
    study_minutes: 25,
    sort_order: 3,
    visualizer_type: "array-grid",
    is_published: true,
    core_concepts: [
      {
        title: "反轉迴圈跑滿 n 次會「翻過去又翻回來」",
        summary:
          "對長度 n 的列表執行 symmetric swap 時，若迴圈跑 range(n) 而非 range(n // 2)，前半段剛換好的元素在後半段會再度交換回原位。",
        code: `for i in range(n):\n    a[i], a[n-i-1] = a[n-i-1], a[i]\n# 跑完後 a 維持原樣 [1, 3, 5, 7, 9, 8, 6, 4, 2]！`,
        note: "特別留意第二個輸出迴圈跑 range(n//2 + 1)，當 n=9 時 i=4 會印兩次 a[4]！",
      },
      {
        title: "二維迷宮與方向向量陣列 dir",
        summary:
          "以 dir = [[-1,0], [0,1], [1,0], [0,-1]] 代表上右下左四鄰居，外層雙迴圈範圍決定掃描哪幾個中心格，務必小心 range(1, 4) 不包含 4。",
        code: `for i in range(1, 4):      # i = 1, 2, 3\n    for j in range(1, 4):  # j = 1, 2, 3\n        for d in range(4): # 檢查上下左右`,
        note: "不用怕 9×4 = 36 次太多，把 3×3 內圈每個格子的「四周有幾個 1」寫在格子上直接加總，15 秒內零失誤算出 20。",
      },
      {
        title: "前綴和陣列與循環位移索引",
        summary:
          "若 a[i] = b[i] + a[i-1]，則 a[k] 等於 b[1] + ... + b[k]；因此 a[50] - a[30] 等於 b[31] + ... + b[50]（注意不含 30！）。",
        code: `for i in range(1, 101):\n    a[i] = b[i] + a[i - 1]\nprint(a[50] - a[30])  # 等差級數 (31+50)*20/2 = 810`,
        note: "另一類常用索引技巧是 X[(i+2) % 10]，代表把第 i 筆輸入放進往右移兩格（含環狀回繞）的槽位。",
      },
    ],
    pitfalls: [
      {
        title: "以為最大值必然嚴格大於最小值 (q < p)",
        wrongCode: `# 題目敘述：經過最大最小值搜尋後，q < p 必成立`,
        triggerInput: "當列表 A 所有元素完全相等，例如 A = [5, 5, 5, 5]",
        fixedCode: "正確關係應為 q <= p",
        explanation:
          "當 A 中所有數值相同時，最大值 p 與最小值 q 會相等（q == p），故嚴格小於 q < p 不一定成立。",
      },
      {
        title: "前綴和相減時多加或少算端點",
        wrongCode: `# 誤把 a[50] - a[30] 算成 30 + 31 + ... + 50 = 840`,
        triggerInput: "代入最小範圍測試：a[3] - a[1] = b[2] + b[3]（不含 b[1]）",
        fixedCode: "a[R] - a[L] = sum(b[L+1 .. R])，共 R - L 項",
        explanation:
          "a[30] 已經加總了 1~30，扣掉 a[30] 後剩下的第一項是 31 而非 30，共 20 項：(31 + 50) × 20 ÷ 2 = 810。",
      },
      {
        title: "環狀右移與左移方向混淆",
        wrongCode: `# 誤將 X[(i+2)%10] = input[i] 看成輸入從 index 2 開始移到 0`,
        triggerInput: "代入 i=8, 9 驗證：X[0] 收到輸入 8，X[1] 收到輸入 9",
        fixedCode: "對每個 i 畫出 i -> (i+2)%10 的箭頭",
        explanation:
          "輸入 8, 9 繞回陣列最前面成為 X[0]=8, X[1]=9，因此陣列順序為 8, 9, 0, 1, 2, 3, 4, 5, 6, 7。",
      },
    ],
  },
  {
    slug: "functions-recursion",
    title: "函式與遞迴思維",
    subtitle: "呼叫堆疊追蹤、Base Case 檢驗與自底向上建表",
    summary:
      "APCS 程式識讀比重最高的核心單元（佔比 30%）。帶你透視 Call Stack 去程與回程的執行順序、相互遞迴、Base Case 邊界失誤，以及二元遞迴如何用表格式快速手算。",
    exam_weight: "30%（官方範例 9 題：Q1, Q3, Q8, Q11, Q13, Q14, Q16, Q21, Q23）",
    study_minutes: 35,
    sort_order: 4,
    visualizer_type: "recursion-stack",
    is_published: true,
    core_concepts: [
      {
        title: "遞迴的「去程（展開）」與「回程（折返）」",
        summary:
          "呼叫遞迴函式之前的敘述會在往深層前進時執行；呼叫遞迴函式之後的敘述（如返回後的 print 或乘法），會等深層呼叫 return 後才依後進先出（LIFO）順序執行。",
        code: `else:\n    print(m)     # 去程印出\n    f2(m + 2)    # 暫停當前函式，壓入 Call Stack\n    print(m)     # 等 f2 返回後才執行（回程對稱印出）`,
        note: "Q8 的 f1(1) 會形成 1 → f2(3) → f1(2) → f2(4) 的對稱印出，畫出階層縮排樹就絕不會數錯呼叫次數。",
      },
      {
        title: "Base Case 差一個等號導致全盤歸零",
        summary:
          "遞迴終止條件不僅要能停下來，還必須在最後一層回傳正確的單位元素（如階乘須在 n=0 回傳 1）。若條件寫成 n >= 0，會多乘一次 0 * fun(-1)。",
        code: `def fun(n):\n    fac = 1\n    if n >= 0:   # 當 n=0 時仍進入！\n        fac = n * fun(n - 1)\n    return fac`,
        note: "這段程式不會無窮遞迴（因為 n=-1 時跳過 if 回傳 1），而是讓任何 n>=0 的結果都乘以 0 而變成 0！",
      },
      {
        title: "考場密技：二元遞迴改用「由小到大填表」",
        summary:
          "遇到 F(a-2) + F(a-3) 或 f(n+1) 這類有重疊子問題的遞迴，不要硬畫完整棵樹，直接列一張由基準點往上填的表，幾秒內零失誤算出答案。",
        code: `# Q16：若條件為 a < 0 回傳 1，則：\n# F(-2)=1, F(-1)=1\n# F(0)=F(-2)+F(-3)=2, F(1)=2, F(2)=3, F(3)=4, F(4)=5, F(5)=7, F(6)=9, F(7)=12`,
        note: "這招同時能用來反推空白條件（Q3, Q16）：先列出正確輸出，再對四個選項代小測資秒刪錯誤項。",
      },
    ],
    pitfalls: [
      {
        title: "看到奇怪 Base Case 就直覺選「無窮迴圈」",
        wrongCode: `if n >= 0:\n    fac = n * fun(n - 1)`,
        triggerInput: "n = 3 -> fun(3) -> fun(2) -> fun(1) -> fun(0) -> fun(-1) 停止",
        fixedCode: `if n > 0:  # 使 fun(0) 直接回傳 fac = 1`,
        explanation:
          "fun(-1) 不滿足 n >= 0，會直接回傳預設的 fac = 1 而終止；真正問題是 fun(0) 把整條乘積乘以 0。",
      },
      {
        title: "忽略每層正負號交替或運算優先序",
        wrongCode: `# Q1：(i // 2) % 2 == 0 時乘 +i，否則乘 -i`,
        triggerInput: "f(10) 中 i=10,8,6,4,2 分別為 (5)%2=1(-10), (4)%2=0(+8), (3)%2=1(-6), (2)%2=0(+4), (1)%2=1(-2)",
        fixedCode: "標出每層正負號個數：共 3 個負號（10, 6, 2）",
        explanation:
          "數字絕對值乘積為 10×8×6×4×2 = 3840，奇數個負號相乘結果為 -3840，務必分開檢查絕對值與正負號。",
      },
      {
        title: "GCD 遞迴回傳參數位置寫反",
        wrongCode: `r = a % b\nif r == 0:\n    return a  # 錯！應回傳除數 b\nreturn GCD(a, r)  # 錯！應傳 (b, r)`,
        triggerInput: "a = 12, b = 8 -> r = 4 -> 應呼叫 GCD(8, 4) -> r = 0 回傳 4",
        fixedCode: `if r == 0:\n    return b\nreturn GCD(b, r)`,
        explanation:
          "當餘數為 0 時，最後的除數 b 才是最大公因數；餘數不為 0 時，下一輪是被除數換成 b、除數換成餘數 r。",
      },
    ],
  },
  {
    slug: "algorithms-complexity",
    title: "經典演算法、資料結構與複雜度",
    subtitle: "佇列模擬、搜尋比較、滾動變數與迴圈數學建模",
    summary:
      "整合陣列實作佇列（head/tail 指針與跨輪狀態）、線性搜尋 vs 二分搜尋步數與無解邊界 Bug、費氏與輾轉相除法滾動賦值順序，以及三層迴圈的數學計數公式。",
    exam_weight: "20%（官方範例 6 題：Q4, Q6, Q7, Q9, Q22, Q28）",
    study_minutes: 30,
    sort_order: 5,
    visualizer_type: "algo-race",
    is_published: true,
    core_concepts: [
      {
        title: "陣列模擬佇列與「跨輪不歸零」的計數器",
        summary:
          "以 head 讀取隊頭並遞增、tail 寫入隊尾並遞增。當 while tail > head + 1 代表佇列內還有至少兩個元素；注意條件 count == 3 後才重設，count 會在每輪之間接續累加。",
        code: `while tail > head + 1:\n    val = Q[head]; head += 1; count += 1\n    if count == 3:\n        count = 0; Q[tail] = val; tail += 1`,
        note: "Q4 的約瑟夫變形題（每留 1 個踢 2 個，即每第 3 個放回隊尾）：1..30 第一輪留 [3, 6, 9, 12, 15, 18, 21, 24, 27, 30]，寫出來模擬只需要 4 輪就收斂到 18。",
      },
      {
        title: "二分搜尋的 mid 取整與無解邊界陷阱",
        summary:
          "二分搜尋每次檢查 A[mid] 並將區間減半，比對次數為 O(log N)；但若迴圈結束條件為 low < high 而未在最後檢查 A[high] 是否真的滿足目標條件，當所有元素皆小於 x 時會誤傳最大元素 A[n-1]。",
        code: `while high > low:\n    mid = (high + low) // 2\n    if A[mid] <= x: low = mid + 1\n    else: high = mid\nreturn A[high]  # 若 x=16 >= max(A)=14，仍回傳 14！`,
        note: "測試搜尋演算法時，除了測頭、中、尾元素，務必測「比最小值還小」與「比最大值還大」兩個無解邊界！",
      },
      {
        title: "滾動變數賦值順序 & 巢狀迴圈總次數",
        summary:
          "更新兩個相依變數（如費氏 b=a+b, a=temp 或 GCD 輾轉取餘）時，先備份舊值（temp = b 或 k = i % j），再依序覆寫；三層巢狀迴圈總次數可拆為外兩層上三角 (n(n+1)/2) × 內層對數倍增 (floor(log2 n)+1)。",
        code: `for i in range(1, n+1):\n    for j in range(i, n+1):  # 合計 n(n+1)/2 次\n        k = 1\n        while k <= n:        # 合計 floor(log2 n) + 1 次\n            x += 1; k *= 2`,
        note: "考場檢驗複雜度選項最穩的方式：直接代 n=1 與 n=2 手算程式真實回傳值，立刻淘汰不符的選項！",
      },
    ],
    pitfalls: [
      {
        title: "估算搜尋次數時算成 0-based 索引而少 1",
        wrongCode: `a[k] = 3*k + 1，value = 100 -> k = 33，故以為 while 跑 33 次`,
        triggerInput: "i 從 0 開始數到 33：0, 1, 2, ..., 33 一共有 34 個數字",
        fixedCode: "n1 = 33 - 0 + 1 = 34 次",
        explanation:
          "Q6 的線性搜尋檢查 a[0] 到 a[33]，含頭含尾一共進入 while 迴圈 34 次；二分搜尋則依序取 mid=49→24→36→30→33，共 5 次。",
      },
      {
        title: "滾動交換沒設暫存順序導致覆寫舊值",
        wrongCode: `i = j\nj = k\nk = i % j  # 此時 i 已經變成 j 了！`,
        triggerInput: "i = 76, j = 48 -> i 變成 48 後才取餘，結果永遠錯誤",
        fixedCode: `k = i % j\ni = j\nj = k`,
        explanation:
          "必須先用原來的 i, j 算出餘數 k，才能安全地把 j 蓋進 i、把 k 蓋進 j。",
      },
      {
        title: "忘記 k=1 倍增迴圈要算入 +1 次",
        wrongCode: `while k <= n: k *= 2 只算成 floor(log2 n) 次`,
        triggerInput: "代入 n = 1：k = 1 <= 1 仍執行 1 次，但 log2(1) = 0",
        fixedCode: "執行次數為 floor(log2 n) + 1",
        explanation:
          "當 n=1 時程式回傳 x=1，只有選項 (C) n(n+1)[log2 n + 1]/2 代入 n=1 得出 1×2×1/2 = 1。",
      },
    ],
  },
];
