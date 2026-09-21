"use client";

import { CopilotChat } from "@copilotkit/react-core/v2";
import { useEffect, useRef, useState } from "react";

import { DemoFrame } from "@/components/demo-frame";

/**
 * Markdown Rendering, all three published techniques against one chat.
 *
 * The three snippets are verbatim from the doc page. The only additions are the
 * tab chrome, the `key` on each chat so switching levels remounts it, and the
 * probe below, which reads the rendered DOM rather than changing what renders.
 *
 * The probe exists because the page makes three testable claims about the props
 * a `components` override receives — the `node` prop must be destructured out
 * or it lands in the HTML, spreading the rest keeps the renderer's link
 * hardening, and your component replaces rather than extends, so Streamdown's
 * classes and `data-streamdown` go away. None of those are visible by looking at
 * the chat; all three are visible in the attributes.
 */

type Level = "components" | "classes" | "replace";

const LEVELS: { id: Level; label: string; blurb: string }[] = [
  {
    id: "components",
    label: "1 · components map",
    blurb:
      "A props override sets Streamdown's components map, swapping the React component used for one HTML tag.",
  },
  {
    id: "classes",
    label: "2 · class string",
    blurb: "A class string merges onto the markdown container.",
  },
  {
    id: "replace",
    label: "3 · replace the renderer",
    blurb:
      "A component instead of an object replaces the renderer outright. It receives one prop, content.",
  },
];

// [3] markdown: replace the renderer
/* [!code highlight:3] */
const PlainText = ({ content }: { content: string }) => (
  <pre className="whitespace-pre-wrap">{content}</pre>
);

/** One row of what the rendered markup actually carries. */
type ProbeRow = { tag: string; attrs: string };

/**
 * Reads the last assistant message in `scope` and reports the attributes on its
 * first `a` and first `h2`.
 *
 * Polled rather than observed: the message streams in, and the interesting
 * moment is after it settles. `node` is checked as a literal attribute because
 * that is exactly how the page says it fails — `node="[object Object]"`.
 */
function MarkupProbe({
  scope,
  level,
}: {
  scope: React.RefObject<HTMLDivElement | null>;
  level: Level;
}) {
  const [rows, setRows] = useState<ProbeRow[]>([]);

  useEffect(() => {
    setRows([]);
    const read = () => {
      const root = scope.current;
      if (!root) return;
      const next: ProbeRow[] = [];
      for (const selector of ["a", "h2", "pre"]) {
        const els = root.querySelectorAll<HTMLElement>(selector);
        const el = els[els.length - 1];
        if (!el) continue;
        const attrs = [...el.attributes]
          .map((a) => `${a.name}="${a.value}"`)
          .join(" ");
        next.push({ tag: selector, attrs });
      }
      setRows(next);
    };
    const timer = setInterval(read, 1000);
    return () => clearInterval(timer);
  }, [scope, level]);

  return (
    <div className="shrink-0 border-t border-slate-200 px-3 py-2 dark:border-slate-800">
      <h2 className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        Rendered markup, last assistant message
      </h2>
      <table data-testid="markdown-probe" className="w-full text-left text-[11px]">
        <tbody className="font-mono">
          {rows.length === 0 && (
            <tr>
              <td className="py-1 text-slate-500">
                nothing rendered yet — send a message asking for a heading and a
                link
              </td>
            </tr>
          )}
          {rows.map((r) => (
            <tr
              key={r.tag}
              className="border-t border-slate-200 first:border-0 dark:border-slate-800"
            >
              <th className="w-10 py-1 pr-2 align-top font-medium text-slate-500">
                {r.tag}
              </th>
              <td
                data-testid={`markdown-probe-${r.tag}`}
                className="break-all py-1 text-slate-700 dark:text-slate-300"
              >
                {r.attrs || "(no attributes)"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Page() {
  const [level, setLevel] = useState<Level>("components");
  const active = LEVELS.find((l) => l.id === level)!;
  const scope = useRef<HTMLDivElement>(null);

  return (
    <DemoFrame parentPath="/custom-look-and-feel/markdown" subtitle={active.blurb}>
      <div className="flex h-full flex-col">
        <div className="flex shrink-0 flex-wrap gap-2 border-b border-slate-200 p-3 dark:border-slate-800">
          {LEVELS.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setLevel(l.id)}
              className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                level === l.id
                  ? "border-[var(--accent)] text-[var(--accent)]"
                  : "border-slate-300 text-slate-600 hover:border-slate-400 dark:border-slate-600 dark:text-slate-300"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        <div ref={scope} className="min-h-0 flex-1">
          {level === "components" && (
            // [1] markdown: restyle individual HTML tags
            <CopilotChat
              key="components"
              messageView={{
                assistantMessage: {
                  markdownRenderer: {
                    /* [!code highlight] */
                    components: {
                      a: ({ node, children, ...props }) => (
                        <a {...props} className="my-link">
                          {children}
                        </a>
                      ),
                      h2: ({ node, children, ...props }) => (
                        <h2 {...props} className="my-heading">
                          {children}
                        </h2>
                      ),
                    },
                  },
                },
              }}
              labels={{
                welcomeMessageText:
                  "Level 1 — a and h2 come from the components map. Ask for a heading and a link.",
              }}
            />
          )}

          {level === "classes" && (
            // [2] markdown: restyle the whole markdown block
            /* [!code highlight] */
            <CopilotChat
              key="classes"
              messageView={{
                assistantMessage: { markdownRenderer: "text-sm leading-7" },
              }}
              labels={{
                welcomeMessageText:
                  "Level 2 — one class string merged onto the markdown container.",
              }}
            />
          )}

          {level === "replace" && (
            /* [!code highlight] */
            <CopilotChat
              key="replace"
              messageView={{ assistantMessage: { markdownRenderer: PlainText } }}
              labels={{
                welcomeMessageText:
                  "Level 3 — Streamdown is gone. The raw markdown renders in a pre.",
              }}
            />
          )}
        </div>

        <MarkupProbe scope={scope} level={level} />
      </div>
    </DemoFrame>
  );
}
