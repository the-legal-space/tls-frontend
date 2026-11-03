"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  Copy,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  ResearchMessage,
  ResearchSource,
  classifyAssistant,
} from "@/app/types/Research";
import { researchService } from "@/services/Research.services";
import { openSignedDocument } from "@/lib/signedDocument";

/** Must match DRAFT_ID in Tlsresearchpage.tsx (thread not yet created). */
const RESEARCH_DRAFT_ID = "__draft__";

// ── Markdown renderer ─────────────────────────────────────────────────────────
function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="text-[16px] font-bold mb-2 mt-4 first:mt-0 text-gray-900">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-[15px] font-semibold mb-2 mt-3 first:mt-0 text-gray-900">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-[14px] font-semibold mb-1 mt-2 first:mt-0 text-gray-800">
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="mb-2.5 last:mb-0 leading-relaxed text-gray-800 text-[14px]">
            {children}
          </p>
        ),
        ul: ({ children }) => (
          <ul className="list-disc pl-5 mb-2.5 space-y-1">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal pl-5 mb-2.5 space-y-1">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="text-gray-800 text-[14px] leading-relaxed">
            {children}
          </li>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-gray-900">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic text-gray-600">{children}</em>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-blue-300 pl-3 my-2.5 text-gray-600 italic text-[13px]">
            {children}
          </blockquote>
        ),
        code({ className, children, ...props }: any) {
          const isInline = !className;
          return isInline ? (
            <code
              className="bg-gray-100 text-blue-700 px-1.5 py-0.5 rounded text-[12px] font-mono"
              {...props}
            >
              {children}
            </code>
          ) : (
            <pre className="bg-gray-100 border border-gray-200 rounded-xl p-3 overflow-x-auto my-2.5">
              <code className="text-[12px] font-mono text-gray-800">
                {children}
              </code>
            </pre>
          );
        },
        table: ({ children }) => (
          <div className="overflow-x-auto my-2.5 rounded-lg border border-gray-200">
            <table className="w-full text-[13px] border-collapse">
              {children}
            </table>
          </div>
        ),
        th: ({ children }) => (
          <th className="text-left px-3 py-2 bg-white border-b border-gray-200 font-semibold text-gray-700">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-3 py-2 border-b border-[#E5E7EB] text-gray-700">
            {children}
          </td>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {children}
          </a>
        ),
        hr: () => <hr className="my-3 border-gray-200" />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

// ── Source chips ──────────────────────────────────────────────────────────────
function SourceChips({ sources }: { sources: ResearchSource[] }) {
  const MAX_VISIBLE = 3;
  const visible = sources.slice(0, MAX_VISIBLE);
  const extra = sources.length - MAX_VISIBLE;

  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-gray-200">
      <span className="text-[11px] text-gray-400 mr-0.5">Sources:</span>
      {visible.map((s, i) => (
        <a
          key={i}
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] rounded-full border border-blue-100 transition"
        >
          {s.title || `Source ${i + 1}`}
          <ExternalLink size={10} />
        </a>
      ))}
      {extra > 0 && (
        <span className="text-[11px] px-2 py-1 bg-gray-100 text-gray-500 rounded-full">
          +{extra}
        </span>
      )}
    </div>
  );
}

