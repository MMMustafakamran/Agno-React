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
 * state of your own. Without a license key the drawer renders a locked view in
 * place of the list, which is the expected unlicensed result.
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
