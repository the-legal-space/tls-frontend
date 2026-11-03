// services/admin.services.ts

import { api } from "./api";
import {
  AdminDashboardData, // will be updated
  AdminUserStats, // will be updated
  AccountListItem,
  AdminUserListItem,
  AdminUserDetail,
  SubscriptionsData, // will be updated
  SubscriptionPlan,
  DocketStats, // will be removed or merged
  DocketEventListItem,
  DocketEventDetail,
  CreateEventPayload,
  TlsServiceListItem,
  TlsServiceDetail,
  TlsServiceStatus,
  SupportTicketListItem,
  SupportTicketDetail,
  TicketStatus,
  LegalNewsSurveyData,
  AnalyticsData, // will be split
  PlatformAnnouncement,
  EmailTemplate, // will be removed
  Pagination,
} from "@/app/types/admin";

// ---- New response shapes ----

// Dashboard
export interface DashboardCards {
  totalRevenueKobo: number;
  totalUsers: number;
  activeSubscribers: number;
  newEnquiriesThisWeek: number;
  onTheDocket: number;
}

export interface PendingTasks {
  serviceEnquiries: number;
  lawyerVerifications: number;
  eventsNeedReview: number;
}

export interface RecentActivity {
  kind: "service_request" | "payment" | "verification" | "event" | "other";
  title: string;
  description: string;
  at: string;
}

export interface DashboardData {
  cards: DashboardCards;
  activeSubscribers: number;
  newEnquiriesThisWeek: number;
  pendingTasks: PendingTasks;
  recentActivities: RecentActivity[];

  onTheDocket: number;
  totalRevenueKobo: number;
  totalUsers: number;
}

// Users
export interface UserStats {
  totalUsers: number;
  lawyers: number;
  lawFirms: number;
  clients: number;
  verifiedLawyers: number;
  suspendedUsers: number;
}

// Subscriptions
export interface SubscriptionsMetrics {
  stats: any;
  activeSubscribers: number;
  monthlyRevenueKobo: number;
  allTimeRevenueKobo: number;
  churnRate: number;
  churnApproximate: boolean;
  plans: SubscriptionPlan[];
}

// Docket (Events) - combined stats and list in one response
export interface DocketListResponse {
  items: DocketEventListItem[];
  stats: DocketStats; // totalEvents, pendingEvents, approvedEvents, revenueGeneratedKobo
  pagination: Pagination;
}

// ---- All-events list (GET /admin/events) ----
// Unlike GET /admin/docket (promotion-only, keyed by serviceRequest.id), this
// lists the Event table directly — every event, any status, keyed by
// event.id. `serviceRequest` is present only when the event is a promotion
// (organizer + payment live there); it's null/undefined for a plain
// editorial event.
export type AdminEventStatus =
  | "draft"
  | "pending_payment"
  | "pending_review"
  | "published"
  | "rejected"
  | "past";

export interface AdminEventServiceRequest {
  id: string;
  paymentStatus: string;
  amount: number; // kobo
  contactName?: string;
  contactEmail?: string;
  payload?: {
    payment?: {
      reference?: string;
      paidAt?: string;
    };
    [key: string]: any;
  };
  account?: {
    id: string;
    fullName: string;
    role: string;
  };
}

export interface AdminEventListItem {
  id: string;
  title: string;
  status: AdminEventStatus;
  coverUrl?: string;
  startAt: string;
  endAt: string;
  registrationUrl?: string;
  clickCount: number;
  createdAt: string;
  serviceRequest?: AdminEventServiceRequest | null;
}

export interface AdminEventsListResponse {
  items: AdminEventListItem[];
  stats: DocketStats; // same four cards as the docket endpoint, but counting all events
  pagination: Pagination;
}

// TLS Services (service-requests)
export interface ServiceRequestListItem {
  id: string;
  type:
    | "website"
    | "appointment"
    | "productivity"
    | "consulting"
    | "event_promotion";
  status:
    | "new"
    | "in_progress"
    | "lead_lost"
    | "closed"
    | "pending"
    | "active"
    | "completed";
  paymentStatus?: string;
  amount: number; // in kobo
  contactEmail: string;
  contactName?: string;
  event?: {
    id: string;
    title: string;
    status: string;
    startAt: string;
    endAt: string;
    coverUrl: string;
    registrationUrl: string;
    clickCount: number;
  };
  payload?: any;
  account?: {
    id: string;
    fullName: string;
    role: string;
  };
  createdAt: string;
}

