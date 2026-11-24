export type UserRole = "student" | "teacher";

export type QuestionType =
  | "trace"
  | "fill"
  | "debug"
  | "counterexample"
  | "static"
  | "complexity";

export type Difficulty = "basic" | "medium" | "advanced";

export type VisualizerType =
  | "interval-branch"
  | "range-loop"
  | "array-grid"
  | "recursion-stack"
  | "algo-race";

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  trace: "執行追蹤",
  fill: "程式填空",
  debug: "除錯修正",
  counterexample: "測試反例",
  static: "靜態分析",
  complexity: "數學建模",
};

export const QUESTION_TYPE_DESCRIPTIONS: Record<QuestionType, string> = {
  trace: "手寫變數追蹤表與堆疊狀態，準確推導程式最終輸出或迴圈執行次數。",
  fill: "根據目標輸出或函式回傳值，逆向推導缺失的迴圈條件、遞迴參數或更新敘述。",
  debug: "找出邏輯錯誤導致的偏差範圍，並判斷最少需修改幾行或應修改哪一行。",
  counterexample: "設計能觸發程式缺陷的最小或極端測試案例（邊界值、嚴格遞增、越界查詢）。",
  static: "不依賴逐筆執行，透過區間推理與變數存活分析辨識不可達死碼與冗餘指令。",
  complexity: "分析巢狀迴圈的執行次數結構並化簡為封閉數學式。",
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  basic: "基礎",
  medium: "中階",
  advanced: "進階",
};

export interface AuthUser {
  id: number;
  username: string;
  display_name: string;
  role: UserRole;
  created_at: string;
}

export interface CoreConcept {
  title: string;
  summary: string;
  code: string;
  note: string;
}

export interface PitfallItem {
  title: string;
  wrongCode: string;
  triggerInput: string;
  fixedCode: string;
  explanation: string;
}

export interface TopicRecord {
  id: number;
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
  updated_at: string;
}

export interface TopicSummary extends TopicRecord {
  question_count: number;
  official_refs: string[];
  question_types: QuestionType[];
  student_attempted?: number;
  student_correct?: number;
}

export interface OptionItem {
  key: "A" | "B" | "C" | "D";
  text: string;
  misconception: string;
}

export interface TraceStep {
  line: number;
  vars: Record<string, string | number | boolean | number[] | string[]>;
  stack?: string[];
  output?: string;
  note: string;
}

export interface QuestionRecord {
  id: number;
  topic_id: number;
  topic_slug?: string;
  topic_title?: string;
  official_ref: string | null;
  title: string;
  prompt: string;
  code: string;
  question_type: QuestionType;
  difficulty: Difficulty;
  options: OptionItem[];
  correct_option: "A" | "B" | "C" | "D";
  explanation: string;
  trace_steps: TraceStep[];
  created_by: number | null;
  class_id: number | null;
  class_name?: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  // Student contextual info when queried by logged-in student
  user_last_attempt?: {
    selected_option: "A" | "B" | "C" | "D";
    is_correct: boolean;
    created_at: string;
  } | null;
}

export interface PublicQuestionRecord {
  id: number;
  topic_id: number;
  topic_slug?: string;
  topic_title?: string;
  official_ref: string | null;
  title: string;
  prompt: string;
  code: string;
  question_type: QuestionType;
  difficulty: Difficulty;
  options: Array<{ key: "A" | "B" | "C" | "D"; text: string }>;
  class_id: number | null;
  class_name?: string | null;
  has_trace: boolean;
  user_last_attempt?: {
    selected_option: "A" | "B" | "C" | "D";
    is_correct: boolean;
    created_at: string;
  } | null;
}

export interface AttemptSubmitResult {
  attemptId: number;
  questionId: number;
  selectedOption: "A" | "B" | "C" | "D";
  isCorrect: boolean;
  correctOption: "A" | "B" | "C" | "D";
  selectedMisconception: string;
  options: OptionItem[];
  explanation: string;
  traceSteps: TraceStep[];
}

export interface ClassRecord {
  id: number;
  name: string;
  description: string;
  join_code: string;
  teacher_id: number;
  created_at: string;
  member_count?: number;
  assignment_count?: number;
  teacher_name?: string;
}

export interface AssignmentRecord {
  id: number;
  class_id: number;
  class_name?: string;
  title: string;
  description: string;
  question_ids: number[];
  due_date: string | null;
  is_published: boolean;
  created_by: number;
  created_at: string;
}

