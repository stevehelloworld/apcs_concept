"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface PythonCodeViewProps {
  code: string;
  activeLine?: number | null;
  bugLines?: number[];
  deadLines?: number[];
  caption?: string;
  compact?: boolean;
}

const KEYWORDS = new Set([
  "def",
  "if",
  "elif",
  "else",
  "for",
  "while",
  "in",
  "return",
  "break",
  "continue",
  "and",
  "or",
  "not",
  "True",
  "False",
  "None",
]);

const BUILTINS = new Set(["print", "range", "int", "input", "len"]);

function tokenizeLine(line: string): Array<{ text: string; cls: string }> {
  const tokens: Array<{ text: string; cls: string }> = [];
  let i = 0;

  while (i < line.length) {
    const ch = line[i];

    // Comment
    if (ch === "#") {
      tokens.push({ text: line.slice(i), cls: "text-[#7F8CA3] italic" });
      break;
    }

    // String literal ('...' or "..." or f'...')
    if (
      (ch === "'" || ch === '"') ||
      ((ch === "f" || ch === "F") && (line[i + 1] === "'" || line[i + 1] === '"'))
    ) {
      const start = i;
      if (ch === "f" || ch === "F") i += 1;
      const quote = line[i];
      i += 1;
      while (i < line.length && line[i] !== quote) {
        if (line[i] === "\\") i += 1;
        i += 1;
      }
      if (i < line.length) i += 1;
      tokens.push({ text: line.slice(start, i), cls: "text-[#9ECE6A]" });
      continue;
    }

    // Blank placeholder (?) or ____ or <condition>
    if (line.startsWith("(?)", i) || line.startsWith("<condition>", i) || line.startsWith("____", i)) {
      const len = line.startsWith("(?)", i)
        ? 3
        : line.startsWith("<condition>", i)
        ? 11
        : 4;
      tokens.push({
        text: line.slice(i, i + len),
        cls: "rounded bg-[#B4690E]/30 px-1 text-[#F6C177] font-semibold",
      });
      i += len;
      continue;
    }

    // Word (identifier / keyword / builtin)
    if (/[a-zA-Z_]/.test(ch)) {
      const start = i;
      while (i < line.length && /[a-zA-Z0-9_]/.test(line[i])) i += 1;
      const word = line.slice(start, i);
      if (KEYWORDS.has(word)) {
        tokens.push({ text: word, cls: "text-[#BB9AF7] font-medium" });
      } else if (BUILTINS.has(word)) {
        tokens.push({ text: word, cls: "text-[#7DCFFF]" });
      } else {
        tokens.push({ text: word, cls: "text-[#E4E9F2]" });
      }
      continue;
    }

    // Number
    if (/[0-9]/.test(ch)) {
      const start = i;
      while (i < line.length && /[0-9.]/.test(line[i])) i += 1;
      tokens.push({ text: line.slice(start, i), cls: "text-[#FF9E64]" });
      continue;
    }

    // Operators / punctuation
    tokens.push({ text: ch, cls: "text-[#9AA5CE]" });
    i += 1;
  }

  return tokens;
}

export function PythonCodeView({
  code,
  activeLine = null,
  bugLines = [],
  deadLines = [],
  caption,
  compact = false,
}: PythonCodeViewProps) {
  const [copied, setCopied] = useState(false);
  const lines = code.replace(/\r\n/g, "\n").split("\n");

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Ignore clipboard failure
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[#252C3A] bg-[#141820] text-[#E4E9F2]">
      <div className="flex items-center justify-between border-b border-[#252C3A] bg-[#1B202B] px-3.5 py-2">
        <span className="font-code text-xs text-[#9AA5CE]">
          {caption ?? "Python 3"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs text-[#9AA5CE] ui-transition hover:bg-[#252C3A] hover:text-white"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-[#73DACA]" strokeWidth={1.75} />
              <span>已複製</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span>複製</span>
            </>
          )}
        </button>
      </div>
      <div className={`overflow-x-auto ${compact ? "py-2" : "py-3"}`}>
        <table className="w-full border-collapse font-code text-[13px] leading-6">
          <tbody>
            {lines.map((line, idx) => {
              const lineNum = idx + 1;
              const isActive = activeLine === lineNum;
              const isBug = bugLines.includes(lineNum);
              const isDead = deadLines.includes(lineNum);

              let rowBg = "";
              if (isActive) rowBg = "bg-[#1E4E8C]/35";
              else if (isBug) rowBg = "bg-[#C23535]/25";

              const tokens = tokenizeLine(line);

              return (
                <tr key={lineNum} className={`${rowBg} ui-transition`}>
                  <td className="w-10 select-none pr-3 text-right text-xs text-[#647087] tabular-nums align-top">
                    {lineNum}
                  </td>
                  <td
                    className={`pr-4 whitespace-pre ${
                      isDead ? "opacity-50 line-through decoration-[#647087]" : ""
                    }`}
                  >
                    {tokens.length === 0 ? " " : tokens.map((t, tIdx) => (
                      <span key={tIdx} className={t.cls}>
                        {t.text}
                      </span>
                    ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
