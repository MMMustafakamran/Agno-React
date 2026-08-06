"use client";

import { CopilotChat } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

/**
 * The `offerOptions` interrupt renders inside the message stream.
 *
 * Its `useHumanInTheLoop` registration lives at the app root alongside the
 * other browser-executed tools; this route is just a chat to trigger it in.
 */
export default function Page() {
  return (
    <DemoFrame
      parentPath="/human-in-the-loop"
      subtitle="the run pauses until you pick an option"
    >
      <CopilotChat
        labels={{
          welcomeMessageText:
            "Ask me to suggest two options for something — I'll let you pick.",
        }}
      />
    </DemoFrame>
  );
}