export interface StudentDashboardPayload {
  user: AuthUser;
  stats: {
    totalAttempts: number;
    uniqueSolved: number;
    totalVisibleQuestions: number;
    accuracy: number;
    avgDurationSec: number;
  };
  topicMastery: Array<{
    topicId: number;
    slug: string;
    title: string;
    totalQuestions: number;
    solvedCorrect: number;
    attemptedDistinct: number;
    accuracy: number | null;
  }>;
  typeMastery: Array<{
    type: QuestionType;
    label: string;
    attempts: number;
    correct: number;
    accuracy: number | null;
  }>;
  classes: Array<{
    id: number;
    name: string;
    description: string;
    join_code: string;
    teacher_name: string;
    joined_at: string;
  }>;
  assignments: Array<{
    id: number;
    class_id: number;
    class_name: string;
    title: string;
    description: string;
    due_date: string | null;
    question_count: number;
    completed_count: number;
    correct_count: number;
  }>;
  recentWrong: Array<{
    attemptId: number;
    questionId: number;
    title: string;
    officialRef: string | null;
    topicSlug: string;
    topicTitle: string;
    questionType: QuestionType;
    selectedOption: "A" | "B" | "C" | "D";
    correctOption: "A" | "B" | "C" | "D";
    misconception: string;
    createdAt: string;
  }>;
}

export interface TeacherAnalyticsPayload {
  classes: ClassRecord[];
  selectedClassId: number | null;
  kpis: {
    studentCount: number;
    totalAttempts: number;
    accuracy: number | null;
    activeAssignments: number;
  };
  matrix: Array<{
    topicId: number;
    topicSlug: string;
    topicTitle: string;
    cells: Record<
      QuestionType,
      { attempts: number; correct: number; accuracy: number | null }
    >;
  }>;
  weakestQuestions: Array<{
    questionId: number;
    officialRef: string | null;
    title: string;
    topicTitle: string;
    questionType: QuestionType;
    attempts: number;
    wrongCount: number;
    errorRate: number;
    topWrongOption: "A" | "B" | "C" | "D" | null;
    topMisconception: string | null;
  }>;
  studentOverview: Array<{
    studentId: number;
    displayName: string;
    username: string;
    className: string;
    attempts: number;
    solvedDistinct: number;
    accuracy: number | null;
    lastActiveAt: string | null;
  }>;
  recentAttempts: Array<{
    id: number;
    studentName: string;
    className: string;
    questionTitle: string;
    officialRef: string | null;
    selectedOption: string;
    isCorrect: boolean;
    createdAt: string;
  }>;
}

export interface ManagedStudentSummary {
  id: number;
  username: string;
  display_name: string;
  created_at: string;
  classes: Array<{
    id: number;
    name: string;
    join_code: string;
  }>;
  total_attempts: number;
  solved_distinct: number;
  total_questions: number;
  accuracy: number | null;
  wrong_count: number;
  last_attempt_at: string | null;
}

export interface TeacherStudentProgressPayload {
  student: {
    id: number;
    username: string;
    display_name: string;
    created_at: string;
    classes: Array<{
      id: number;
      name: string;
      join_code: string;
    }>;
    other_teacher_class_count: number;
  };
  stats: {
    totalAttempts: number;
    uniqueSolved: number;
    totalQuestions: number;
    accuracy: number | null;
    avgDurationSec: number;
  };
  topicMastery: Array<{
    topicId: number;
    slug: string;
    title: string;
    totalQuestions: number;
    solvedCorrect: number;
    attemptedDistinct: number;
    accuracy: number | null;
  }>;
  typeMastery: Array<{
    type: QuestionType;
    label: string;
    attempts: number;
    correct: number;
    accuracy: number | null;
  }>;
  assignments: Array<{
    id: number;
    class_id: number;
    class_name: string;
    title: string;
    due_date: string | null;
    question_count: number;
    completed_count: number;
    correct_count: number;
  }>;
  recentAttempts: Array<{
    id: number;
    question_id: number;
    official_ref: string | null;
    title: string;
    topic_title: string;
    question_type: QuestionType;
    selected_option: "A" | "B" | "C" | "D";
    correct_option: "A" | "B" | "C" | "D";
    is_correct: boolean;
    duration_sec: number;
    created_at: string;
  }>;
  availableQuestions: Array<{
    id: number;
    official_ref: string | null;
    title: string;
    topic_id: number;
    topic_title: string;
    is_solved: boolean;
    attempt_count: number;
  }>;
}
