"use client";

import { CopilotChat } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

/**
 * A chat to give the inspector something to inspect.
 *
 * The inspector itself is deliberately NOT mounted here. The provider already
 * renders `<CopilotKitInspector core={copilotkit} />` for us once
 * `showDevConsole` is on, and that `core` is the whole point — the component
 * signature is `({ core, ...rest })` and it forwards `core ?? null`, so a
 * hand-mounted `<CopilotKitInspector />` with no props attaches to nothing and
 * renders "CopilotKit core not attached".
 */
export default function Page() {
  return (
    <DemoFrame
      parentPath="/custom-look-and-feel/inspector"
      subtitle="provider-mounted overlay, anchored to the viewport edge"
    >
      <CopilotChat
        labels={{
          welcomeMessageText:
            "Send a message, then open the inspector docked at the edge of the window.",
        }}
      />
    </DemoFrame>
  );
}
