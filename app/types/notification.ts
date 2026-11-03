export type NotificationType =
  | "new_article"
  | "article_published"
  | "post_liked"
  | "new_request"
  | "request_accepted"
  | "request_declined"
  | "request_expiring"
  | "request_expired"
  | "new_message"
  | "reply_reminder"
  | "unread_client_message"
  | "chat_expiring"
  | "chat_expiry_warning"
  | "daily_chat_limit"
  | "review_request"
  | "new_review"
  | "new_follower"
  | "verification_update"
  | "service_request_received"
  | "subscription_activated"
  | "subscription_renewed"
  | "subscription_expiring_soon"
  | "subscription_expired"
  | "payment_failed"
  | "payment_method_updated"
  | "post_removed"
  | "report_reviewed"
  | "system"
  | string;

export interface NotificationArticle {
  title: string;
  slug: string;
  readCount: number;
  publishedAt: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  readAt: string | null;
  createdAt: string;
  // Rendered by the backend for every notification (single source of copy).
  title?: string;
  body?: string;
  /** Absolute deep link. */
  url?: string;
  /** Frontend-relative path. */
  path?: string;
  payload: {
    actorName?: string;
    actorId?: string;
    message?: string;
    article?: NotificationArticle;
    conversationId?: string;
    // ── New notification types ──
    expiresAt?: string; // chat_expiring, request_expiring
    requestId?: string; // request_expiring, request_expired
    messageId?: string; // reply_reminder, unread_client_message
    // Articles / posts
    postId?: string; // article_published, post_liked
    authorName?: string; // article_published
    // Requests
    matter?: string; // new_request
    reason?: string; // request_declined, event_promotion_rejected, verification_update
    // Reviews
    reviewId?: string; // new_review
    rating?: number; // new_review
    // Verification
    status?: string; // verification_update, support_ticket_updated
    // Service requests
    serviceRequestId?: string; // service_request_received
    serviceType?: string; // service_request_received
    stage?: string; // service_request_received
    // Membership / billing
    planName?: string; // subscription_activated, subscription_renewed
    periodEnd?: string; // subscription_activated, subscription_renewed
    currentPeriodEnd?: string; // subscription_expiring_soon
    invoiceNumber?: string; // subscription_activated, subscription_renewed
    subscriptionCode?: string; // payment_failed
    action?: string; // payment_method_updated
    // System kinds
    // support_ticket_*, event_promotion_* (approved | rejected | refunded),
    // announcement; admin-only: payment_dispute_opened, payment_refunded_external
    kind?: string;
    ticketNumber?: number; // support_ticket_*
    subject?: string; // support_ticket_received
    eventId?: string; // event_promotion_*
    title?: string; // event_promotion_*, announcement
    body?: string; // announcement
    refund?: "manual_pending" | "not_applicable" | string; // event_promotion_rejected
    reference?: string; // payment_dispute_opened, payment_refunded_external
    amountKobo?: number | null; // payment_dispute_opened, payment_refunded_external
    dueAt?: string | null; // payment_dispute_opened — Paystack response deadline
    announcementId?: string; // announcement
    [key: string]: unknown;
  };
}

export interface NotificationsResponse {
  data: {
    items: Notification[];
    pagination: {
      // ← was flat fields, now nested
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface UnreadCountResponse {
  data: { count: number };
}
