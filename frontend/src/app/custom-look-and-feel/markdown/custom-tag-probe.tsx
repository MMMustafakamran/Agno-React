"use client";

import { CopilotChat } from "@copilotkit/react-core/v2";

/**
 * "Custom tags are not supported", as a standing check. NOTHING IMPORTS THIS
 * FILE, on purpose.
 *
 * The page publishes no code for this section — only the error it says you get:
 *
 *   error TS2353: Object literal may only specify known properties,
 *   and '"reference-chip"' does not exist in type 'Components'.
 *
 * `<reference-chip>` is the page's own example tag, so this is the smallest
 * `components` map that should produce it. Confirmed verbatim on the installed
 * @copilotkit/react-core 1.72.0 / streamdown 1.6.11: the message matched the
 * published text character for character.
 *
 * It is kept as `@ts-expect-error` rather than deleted so the claim stays
 * checked: if a future release starts accepting custom keys the suppression
 * becomes unused and `npx tsc --noEmit` fails here, which is the alarm this
 * page's second half (the runtime sanitizer) cannot raise on its own.
 */
export function CustomTagProbe() {
  return (
    <CopilotChat
      messageView={{
        assistantMessage: {
          markdownRenderer: {
            components: {
              // @ts-expect-error — TS2353: '"reference-chip"' does not exist in
              // type 'Components'. This is the page's stated behaviour, not a
              // defect; the suppression records that it was verified.
              "reference-chip": ({ children }: { children?: React.ReactNode }) => (
                <span className="reference-chip">{children}</span>
              ),
            },
          },
        },
      }}
    />
  );
}
