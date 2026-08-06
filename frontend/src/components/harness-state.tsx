"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * App-wide state that the agent can reach through frontend tools, plus the
 * error log the Error Debugging route reads.
 *
 * This lives above the router so a tool call made on /frontend-tools is still
 * visible after navigating away — which is the point of the demo. Page-local
 * state would reset and make the effect look like it never happened.
 */

export const ACCENTS = {
  emerald: "#10b981",
  violet: "#8b5cf6",
  amber: "#f59e0b",
  rose: "#f43f5e",
  sky: "#0ea5e9",
} as const;

export type AccentName = keyof typeof ACCENTS;

export function isAccentName(value: string): value is AccentName {
  return value in ACCENTS;
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  addedAt: number;
}

export interface LoggedError {
  id: string;
  code: string;
  message: string;
  context?: unknown;
  at: number;
}

interface HarnessState {
  accent: AccentName;
  setAccent: (a: AccentName) => void;

  greeting: string | null;
  setGreeting: (g: string | null) => void;

  bookmarks: Bookmark[];
  addBookmark: (title: string, url: string) => Bookmark;
  removeBookmark: (id: string) => void;

  errors: LoggedError[];
  logError: (e: Omit<LoggedError, "id" | "at">) => void;
  clearErrors: () => void;
}

const Ctx = createContext<HarnessState | null>(null);

export function HarnessStateProvider({ children }: { children: ReactNode }) {
  const [accent, setAccent] = useState<AccentName>("emerald");
  const [greeting, setGreeting] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [errors, setErrors] = useState<LoggedError[]>([]);

  const addBookmark = useCallback((title: string, url: string) => {
    const bookmark: Bookmark = {
      id: `bm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      title,
      url,
      addedAt: Date.now(),
    };
    setBookmarks((prev) => [bookmark, ...prev]);
    return bookmark;
  }, []);

  const removeBookmark = useCallback((id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const logError = useCallback((e: Omit<LoggedError, "id" | "at">) => {
    setErrors((prev) =>
      [
        {
          ...e,
          id: `err_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          at: Date.now(),
        },
        // Keep the log bounded; a failing runtime can emit errors continuously.
        ...prev,
      ].slice(0, 50),
    );
  }, []);

  const clearErrors = useCallback(() => setErrors([]), []);

  const value = useMemo(
    () => ({
      accent,
      setAccent,
      greeting,
      setGreeting,
      bookmarks,
      addBookmark,
      removeBookmark,
      errors,
      logError,
      clearErrors,
    }),
    [accent, greeting, bookmarks, addBookmark, removeBookmark, errors, logError, clearErrors],
  );

  return (
    <Ctx.Provider value={value}>
      <div style={{ ["--accent" as string]: ACCENTS[accent] }} className="contents">
        {children}
      </div>
    </Ctx.Provider>
  );
}

export function useHarnessState(): HarnessState {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useHarnessState must be used inside <HarnessStateProvider>");
  }
  return ctx;
}