export interface ServiceRequestStats {
  totalEvents?: number;
  pendingEvents?: number;
  approvedEvents?: number;
  revenueGeneratedKobo?: number;
  // for inquiries we might have different stats, but not specified
}

// Support
export interface SupportListResponse {
  items: SupportTicketListItem[];
  stats: {
    totalTickets: number;
    openTickets: number;
    closedTickets: number;
  };
  pagination: Pagination;
}

// Legal News Survey
export interface LegalNewsSurveyStats {
  totalResponses: number;
  yesResponses: number;
  noResponses: number;
  participationRate: number;
  breakdownByUserType: {
    lawyers: { count: number; percentage: number };
    lawFirms: { count: number; percentage: number };
    // maybe clients too?
  };
  topFeatureRequests: { feature: string; votes: number }[];
  responseDistribution: {
    answer: "yes" | "no" | "maybe";
    count: number;
    percentage: number;
  }[];
}

// Announcements
export interface Announcement {
  id: string;
  title: string;
  body: string;
  audience: "all" | "lawyers" | "firms" | "clients";
  status: "draft" | "scheduled" | "sent";
  recipientCount?: number;
  sentAt?: string;
  isActive: boolean;

  createdAt: string;
  updatedAt: string;
}

// ---- Admin Service ----

// ---- SCN disputes (GET /admin/scn-disputes) ----
export type ScnDisputeStatus =
  | "open"
  | "resolved_claimant"
  | "resolved_existing"
  | "dismissed";

export interface ScnDisputeEvidence {
  id: string;
  docType: string;
  label: string;
  /** Signed link, expires after 15 minutes. Use as-is; never store it. */
  url: string;
  createdAt: string;
}

export interface ScnDisputeItem {
  id: string;
  caseReference: string;
  scn: string;
  status: ScnDisputeStatus;
  claimantStatement: string | null;
  resolutionNote: string | null;
  createdAt: string;
  reviewedAt: string | null;
  evidence: ScnDisputeEvidence[];
  claimant: {
    id: string;
    fullName: string;
    email: string;
    barFullName: string | null;
    verificationStatus: string | null;
    identityCheckStatus: string | null;
  };
  existingAccount: {
    id: string;
    fullName: string;
    email: string;
    barFullName: string | null;
    verificationStatus: string | null;
  };
}

