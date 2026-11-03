"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, Loader2, Pin, Trash2 } from "lucide-react";
import {
  ResearchThread,
  ResearchMessage,
  ResearchThreadDetail,
} from "@/app/types/Research";
import { researchService } from "@/services/Research.services";
import ResearchSidebar from "./Researchsidebar";
import MessageList from "./Messagelist";
import ResearchComposer from "./Researchcomposer";
import ResearchLanding from "./Researchlanding";

type ErrorState = { message: string; onRetry: () => void } | null;

/** Sentinel id for a thread that exists only in the UI and has NOT been
 *  registered on the backend yet. It becomes a real thread on first send. */
const DRAFT_ID = "__draft__";

/** Tell the dashboard Sidebar whether the research thread view is active */
function signalResearchThread(active: boolean) {
  window.dispatchEvent(
    new CustomEvent("research:thread", { detail: { active } }),
  );
}

/** True if this error came from an AbortController cancel, not a real failure. */
function isCancelError(err: any): boolean {
  return (
    err?.code === "ERR_CANCELED" ||
    err?.name === "CanceledError" ||
    err?.name === "AbortError"
  );
}

export default function TLSResearchPage() {
  const [threads, setThreads] = useState<ResearchThread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeIdRef = useRef<string | null>(null);
  const isMountedRef = useRef(true);

  // Tracks the in-flight ask() request so it can be cancelled.
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const [activeThread, setActiveThread] = useState<ResearchThreadDetail | null>(
    null,
  );
  const [messages, setMessages] = useState<ResearchMessage[]>([]);
  const [thinking, setThinking] = useState(false);
  const [pendingPdf, setPendingPdf] = useState<File | null>(null);
  const [error, setError] = useState<ErrorState>(null);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [mobileView, setMobileView] = useState<"sidebar" | "chat">("sidebar");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // ── Load sidebar ──────────────────────────────────────────────────────────
  const loadThreads = useCallback(async () => {
    try {
      const data = await researchService.listThreads();
      if (isMountedRef.current) {
        setThreads(data);
      }
    } catch (err) {
      console.error("Failed to load threads:", err);
    } finally {
      if (isMountedRef.current) {
        setLoadingThreads(false);
      }
    }
  }, []);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  // ── Open a thread ─────────────────────────────────────────────────────────
  const openThread = useCallback(async (id: string) => {
    setActiveId(id);
    activeIdRef.current = id;
    setError(null);
    setLoadingMessages(true);
    setMessages([]);
    setMobileView("chat");
    try {
      const detail = await researchService.getThread(id);
      if (activeIdRef.current === id && isMountedRef.current) {
        setActiveThread(detail);
        setMessages(detail.messages);
      }
    } catch (err) {
      console.error("Failed to open thread:", err);
    } finally {
      if (activeIdRef.current === id && isMountedRef.current) {
        setLoadingMessages(false);
      }
    }
  }, []);

  // ── New thread (DRAFT ONLY) ───────────────────────────────────────────────
  function startDraft() {
    const now = new Date().toISOString();
    const draft: ResearchThreadDetail = {
      id: DRAFT_ID,
      accountId: "",
      title: "New research",
      pinned: false,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      messages: [],
    };
    setActiveId(DRAFT_ID);
    activeIdRef.current = DRAFT_ID;
    setActiveThread(draft);
    setMessages([]);
    setError(null);
    setMobileView("chat");
  }

  // ── Cancel the in-flight request ──────────────────────────────────────────
  function handleCancel() {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;

    if (isMountedRef.current) {
      // Drop the temp/optimistic user message — the user said they might
      // want to change it, so don't leave a half-sent bubble behind.
      setMessages((prev) => prev.filter((m) => !m.id.startsWith("temp-")));
      setThinking(false);
      setPendingPdf(null);
      setError(null);
    }
  }

  // ── Persist the draft on the FIRST message, then send it ──────────────────
  async function persistAndSend(text: string, pdf?: File) {
    setError(null);

    const optimisticUser: ResearchMessage = {
      id: `temp-${Date.now()}`,
      threadId: DRAFT_ID,
      role: "user",
      content: text,
      attachments: pdf
        ? [{ kind: "pdf", url: "", filename: pdf.name, sizeBytes: pdf.size }]
        : null,
      sources: null,
      confident: null,
      createdAt: new Date().toISOString(),
    };

    // Show it instantly — before createThread() has even started.
    setActiveId(DRAFT_ID);
    activeIdRef.current = DRAFT_ID;
    setActiveThread({
      id: DRAFT_ID,
      accountId: "",
      title: "New research",
      pinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
      messages: [],
    });
    setMessages([optimisticUser]);
    setMobileView("chat");
    setThinking(true);
    setPendingPdf(pdf ?? null);

    let thread: ResearchThread;
    try {
      thread = await researchService.createThread();
    } catch (err) {
      console.error("Failed to create thread:", err);
      if (isMountedRef.current) {
        setThinking(false);
        setPendingPdf(null);
        setMessages([]);
        setError({
          message: "Couldn't start a new research thread. Please try again.",
          onRetry: () => persistAndSend(text, pdf),
        });
      }
      return;
    }
    if (!isMountedRef.current) return;

    setThreads((prev) => [thread, ...prev]);
    setActiveId(thread.id);
    activeIdRef.current = thread.id;
    setActiveThread({ ...thread, messages: [] });
    setMessages([{ ...optimisticUser, threadId: thread.id }]);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const assistant = await researchService.ask(
        thread.id,
        text,
        pdf,
        controller.signal,
      );

      if (activeIdRef.current !== thread.id) {
        await loadThreads();
        return;
      }

      if (isMountedRef.current) {
        setMessages((prev) => {
          const withoutTemp = prev.filter((m) => m.id !== optimisticUser.id);
          return [
            ...withoutTemp,
            {
              ...optimisticUser,
              id: `user-${Date.now()}`,
              threadId: thread.id,
            },
            assistant,
          ];
        });
        await loadThreads();
      }
    } catch (err: any) {
      if (isCancelError(err)) {
        // Cancelled deliberately — handleCancel() already cleaned up state.
        return;
      }
      if (activeIdRef.current === thread.id && isMountedRef.current) {
        setMessages((prev) => prev.filter((m) => m.id !== optimisticUser.id));

        if (err?.status === 402) {
          // Out of credits — wire setShowBuyModal(true) here if this page
          // owns that state.
        } else if (err?.status === 503) {
          setError({
            message:
              err.message || "Legal-source search is temporarily unavailable.",
            onRetry: () => doSend(thread.id, text, pdf),
          });
        } else if (err?.status === 429) {
          setError({
            message: "You're sending questions too fast — wait a moment.",
            onRetry: () => doSend(thread.id, text, pdf),
          });
        } else {
          setError({
            message: err?.message || "Something went wrong.",
            onRetry: () => doSend(thread.id, text, pdf),
          });
        }
      }
    } finally {
      abortControllerRef.current = null;
      if (activeIdRef.current === thread.id && isMountedRef.current) {
        setThinking(false);
        setPendingPdf(null);
      }
    }
  }

  // ── Core send (existing, already-registered threads) ──────────────────────
  async function doSend(threadId: string, text: string, pdf?: File) {
    setError(null);
    setThinking(true);
    setPendingPdf(pdf ?? null);

    const optimisticUser: ResearchMessage = {
      id: `temp-${Date.now()}`,
      threadId,
      role: "user",
      content: text,
      attachments: pdf
        ? [{ kind: "pdf", url: "", filename: pdf.name, sizeBytes: pdf.size }]
        : null,
      sources: null,
      confident: null,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUser]);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const assistant = await researchService.ask(
        threadId,
        text,
        pdf,
        controller.signal,
      );

      if (activeIdRef.current !== threadId) {
        const currentThread = threads.find((t) => t.id === threadId);
        if (!currentThread || currentThread.title === "New research") {
          await loadThreads();
        }
        return;
      }

      if (isMountedRef.current) {
        setMessages((prev) => {
          const withoutTemp = prev.filter((m) => m.id !== optimisticUser.id);
          return [
            ...withoutTemp,
            { ...optimisticUser, id: `user-${Date.now()}` },
            assistant,
          ];
        });

        const currentThread = threads.find((t) => t.id === threadId);
        if (!currentThread || currentThread.title === "New research") {
          await loadThreads();
        }
      }
    } catch (err: any) {
      if (isCancelError(err)) {
        // Cancelled deliberately — handleCancel() already cleaned up state.
        return;
      }
      if (activeIdRef.current === threadId && isMountedRef.current) {
        setMessages((prev) => prev.filter((m) => m.id !== optimisticUser.id));

        if (err?.status === 402) {
          // Out of credits — wire setShowBuyModal(true) here if this page
          // owns that state.
        } else if (err?.status === 503) {
          setError({
            message:
              err.message || "Legal-source search is temporarily unavailable.",
            onRetry: () => doSend(threadId, text, pdf),
          });
        } else if (err?.status === 429) {
          setError({
            message: "You're sending questions too fast — wait a moment.",
            onRetry: () => doSend(threadId, text, pdf),
          });
        } else {
          setError({
            message: err?.message || "Something went wrong.",
            onRetry: () => doSend(threadId, text, pdf),
          });
        }
      }
    } finally {
      abortControllerRef.current = null;
      if (activeIdRef.current === threadId && isMountedRef.current) {
        setThinking(false);
        setPendingPdf(null);
      }
    }
  }

  function handleSend(text: string, pdf?: File) {
    // No active thread, or an unsaved draft → register on the backend now,
    // as part of sending the first message.
    if (!activeId || activeId === DRAFT_ID) {
      persistAndSend(text, pdf);
      return;
    }
    doSend(activeId, text, pdf);
  }

  const isThreadActive = !!activeId && !!activeThread;
  // ── Signal sidebar hide/show based on thread active state ───────────────
  useEffect(() => {
    signalResearchThread(isThreadActive);
    return () => signalResearchThread(false); // cleanup on unmount
  }, [isThreadActive]);

  // ── Scroll to bottom ──────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  // ── Cancel any in-flight request when unmounting or switching threads ────
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  // ── Sidebar actions ───────────────────────────────────────────────────────
  // Deleting is permanent on the backend (thread, messages and uploaded PDFs
  // are erased), so a saved thread always goes through the confirm dialog.
  // A draft exists only in the UI and is discarded straight away.
  function handleDelete(id: string) {
    if (id === DRAFT_ID) {
      void deleteThread(id);
      return;
    }
    setDeleteError(null);
    setPendingDeleteId(id);
  }

  async function confirmDelete() {
    if (!pendingDeleteId) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteThread(pendingDeleteId);
      if (isMountedRef.current) setPendingDeleteId(null);
    } catch (err) {
      console.error("Failed to delete thread:", err);
      if (isMountedRef.current) {
        setDeleteError("Couldn't delete this research. Please try again.");
      }
    } finally {
      if (isMountedRef.current) setDeleting(false);
    }
  }

  async function deleteThread(id: string) {
    if (id === DRAFT_ID) {
      if (activeIdRef.current === DRAFT_ID) {
        setActiveId(null);
        activeIdRef.current = null;
        setMessages([]);
        setActiveThread(null);
        setMobileView("sidebar");
      }
      return;
    }
    await researchService.deleteThread(id);
    if (!isMountedRef.current) return;
    setThreads((prev) => prev.filter((t) => t.id !== id));
    if (activeIdRef.current === id) {
      setActiveId(null);
      activeIdRef.current = null;
      setMessages([]);
      setActiveThread(null);
      setMobileView("sidebar");
    }
  }

  async function handleRename(id: string, title: string) {
    if (id === DRAFT_ID) return;
    const updated = await researchService.patchThread(id, { title });
    if (!isMountedRef.current) return;
    setThreads((prev) => prev.map((t) => (t.id === id ? updated : t)));
    if (activeIdRef.current === id && activeThread) {
      setActiveThread({ ...activeThread, title });
    }
  }

  async function handlePin(id: string, pinned: boolean) {
    if (id === DRAFT_ID) return;
    const updated = await researchService.patchThread(id, { pinned });
    if (!isMountedRef.current) return;
    setThreads((prev) =>
      [...prev.map((t) => (t.id === id ? updated : t))].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      }),
    );
  }

  // ── Back to the research landing (exit the current chat) ─────────────────
  function handleBackToLanding() {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setActiveId(null);
    activeIdRef.current = null;
    setActiveThread(null);
    setMessages([]);
    setError(null);
    setMobileView("sidebar");
  }

  // ── Landing suggestion ────────────────────────────────────────────────────
  function handleSuggestion(text: string) {
    persistAndSend(text);
  }

  // ── Landing: always shown when no thread is active ───────────────────────
  if (!isThreadActive) {
    return (
      <div className="flex h-screen bg-white overflow-hidden font-['Geist']">
        <ResearchLanding
          onSuggestion={handleSuggestion}
          onNewThread={startDraft}
          onUploadAndNew={startDraft}
        />
      </div>
    );
  }

  // ── Thread view: sidebar + chat ───────────────────────────────────────────
  return (
    <div className="flex h-screen bg-white overflow-hidden font-['Geist']">
      {pendingDeleteId && (
        <DeleteResearchModal
          deleting={deleting}
          error={deleteError}
          onConfirm={confirmDelete}
          onCancel={() => !deleting && setPendingDeleteId(null)}
        />
      )}

      {/* Sidebar — hidden on mobile when viewing chat */}
      <div
        className={`${
          mobileView === "chat" ? "hidden" : "flex"
        } md:flex flex-col w-full md:w-56 md:min-w-56 shrink-0 border-r border-[#E5E7EB]`}
      >
        <ResearchSidebar
          threads={threads}
          activeId={activeId}
          onSelect={openThread}
          onNew={startDraft}
          onDelete={handleDelete}
          onRename={handleRename}
          onPin={handlePin}
          loading={loadingThreads}
          onBack={handleBackToLanding}
        />
      </div>

      {/* Chat area */}
      <div
        className={`${
          mobileView === "sidebar" ? "hidden" : "flex"
        } md:flex flex-1 flex-col min-w-0`}
      >
        {/* Thread header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#E5E7EB] bg-white shrink-0">
          <div className="flex items-center gap-2">
            {/* Mobile back to sidebar */}
            <button
              onClick={() => setMobileView("sidebar")}
              className="md:hidden w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition mr-1"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-600"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <span className="text-[16px] font-medium text-gray-900 font-['Instrument_Serif'] truncate max-w-sm">
              {activeThread?.title ?? "Research"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                activeId && handlePin(activeId, !activeThread?.pinned)
              }
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] border transition ${
                activeThread?.pinned
                  ? "bg-blue-50 text-blue-700 border-blue-100"
                  : "border-gray-200 text-gray-500 hover:bg-white"
              }`}
            >
              <Pin size={12} />
              {activeThread?.pinned ? "Pinned" : "Pin Research"}
            </button>
            <button
              onClick={() => activeId && handleDelete(activeId)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] border border-gray-200 text-red-500 hover:bg-red-50 hover:border-red-100 transition"
            >
              <Trash2 size={12} />
              Delete Research
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {loadingMessages ? (
            <div className="flex items-center justify-center h-full text-sm text-gray-400">
              <svg
                className="animate-spin mr-2 w-4 h-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
              Loading…
            </div>
          ) : (
            <MessageList
              messages={messages}
              thinking={thinking}
              hasPdf={!!pendingPdf}
              error={error}
            />
          )}
          <div ref={bottomRef} />
        </div>

        {/* Composer */}
        <ResearchComposer
          onSend={handleSend}
          onCancel={handleCancel}
          disabled={thinking}
        />
      </div>
    </div>
  );
}

function DeleteResearchModal({
  deleting,
  error,
  onConfirm,
  onCancel,
}: {
  deleting: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-research-title"
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl p-6"
      >
        <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-5 h-5 text-red-500" />
        </div>
        <h3
          id="delete-research-title"
          className="text-[16px] font-semibold text-gray-900 text-center mb-1"
        >
          Delete this research permanently?
        </h3>
        <p className="text-[13px] text-gray-500 text-center leading-relaxed mb-5">
          The conversation and any documents you uploaded will be erased. This
          can&apos;t be undone.
        </p>
        {error && (
          <p className="text-[12px] text-red-500 text-center mb-3">{error}</p>
        )}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white text-[13px] font-medium rounded-xl transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {deleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" /> Delete permanently
              </>
            )}
          </button>
          <button
            onClick={onCancel}
            disabled={deleting}
            className="w-full py-2.5 bg-white hover:bg-gray-100 text-gray-700 text-[13px] font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
