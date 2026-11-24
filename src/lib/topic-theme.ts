import type { QuestionType } from "./types";

export interface TopicChannelTheme {
  code: string;
  shortLabel: string;
  hex: string;
  buttonBg: string;
  buttonHover: string;
  softBg: string;
  border: string;
  text: string;
  labLabel: string;
}

const TOPIC_THEMES: Record<string, TopicChannelTheme> = {
  "control-flow": {
    code: "MOD-01",
    shortLabel: "分支閘門",
    hex: "#FF4F17",
    buttonBg: "#D93B09",
    buttonHover: "#BA3005",
    softBg: "#FFF1EC",
    border: "#FFBCA6",
    text: "#B83006",
    labLabel: "區間與分支示波器",
  },
  "loops-range": {
    code: "MOD-02",
    shortLabel: "迴圈時脈",
    hex: "#2563EB",
    buttonBg: "#1D4ED8",
    buttonHover: "#1E40AF",
    softBg: "#EDF3FF",
    border: "#B3CEFF",
    text: "#1D4ED8",
    labLabel: "range 尺規與星號產生器",
  },
  "lists-grid": {
    code: "MOD-03",
    shortLabel: "矩陣掃描",
    hex: "#00A878",
    buttonBg: "#007A57",
    buttonHover: "#006145",
    softBg: "#E6FAF3",
    border: "#9EE7D0",
    text: "#007A57",
    labLabel: "陣列與 2D 網格掃描儀",
  },
  "functions-recursion": {
    code: "MOD-04",
    shortLabel: "遞迴堆疊",
    hex: "#7C3AED",
    buttonBg: "#6D28D9",
    buttonHover: "#5B21B6",
    softBg: "#F4EEFF",
    border: "#D2BCFF",
    text: "#6D28D9",
    labLabel: "Call Stack 堆疊分析槽",
  },
  "algorithms-complexity": {
    code: "MOD-05",
    shortLabel: "演算法競速",
    hex: "#D98200",
    buttonBg: "#A35F00",
    buttonHover: "#854D00",
    softBg: "#FFF6E0",
    border: "#FCD47A",
    text: "#9A5800",
    labLabel: "搜尋與排序競速計",
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
  trace: "PAD-A",
  fill: "PAD-B",
  debug: "PAD-C",
  counterexample: "PAD-D",
  static: "PAD-E",
  complexity: "PAD-F",
};