// ── Thinking bubble ───────────────────────────────────────────────────────────
export function ThinkingBubble({ hasPdf }: { hasPdf?: boolean }) {
  return (
    <div className="flex gap-3 mb-4">
      <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-white text-[10px] font-bold">TLS</span>
      </div>
      <div className="flex-1">
        <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-2xl rounded-tl-sm">
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
          <span className="text-[12px] text-gray-400">
            {hasPdf
              ? "Scanning document & searching sources…"
              : "Searching legal sources…"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Error bubble ──────────────────────────────────────────────────────────────
export function ErrorBubble({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex gap-3 mb-4">
      <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
        <AlertCircle size={14} className="text-red-500" />
      </div>
      <div className="flex-1">
        <div className="inline-flex flex-col gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-2xl rounded-tl-sm max-w-lg">
          <p className="text-[13px] text-red-700">{message}</p>
          <button
            onClick={onRetry}
            className="self-start flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[12px] rounded-lg transition"
          >
            <RefreshCw size={12} />
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}

// ── PDF attachments ───────────────────────────────────────────────────────────
// Attachment urls are signed links that expire after 15 minutes, so the one
// rendered with the thread may be stale by the time the user clicks. Refetch
// the thread and open the url it returns for the same message and position.
function openAttachment(msg: ResearchMessage, index: number) {
  const filename = msg.attachments?.[index]?.filename;
  return openSignedDocument(async () => {
    const thread = await researchService.getThread(msg.threadId);
    const messages = thread?.messages ?? [];
    const fresh =
      messages.find((m) => m.id === msg.id)?.attachments?.[index] ??
      messages
        .flatMap((m) => m.attachments ?? [])
        .find((a) => a.filename === filename);
    return fresh?.url;
  });
}

// ── Single message ────────────────────────────────────────────────────────────
function MessageBubble({ msg }: { msg: ResearchMessage }) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState<"up" | "down" | null>(null);

  if (msg.role === "user") {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[70%]">
          {msg.attachments?.map((a, i) => {
            const chip = (
              <>
                <span>📄</span>
                <span className="truncate max-w-50">{a.filename}</span>
                <span className="text-blue-400 shrink-0">
                  {(a.sizeBytes / 1024).toFixed(0)} KB
                </span>
              </>
            );
            const chipClass =
              "flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-xl mb-2 text-[12px] text-blue-700";
            // The send response carries only the assistant reply, so a PDF
            // sent this session has no url until the thread is reopened. Once
            // the thread exists, openAttachment finds it by filename. Only a
            // draft that hasn't been saved yet can't be opened.
            if (!a.url && msg.threadId === RESEARCH_DRAFT_ID) {
              return (
                <div key={i} className={chipClass}>
                  {chip}
                </div>
              );
            }
            return (
              <button
                key={i}
                type="button"
                onClick={() => openAttachment(msg, i)}
                title={`Open ${a.filename}`}
                className={`${chipClass} ml-auto hover:bg-blue-100 transition`}
              >
                {chip}
              </button>
            );
          })}
          <div className="px-4 py-2.5 bg-blue-700 text-white rounded-2xl rounded-br-sm text-[14px] leading-relaxed">
            {msg.content}
          </div>
        </div>
      </div>
    );
  }

  // Assistant
  const kind = classifyAssistant(msg);
  const hasSources = msg.sources && msg.sources.length > 0;

  return (
    <div className="flex gap-3 mb-4 group">
      {/* Avatar */}
      <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-white text-[10px] font-bold">TLS</span>
      </div>

      <div className="flex-1 min-w-0">
        <div
          className={`px-4 py-3.5 rounded-2xl rounded-tl-sm text-[14px] border ${
            kind === "refusal"
              ? "bg-amber-50 border-amber-100"
              : "bg-white border-gray-200"
          }`}
        >
          {/* Refusal label */}
          {kind === "refusal" && (
            <div className="flex items-center gap-1.5 mb-2.5 text-[11px] text-amber-600 font-medium">
              <AlertCircle size={12} />
              Low confidence — sources were insufficient
            </div>
          )}

          {/* Markdown content */}
          <MarkdownContent content={msg.content} />

          {/* Sources */}
          {hasSources && kind === "confident" && (
            <SourceChips sources={msg.sources!} />
          )}
        </div>

        {/* Action row */}
        <div className="flex items-center gap-3 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={async () => {
              await navigator.clipboard.writeText(msg.content);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600 transition"
          >
            <Copy size={12} />
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={() => setLiked(liked === "up" ? null : "up")}
            className={`flex items-center gap-1 text-[11px] transition ${
              liked === "up"
                ? "text-green-600"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <ThumbsUp size={12} />
          </button>
          <button
            onClick={() => setLiked(liked === "down" ? null : "down")}
            className={`flex items-center gap-1 text-[11px] transition ${
              liked === "down"
                ? "text-red-500"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <ThumbsDown size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Message list ──────────────────────────────────────────────────────────────
interface Props {
  messages: ResearchMessage[];
  thinking: boolean;
  hasPdf?: boolean;
  error?: { message: string; onRetry: () => void } | null;
}

export default function MessageList({
  messages,
  thinking,
  hasPdf,
  error,
}: Props) {
  return (
    <div className="flex flex-col">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} msg={msg} />
      ))}
      {thinking && <ThinkingBubble hasPdf={hasPdf} />}
      {error && <ErrorBubble message={error.message} onRetry={error.onRetry} />}
    </div>
  );
}
