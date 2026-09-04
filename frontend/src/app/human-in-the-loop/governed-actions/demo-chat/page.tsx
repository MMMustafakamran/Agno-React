"use client";

import { CopilotChat } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

/**
 * Governed Action Approval UI.
 *
 * As with the other browser-executed tools in this repo, the
 * `approve_governed_action` registration lives at the app root in
 * `global-frontend-tools.tsx`; this route is a chat to trigger it in. The card
 * it renders is `components/governed-action-card.tsx`, which is the page's
 * component unchanged.
 */
export default function Page() {
  return (
    <DemoFrame
      parentPath="/human-in-the-loop/governed-actions"
      subtitle="the run waits on your verdict"
    >
      <CopilotChat
        labels={{
          welcomeMessageText:
            'Try "Send an invoice reminder to acme@example.com — ask me to approve it first."',
        }}
      />
    </DemoFrame>
  );
}
