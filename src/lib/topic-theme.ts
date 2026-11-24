import type { QuestionType } from "./types";

export interface TopicChannelTheme {
  code: string;
  shortLabel: string;
  hex: string;
  buttonBg: string;
  buttonText: string;
  buttonHover: string;
  softBg: string;
  border: string;
  text: string;
  labLabel: string;
}

const TOPIC_THEMES: Record<string, TopicChannelTheme> = {
  "control-flow": {
    code: "L1",
    shortLabel: "控制流",
    hex: "#E21D2D",
    buttonBg: "#E21D2D",
    buttonText: "#FFFFFF",
    buttonHover: "#C51624",
    softBg: "rgba(226, 29, 45, 0.14)",
    border: "rgba(226, 29, 45, 0.50)",
    text: "#FF7A85",
    labLabel: "分支示波器",
  },
  "loops-range": {
    code: "L2",
    shortLabel: "迴圈",
    hex: "#1E5BFF",
    buttonBg: "#1E5BFF",
    buttonText: "#FFFFFF",
    buttonHover: "#1646CC",
    softBg: "rgba(30, 91, 255, 0.15)",
    border: "rgba(30, 91, 255, 0.52)",
    text: "#7AA4FF",
    labLabel: "迴圈尺規",
  },
  "lists-grid": {
    code: "L3",
    shortLabel: "陣列",
    hex: "#22B14C",
    buttonBg: "#168A3B",
    buttonText: "#FFFFFF",
    buttonHover: "#127230",
    softBg: "rgba(34, 177, 76, 0.14)",
    border: "rgba(34, 177, 76, 0.50)",
    text: "#4ADE80",
    labLabel: "網格掃描",
  },
  "functions-recursion": {
    code: "L4",
    shortLabel: "遞迴",
    hex: "#FFC20E",
    buttonBg: "#FFC20E",
    buttonText: "#0B1230",
    buttonHover: "#E0AA00",
    softBg: "rgba(255, 194, 14, 0.14)",
    border: "rgba(255, 194, 14, 0.50)",
    text: "#FFD452",
    labLabel: "遞迴堆疊",
  },
  "algorithms-complexity": {
    code: "L5",
    shortLabel: "演算法",
    hex: "#14B8C4",
    buttonBg: "#14B8C4",
    buttonText: "#0B1230",
    buttonHover: "#0E9AA5",
    softBg: "rgba(20, 184, 196, 0.14)",
    border: "rgba(20, 184, 196, 0.50)",
    text: "#5EEAD4",
    labLabel: "演算法競速",
  },
};

const FALLBACK_LIST: TopicChannelTheme[] = Object.values(TOPIC_THEMES);

export function getTopicTheme(
  slug?: string | null,
  fallbackIndex = 0
): TopicChannelTheme {
  if (slug && TOPIC_THEMES[slug]) {
    return TOPIC_THEMES[slug];
  }
  return FALLBACK_LIST[Math.abs(fallbackIndex) % FALLBACK_LIST.length];
}

export const QUESTION_TYPE_PAD_CODES: Record<QuestionType, string> = {
  trace: "T1",
  fill: "T2",
  debug: "T3",
  counterexample: "T4",
  static: "T5",
  complexity: "T6",
};
