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
  hideCopy?: boolean;
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

    if (ch === "#") {
      tokens.push({ text: line.slice(i), cls: "text-[#7E91B8] italic" });
      break;
    }

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
        cls: "rounded bg-[#FFC20E]/20 px-1 text-[#FFC20E] font-bold",
      });
      i += len;
      continue;
    }

    if (/[a-zA-Z_]/.test(ch)) {
      const start = i;
      while (i < line.length && /[a-zA-Z0-9_]/.test(line[i])) i += 1;
      const word = line.slice(start, i);
      if (KEYWORDS.has(word)) {
        tokens.push({ text: word, cls: "text-[#FFD452] font-semibold" });
      } else if (BUILTINS.has(word)) {
        tokens.push({ text: word, cls: "text-[#7AA4FF]" });
      } else {
        tokens.push({ text: word, cls: "text-white" });
      }
      continue;
    }

    if (/[0-9]/.test(ch)) {
      const start = i;
      while (i < line.length && /[0-9.]/.test(line[i])) i += 1;
      tokens.push({ text: line.slice(start, i), cls: "text-[#5EEAD4]" });
      continue;
    }

    tokens.push({ text: ch, cls: "text-[#B8C5E0]" });
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
  hideCopy = false,
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
    <div className="rail-well overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/15 bg-[#0B1230]/90 px-3 py-1.5">
        <span className="truncate font-code text-[11px] font-bold text-[#B8C5E0]">
          {caption ?? "PYTHON 3"}
        </span>

        {!hideCopy && (
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex shrink-0 items-center gap-1 rounded border border-white/20 px-2 py-0.5 text-[11px] font-bold text-[#B8C5E0] ui-transition hover:border-white hover:text-white"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-[#4ADE80]" strokeWidth={2.2} />
                <span className="text-[#4ADE80]">已複製</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" strokeWidth={2} />
                <span>複製</span>
              </>
            )}
          </button>
        )}
      </div>

      <div className={`overflow-x-auto ${compact ? "py-1.5" : "py-2.5"}`}>
        <table className="w-full border-collapse font-code code-view-table">
          <tbody>
            {lines.map((line, idx) => {
              const lineNum = idx + 1;
              const isActive = activeLine === lineNum;
              const isBug = bugLines.includes(lineNum);
              const isDead = deadLines.includes(lineNum);

              let rowCls = "ui-transition";
              if (isActive) {
                rowCls =
                  "ui-transition bg-[#E21D2D]/22 ring-1 ring-inset ring-[#E21D2D]/55";
              } else if (isBug) {
                rowCls =
                  "ui-transition bg-[#E21D2D]/16 ring-1 ring-inset ring-[#E21D2D]/40";
              }

              const tokens = tokenizeLine(line);

              return (
                <tr key={lineNum} className={rowCls}>
                  <td className="w-11 select-none pr-3 pl-2 text-right text-xs tabular-nums align-top">
                    <span className="inline-flex items-center justify-end gap-1">
                      {isActive && (
                        <Play
                          className="h-2.5 w-2.5 fill-[#E21D2D] text-[#E21D2D]"
                          strokeWidth={2}
                        />
                      )}
                      {!isActive && isBug && (
                        <AlertTriangle
                          className="h-3 w-3 text-[#FF7A85]"
                          strokeWidth={2}
                        />
                      )}
                      <span
                        className={
                          isActive
                            ? "font-bold text-[#FF7A85]"
                            : isBug
                            ? "font-bold text-[#FF7A85]"
                            : "text-[#7E91B8]"
                        }
                      >
                        {lineNum}
                      </span>
                    </span>
                  </td>
                  <td
                    className={`pr-4 whitespace-pre ${
                      isDead ? "opacity-50 line-through decoration-[#7E91B8]" : ""
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