export const adminService = {
  // Dashboard
  getDashboard: () =>
    api.get<{ data: DashboardData }>("/admin/metrics/dashboard"),

  // Users
  getUserStats: () => api.get<{ data: UserStats }>("/admin/metrics/users"),

  getUsers: (params: {
    role?: string;
    status?: string;
    verificationStatus?: string;
    q?: string;
    page?: number;
    limit?: number;
  }) =>
    api.get<{ data: { items: AccountListItem[]; pagination: Pagination } }>(
      "/admin/accounts",
      { params },
    ),

  // We may not need a separate getUserById, but keep for compatibility;
  // if needed, we can fetch from list or add endpoint if exists.
  getUserById: (accountId: string) =>
    api.get<{ data: AccountListItem }>(`/admin/accounts/${accountId}`), // not in reference, but may exist

  // Verification documents
  getVerificationDocuments: (accountId: string) =>
    api.get<{
      data: {
        items: {
          id: string;
          docType: string;
          status: string;
          url: string;
          createdAt: string;
        }[];
      };
    }>(`/admin/accounts/${accountId}/verification-documents`),

  // SCN impersonation disputes
  getScnDisputes: (params: { page?: number; limit?: number; status?: string }) => {
    const cleaned: Record<string, string | number> = {};
    if (params.status) cleaned.status = params.status;
    if (params.page != null) cleaned.page = params.page;
    if (params.limit != null) cleaned.limit = params.limit;
    return api.get<{
      data: { items: ScnDisputeItem[]; pagination: Pagination };
    }>("/admin/scn-disputes", { params: cleaned });
  },
  resolveScnDispute: (
    id: string,
    body: {
      outcome: Exclude<ScnDisputeStatus, "open">;
      note?: string;
    },
  ) => api.post(`/admin/scn-disputes/${id}/resolve`, body),

  // User actions
  approveLawyer: (accountId: string, reason?: string) =>
    api.post(`/admin/kyc/${accountId}/approve`, { reason }),
  rejectLawyer: (accountId: string, reason?: string) =>
    api.post(`/admin/kyc/${accountId}/reject`, { reason }),
  suspendUser: (accountId: string, reason: string) =>
    api.patch(`/admin/accounts/${accountId}/suspend`, { reason }),
  reactivateUser: (accountId: string, reason?: string) =>
    api.patch(`/admin/accounts/${accountId}/unsuspend`, { reason }),

  // Subscriptions
  getSubscriptions: () =>
    api.get<{ data: SubscriptionsMetrics }>("/admin/metrics/subscriptions"),

  getPlans: () => api.get<{ data: SubscriptionPlan[] }>("/admin/plans"),

  updatePlan: (planId: string, payload: Partial<SubscriptionPlan>) =>
    api.patch(`/admin/plans/${planId}`, payload),

  // On the Docket (Events) — promotion-only list, kept for existing consumers
  // (detail page, approve/reject — all keyed by serviceRequest.id).
  getDocket: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    eventStatus?: string;
    paymentStatus?: string;
  }) => {
    // Same caution as getEvents: the backend 400s on empty enum values.
    const cleaned: Record<string, string | number> = {};
    if (params?.status) cleaned.status = params.status;
    if (params?.eventStatus) cleaned.eventStatus = params.eventStatus;
    if (params?.paymentStatus) cleaned.paymentStatus = params.paymentStatus;
    if (params?.page != null) cleaned.page = params.page;
    if (params?.limit != null) cleaned.limit = params.limit;
    return api.get<{ data: DocketListResponse }>("/admin/docket", {
      params: cleaned,
    });
  },

  // All events (any status, editorial + promotion) — keyed by event.id.
  // Used for the main Docket table so non-promotion events show up too.
  getEvents: (params?: {
    status?: string;
    q?: string;
    page?: number;
    limit?: number;
  }) => {
    // Backend validates `status` against a fixed enum and 400s on status=""
    // (Fastify treats an empty string as an invalid value, not "no filter").
    // Same caution applied to `q`. Only send params that actually have a value.
    const cleaned: Record<string, string | number> = {};
    if (params?.status) cleaned.status = params.status;
    if (params?.q) cleaned.q = params.q;
    if (params?.page != null) cleaned.page = params.page;
    if (params?.limit != null) cleaned.limit = params.limit;

    return api.get<{ data: AdminEventsListResponse }>("/admin/events", {
      params: cleaned,
    });
  },

  // Direct event edit (admin) — PATCH /events/:id, note: different base path
  // than /admin/events. Works for any event, including plain editorial ones
  // that have no serviceRequest. Also used to reactivate an event by
  // PATCHing status back to "published".
  updateEvent: (
    eventId: string,
    payload: Partial<{
      title: string;
      description: string;
      location: string;
      startAt: string;
      endAt: string;
      registrationUrl: string;
      status: "draft" | "published" | "past";
    }>,
  ) => api.patch(`/events/${eventId}`, payload),

  getDocketEvent: (eventId: string) =>
    api.get<{ data: DocketEventDetail }>(`/admin/docket/${eventId}`),

  approveEvent: (eventId: string) =>
    api.post(`/admin/docket/${eventId}/approve`),

  rejectEvent: (eventId: string, reason?: string) =>
    api.post(`/admin/docket/${eventId}/reject`, { reason }),

  // Record a refund that was paid by hand (usually a bank transfer arranged
  // through a support ticket). Idempotent: a second call answers 200 with
  // "Refund was already recorded"; 400 if the promotion was never paid.
  refundDocketItem: (
    id: string,
    body: { note?: string; refundReference?: string },
  ) => api.post<{ message: string }>(`/admin/docket/${id}/refund`, body),

  createEvent: (payload: CreateEventPayload) => {
    const form = new FormData();
    if (payload.flyer) form.append("flyer", payload.flyer);
    form.append("eventName", payload.eventName);
    form.append("startAt", payload.startAt);
    form.append("endAt", payload.endAt);
    form.append("shareOnSocial", payload.shareOnSocial ? "true" : "false");
    form.append("links", payload.links || "");
    if (payload.contactName) form.append("contactName", payload.contactName);
    if (payload.contactEmail) form.append("contactEmail", payload.contactEmail);
    if (payload.contactPhone) form.append("contactPhone", payload.contactPhone);
    if (payload.firmName) form.append("firmName", payload.firmName);
    // Note: also include address? The API reference shows address in payload but not in create form; maybe we add it.
    return api.post("/admin/docket", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // TLS Services (service-requests)
  getServiceRequests: (params?: {
    type?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) =>
    api.get<{
      data: {
        items: ServiceRequestListItem[];
        pagination: Pagination;
        stats?: any;
      };
    }>("/admin/service-requests", { params }),

  getServiceRequest: (id: string) =>
    api.get<{ data: import("@/app/types/admin").TlsServiceDetail }>(
      `/admin/service-requests/${id}`,
    ),

  updateServiceRequestStatus: (
    id: string,
    status: TlsServiceStatus,
    note?: string,
  ) => api.patch(`/admin/service-requests/${id}`, { status, note }),

  // Support Center
  getSupportTickets: (params?: {
    status?: string;
    category?: string;
    q?: string;
    page?: number;
    limit?: number;
  }) =>
    api.get<{ data: SupportListResponse }>("/admin/support/tickets", {
      params,
    }),

  getSupportTicket: (id: string) =>
    api.get<{ data: SupportTicketDetail }>(`/admin/support/tickets/${id}`),

  updateSupportTicketStatus: (id: string, status: TicketStatus) =>
    api.patch(`/admin/support/tickets/${id}`, { status }),

  // Legal News Survey
  getLegalNewsSurvey: () =>
    api.get<{ data: LegalNewsSurveyStats }>("/admin/surveys/legal-news/stats"),

  // Analytics
  getSearchInsights: (days = 30, limit = 10) =>
    api.get<{
      data: {
        windowDays: number;
        topQueries: { query: string; count: number }[];
      };
    }>("/admin/metrics/search", { params: { days, limit } }),

  getAnalytics: (days = 30) =>
    api.get<{
      data: {
        dailyActiveUsers: number;
        monthlyActiveUsers: number;
        dauTrendPct?: number;
        series?: any[];
      };
    }>("/admin/metrics/analytics", { params: { days } }),

  // Revenue
  getRevenue: (months = 12, page = 1, limit = 12) =>
    api.get<{ data: import("@/app/types/admin").RevenueData }>(
      "/admin/metrics/revenue",
      {
        params: { months, page, limit },
      },
    ),

  // Announcements
  getAnnouncements: (params?: { page?: number; limit?: number }) =>
    api.get<{ data: { items: Announcement[]; pagination: Pagination } }>(
      "/admin/announcements",
      { params },
    ),

  getEmailTemplates: () =>
    api.get<{ data: import("@/app/types/admin").EmailTemplate[] }>(
      "/admin/email-templates",
    ),

  createAnnouncement: (payload: {
    title: string;
    body: string;
    audience: "all" | "lawyers" | "firms" | "clients";
    sendNow?: boolean;
    scheduledAt?: string;
  }) => api.post("/admin/announcements", payload),

  sendAnnouncement: (id: string) => api.post(`/admin/announcements/${id}/send`),

  // Moderation
  deletePost: (postId: string) => api.delete(`/admin/posts/${postId}`),

  deleteReview: (reviewId: string) => api.delete(`/admin/reviews/${reviewId}`),

  // ── Post Reports Queue ──

  getReportQueue: (params?: {
    status?: "pending" | "actioned" | "dismissed";
    reason?: string;
    autoHiddenOnly?: boolean;
    page?: number;
    limit?: number;
  }) =>
    api.get<{
      data: import("@/app/types/admin").ReportQueueResponse;
    }>("/admin/reports/posts", { params }),

  getReportedPost: (postId: string) =>
    api.get<{
      data: import("@/app/types/admin").ReportedPostDetail;
    }>(`/admin/reports/posts/${postId}`),

  takeReportAction: (
    postId: string,
    payload: import("@/app/types/admin").ReportActionPayload,
  ) => api.post(`/admin/reports/posts/${postId}/action`, payload),

  getAuditLog: (params?: {
    action?: string;
    targetType?: string;
    adminAccountId?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }) => api.get("/admin/audit-log", { params }),
};
