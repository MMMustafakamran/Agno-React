import { readSource } from "@/lib/source";

interface IdePageProps {
  searchParams: Promise<{
    file?: string;
    startLine?: string;
    endLine?: string;
  }>;
}

export default async function IdePage({ searchParams }: IdePageProps) {
  const params = await searchParams;
  const targetFile = params.file ?? "frontend/src/app/quickstart/demo-chat/page.tsx";
  const startLine = params.startLine ? parseInt(params.startLine, 10) : 1;
  const endLine = params.endLine ? parseInt(params.endLine, 10) : 30;

  const source = await readSource(targetFile);
  const codeLines = source.code ? source.code.split("\n") : ["// File not found"];
  const fileName = targetFile.split("/").pop() ?? targetFile;
  const fileExt = fileName.split(".").pop() ?? "";

  const isTsx = fileExt === "tsx";
  const isPython = fileExt === "py";

  const pathParts = targetFile.split("/");

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#1e1e1e] font-sans text-[#cccccc] select-none">
      {/* Hide global CopilotKit floating dev console / inspector on the IDE screen */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            [class*="copilotKitDevConsole"],
            [class*="copilotKitInspector"],
            [aria-label*="Inspector"],
            [class*="devConsole"],
            .copilotKitDevConsole,
            .copilotkit-dev-console {
              display: none !important;
              opacity: 0 !important;
              pointer-events: none !important;
            }
          `,
        }}
      />

      {/* VS Code Title Bar */}
      <header className="flex h-[35px] shrink-0 items-center justify-between border-b border-[#2b2b2b] bg-[#181818] px-3 text-xs text-[#9d9d9d]">
        <div className="flex items-center gap-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#007acc">
            <path d="M18.5 2.5 12 8.5 7 4.5 3.5 6v12L7 19.5l5-4 6.5 6 3-1.5V4l-3-1.5z" />
          </svg>
          <div className="flex items-center gap-1.5 text-[#cccccc]">
            <span className="text-[#858585]">agno</span>
            <span className="text-[#555555]">/</span>
            <span>{targetFile}</span>
            <span className="text-[#858585]">- Visual Studio Code</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[#858585]">
          <span className="cursor-pointer hover:text-white">&#x2500;</span>
          <span className="cursor-pointer hover:text-white">&#x25A1;</span>
          <span className="cursor-pointer hover:text-[#ef4444]">&#x2715;</span>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Activity Bar */}
        <aside className="flex w-[48px] shrink-0 flex-col items-center justify-between border-r border-[#2b2b2b] bg-[#181818] py-2 text-[#858585]">
          <div className="flex flex-col items-center gap-4">
            {/* Explorer (Active) */}
            <div className="relative flex h-10 w-10 items-center justify-center text-white">
              <div className="absolute left-0 top-1 bottom-1 w-[2px] bg-[#007acc]" />
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M4 4h6l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
              </svg>
            </div>
            {/* Search */}
            <div className="flex h-10 w-10 items-center justify-center hover:text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            {/* Source Control */}
            <div className="flex h-10 w-10 items-center justify-center hover:text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <circle cx="18" cy="18" r="3" />
                <circle cx="6" cy="6" r="3" />
                <path d="M18 15V9a9 9 0 0 0-9-9" />
                <path d="M6 9v12" />
              </svg>
            </div>
            {/* Run & Debug */}
            <div className="flex h-10 w-10 items-center justify-center hover:text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M5 3l14 9-14 9V3z" />
              </svg>
            </div>
            {/* Extensions */}
            <div className="flex h-10 w-10 items-center justify-center hover:text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </div>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center hover:text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>
          </div>
        </aside>

        {/* Explorer Sidebar */}
        <div className="flex w-[240px] shrink-0 flex-col border-r border-[#2b2b2b] bg-[#181818] text-xs">
          <div className="flex items-center justify-between px-4 py-2 font-semibold uppercase tracking-wider text-[#bbbbbb]">
            <span>Explorer</span>
            <span className="text-[#858585]">&#x22EF;</span>
          </div>

          <div className="flex items-center gap-1 px-2 py-1 font-bold text-[#e1e1e1]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m6 9 6 6 6-6" />
            </svg>
            <span>AGNO</span>
          </div>

          <div className="flex-1 overflow-y-auto px-2 py-1">
            {/* Tree nodes */}
            <div className="space-y-0.5 font-mono text-xs">
              <div className="flex items-center gap-1.5 py-0.5 text-[#cccccc]">
                <span className="text-[#858585]">▾</span>
                <span className="text-[#dcb67a]">📁 frontend</span>
              </div>
              <div className="flex items-center gap-1.5 py-0.5 pl-3 text-[#cccccc]">
                <span className="text-[#858585]">▾</span>
                <span className="text-[#dcb67a]">📁 src</span>
              </div>
              <div className="flex items-center gap-1.5 py-0.5 pl-6 text-[#cccccc]">
                <span className="text-[#858585]">▾</span>
                <span className="text-[#dcb67a]">📁 app</span>
              </div>

              {/* Active file item */}
              <div className="flex items-center gap-1.5 rounded bg-[#04395e]/60 py-1 pl-8 text-white">
                {isPython ? (
                  <span className="text-[#3b82f6]">🐍</span>
                ) : isTsx ? (
                  <span className="text-[#38bdf8]">⚛</span>
                ) : (
                  <span className="text-[#3b82f6]">📄</span>
                )}
                <span className="truncate font-medium">{fileName}</span>
              </div>

              <div className="flex items-center gap-1.5 py-0.5 text-[#cccccc]">
                <span className="text-[#858585]">▾</span>
                <span className="text-[#dcb67a]">📁 backend</span>
              </div>
              <div className="flex items-center gap-1.5 py-0.5 pl-3 text-[#858585]">
                <span>🐍 agent.py</span>
              </div>
              <div className="flex items-center gap-1.5 py-0.5 pl-3 text-[#858585]">
                <span>🐍 main.py</span>
              </div>
            </div>
          </div>
        </div>

        {/* Code Editor Panel */}
        <main className="flex flex-1 flex-col overflow-hidden bg-[#1e1e1e]">
          {/* Editor Tabs Bar */}
          <div className="flex h-[35px] shrink-0 items-center border-b border-[#2b2b2b] bg-[#181818]">
            <div className="flex h-full items-center gap-2 border-r border-[#2b2b2b] bg-[#1e1e1e] px-3.5 text-xs text-white">
              {isPython ? (
                <span className="text-[#3b82f6]">🐍</span>
              ) : isTsx ? (
                <span className="text-[#38bdf8]">⚛</span>
              ) : (
                <span className="text-[#3b82f6]">📄</span>
              )}
              <span className="font-medium">{fileName}</span>
              <span className="ml-1 cursor-pointer text-[#858585] hover:text-white">&#x2715;</span>
            </div>
          </div>

          {/* Breadcrumbs Bar */}
          <div className="flex h-[24px] shrink-0 items-center gap-1.5 border-b border-[#2b2b2b] bg-[#1e1e1e] px-4 font-mono text-[11px] text-[#858585]">
            {pathParts.map((part, idx) => (
              <span key={idx} className="flex items-center gap-1.5">
                <span className={idx === pathParts.length - 1 ? "text-[#cccccc]" : ""}>
                  {part}
                </span>
                {idx < pathParts.length - 1 && <span>&gt;</span>}
              </span>
            ))}
          </div>

          {/* Code Area with Line Highlighting */}
          <div className="relative flex flex-1 overflow-auto font-mono text-[13px] leading-[21px]">
            {/* Line numbers and code content */}
            <div className="w-full py-2">
              {codeLines.map((line, index) => {
                const lineNum = index + 1;
                const isHighlighted = lineNum >= startLine && lineNum <= endLine;

                return (
                  <div
                    key={lineNum}
                    className={`flex items-center ${
                      isHighlighted
                        ? "border-l-[3px] border-[#007acc] bg-[#264f78]/40 text-white"
                        : "text-[#d4d4d4]"
                    }`}
                  >
                    {/* Line number gutter */}
                    <div
                      className={`w-[58px] shrink-0 pr-4 text-right select-none ${
                        isHighlighted ? "font-semibold text-[#c6c6c6]" : "text-[#858585]"
                      }`}
                    >
                      {lineNum}
                    </div>

                    {/* Code line content */}
                    <div className="flex-1 whitespace-pre pr-6">
                      <span className={isHighlighted ? "text-[#e6edf3]" : "text-[#d4d4d4]"}>
                        {line || " "}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>

      {/* VS Code Bottom Status Bar */}
      <footer className="flex h-[22px] shrink-0 items-center justify-between bg-[#007acc] px-3 text-[11px] text-white">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="18" r="3" />
              <circle cx="6" cy="6" r="3" />
              <path d="M18 15V9a9 9 0 0 0-9-9" />
              <path d="M6 9v12" />
            </svg>
            <span>main*</span>
          </div>
          <div className="flex items-center gap-1 text-[10px]">
            <span>⊗ 0</span>
            <span>⚠ 0</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span>Ln {startLine}, Col 1</span>
          <span>Spaces: 2</span>
          <span>UTF-8</span>
          <span>{isPython ? "Python" : isTsx ? "TypeScript JSX" : "TypeScript"}</span>
          <span>Prettier</span>
        </div>
      </footer>
    </div>
  );
}
