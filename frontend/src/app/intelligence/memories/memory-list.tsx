"use client";

// Memories & Recall, "React" — the page's `components/memory-list.tsx`,
// verbatim.
//
// The 2026-09-21 sync moved the import from `@copilotkit/react-core` to
// `@copilotkit/react-core/v2`, which is where `useMemories` actually ships. On
// the earlier text this file was TS2305 (no such export at the package root)
// plus a knock-on TS7006, and under Next 16 a Turbopack compile error for any
// route importing it, so it was kept here compiling-by-suppression and imported
// by nothing. Both suppressions and the demo's private copy are gone now: the
// published import is correct, so the demo mounts this file itself.
//
// "use client" is this harness's, not the page's: the page shows a component
// file with no directive, and under the App Router a hook-bearing component has
// to declare one somewhere up the tree. The demo that mounts it is a client
// component already, so this is belt and braces.

// [1] memories: the page's React component
import { useMemories } from "@copilotkit/react-core/v2";

export function MemoryList() {
  const { memories, isLoading, isAvailable, removeMemory } = useMemories();

  if (!isAvailable) return <p>Memory is not available for this runtime.</p>;
  if (isLoading) return <p>Loading memories…</p>;

  return (
    <ul>
      {memories.map((memory) => (
        <li key={memory.id}>
          {memory.content}
          <button type="button" onClick={() => void removeMemory(memory.id)}>
            Forget
          </button>
        </li>
      ))}
    </ul>
  );
}
