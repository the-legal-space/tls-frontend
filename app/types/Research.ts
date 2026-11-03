export interface ResearchThread {
    id: string;
    accountId: string;
    title: string;
    pinned: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
  }
  
  export interface ResearchSource {
    title: string;
    url: string;
  }
  
  export interface ResearchAttachment {
    kind: "pdf";
    /** Signed link, expires after 15 minutes. Null on legacy rows; "" while uploading. */
    url: string | null;
    filename: string;
    sizeBytes: number;
  }
  
  export interface ResearchMessage {
    id: string;
    threadId: string;
    role: "user" | "assistant";
    content: string;
    attachments: ResearchAttachment[] | null;
    sources: ResearchSource[] | null;
    confident: boolean | null;
    createdAt: string;
    // Only present on POST response — not persisted, not on reload
    grounded?: boolean;
  }
  
  export interface ResearchThreadDetail extends ResearchThread {
    messages: ResearchMessage[];
  }
  
  export type AssistantOutcome = "confident" | "refusal" | "degraded";
  
  export function classifyAssistant(msg: ResearchMessage): AssistantOutcome {
    if (msg.confident === false) return "refusal";  // B — sources too weak
    if (msg.grounded === false) return "degraded";  // C — PDF path, search down
    return "confident";                             // A — grounded answer
  }