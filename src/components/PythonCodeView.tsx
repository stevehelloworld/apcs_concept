"use client";

import { useState } from "react";
import { AlertTriangle, Check, Copy, Play } from "lucide-react";

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
      tokens.push({ text: line.slice(i), cls: "text-[#7A8AA3] italic" });
      break;
    }

    // String literal ('...' or "..." or f'...')
    if (
      ch === "'" ||
      ch === '"' ||
      ((ch === "f" || ch === "F") &&
        (line[i + 1] === "'" || line[i + 1] === '"'))
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
      tokens.push({ text: line.slice(start, i), cls: "text-[#4ADE80]" });
      continue;
    }

    // Blank placeholder (?) or ____ or <condition>
    if (
      line.startsWith("(?)", i) ||
      line.startsWith("<condition>", i) ||
      line.startsWith("____", i)
    ) {
      const len = line.startsWith("(?)", i)
        ? 3
        : line.startsWith("<condition>", i)
        ? 11
        : 4;
      tokens.push({
        text: line.slice(i, i + len),
        cls: "rounded bg-[#FF4F17]/25 px-1 text-[#FFB800] font-semibold",
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
        tokens.push({ text: word, cls: "text-[#C084FC] font-medium" });
      } else if (BUILTINS.has(word)) {
        tokens.push({ text: word, cls: "text-[#38BDF8]" });
      } else {
        tokens.push({ text: word, cls: "text-[#EEF2F8]" });
      }
      continue;
    }

    // Number
    if (/[0-9]/.test(ch)) {
      const start = i;
      while (i < line.length && /[0-9.]/.test(line[i])) i += 1;
      tokens.push({ text: line.slice(start, i), cls: "text-[#FB923C]" });
      continue;
    }

    // Operators / punctuation
    tokens.push({ text: ch, cls: "text-[#94A3B8]" });
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
    <div className="synth-oled overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#262F3F] bg-[#161B24] px-3.5 py-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center gap-1.5 shrink-0" aria-hidden="true">
            <span className="h-2 w-2 rounded-full bg-[#FF4F17]" />
            <span className="h-2 w-2 rounded-full bg-[#FFB800]" />
            <span className="h-2 w-2 rounded-full bg-[#00C48C]" />
          </div>
          <span className="truncate font-code text-xs font-medium text-[#A8B6CC]">
            {caption ?? "PYTHON 3 // OLED TRACE"}
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex shrink-0 items-center gap-1 rounded-md border border-[#2B3548] bg-[#1E2533] px-2.5 py-1 text-[11px] font-medium text-[#CBD5E1] ui-transition hover:border-[#4B5872] hover:text-white"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-[#00C48C]" strokeWidth={2.2} />
              <span className="text-[#00C48C]">已複製</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" strokeWidth={2} />
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

              let rowCls = "ui-transition";
              if (isActive) {
                rowCls =
                  "ui-transition bg-[#FF4F17]/20 ring-1 ring-inset ring-[#FF4F17]/45";
              } else if (isBug) {
                rowCls =
                  "ui-transition bg-[#FF4757]/18 ring-1 ring-inset ring-[#FF4757]/40";
              }

              const tokens = tokenizeLine(line);

              return (
                <tr key={lineNum} className={rowCls}>
                  <td className="w-12 select-none pr-3 pl-2.5 text-right text-xs tabular-nums align-top">
                    <span className="inline-flex items-center justify-end gap-1">
                      {isActive && (
                        <Play
                          className="h-2.5 w-2.5 fill-[#FF4F17] text-[#FF4F17]"
                          strokeWidth={2}
                        />
                      )}
                      {!isActive && isBug && (
                        <AlertTriangle
                          className="h-3 w-3 text-[#FF4757]"
                          strokeWidth={2}
                        />
                      )}
                      <span
                        className={
                          isActive
                            ? "font-bold text-[#FF8A65]"
                            : isBug
                            ? "font-bold text-[#FF6B7B]"
                            : "text-[#69778F]"
                        }
                      >
                        {lineNum}
                      </span>
                    </span>
                  </td>
                  <td
                    className={`pr-4 whitespace-pre ${
                      isDead ? "opacity-50 line-through decoration-[#7A8AA3]" : ""
                    }`}
                  >
                    {tokens.length === 0
                      ? " "
                      : tokens.map((t, tIdx) => (
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
