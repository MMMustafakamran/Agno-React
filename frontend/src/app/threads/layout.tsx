import { ThreadsProvider } from "@/components/threads-provider";
import type { ReactNode } from "react";

export default function ThreadsLayout({ children }: { children: ReactNode }) {
  return <ThreadsProvider>{children}</ThreadsProvider>;
}
