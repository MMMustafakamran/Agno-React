"use client";

import {
  CopilotChat,
  CopilotChatConfigurationProvider,
  CopilotThreadsDrawer,
} from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

/**
 * The prebuilt drawer beside a chat.
 *
 * Both sit inside one `CopilotChatConfigurationProvider` — that shared
 * configuration is what lets the drawer drive the chat with no active-thread
 * state of your own. The drawer resolves its entitlement through the Runtime,
 * not a provider prop: when the Runtime reports no active entitlement it
 * renders a locked view with an Upgrade link in place of the list and issues no
 * thread requests, which is the expected unlicensed result.
 */
export default function Page() {
  return (
    <DemoFrame
      parentPath="/threads/drawer"
      subtitle="CopilotThreadsDrawer + CopilotChat, zero wiring"
    >
      <CopilotChatConfigurationProvider>
        <div className="flex h-full">
          <CopilotThreadsDrawer />
          <div className="min-w-0 flex-1">
            <CopilotChat />
          </div>
        </div>
      </CopilotChatConfigurationProvider>
    </DemoFrame>
  );
}
