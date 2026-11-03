// hooks/useAdmin.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/admin.services";
import {
  EventStatus,
  TlsServiceStatus,
  TicketStatus,
  CreateEventPayload,
  SubscriptionPlan,
} from "@/app/types/admin";
import { SIGNED_URL_REFRESH_MS } from "@/lib/signedDocument";
// import types as needed

const STALE = 1000 * 60 * 2;

// ---- Dashboard ----
export const useAdminDashboard = () =>
  useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: () => adminService.getDashboard().then((r) => r.data.data),
    staleTime: STALE,
  });

// ---- Users ----
export const useAdminUserStats = () =>
  useQuery({
    queryKey: ["admin", "users", "stats"],
    queryFn: () => adminService.getUserStats().then((r) => r.data.data),
    staleTime: STALE,
  });

export const useAdminUsers = (params: {
  role?: string;
  status?: string;
  verificationStatus?: string;
  q?: string;
  page?: number;
  limit?: number;
}) =>
  useQuery({
    queryKey: ["admin", "users", params],
    queryFn: () => adminService.getUsers(params).then((r) => r.data.data),
    staleTime: STALE,
  });

// If we need to fetch a single user by ID (maybe for modal), we can use the list item directly.
// But we keep a hook if needed.
export const useAdminUser = (accountId: string, enabled = true) =>
  useQuery({
    queryKey: ["admin", "users", accountId],
    queryFn: () => adminService.getUserById(accountId).then((r) => r.data.data),
    enabled: enabled && !!accountId,
    staleTime: STALE,
  });

// User actions
export const useAdminUserActions = (accountId: string) => {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    queryClient.invalidateQueries({
      queryKey: ["admin", "accounts", accountId],
    });
  };
  const approve = useMutation({
    mutationFn: (reason: string) =>
      adminService.approveLawyer(accountId, reason),
    onSuccess: invalidate,
  });
  const reject = useMutation({
    mutationFn: (reason: string) =>
      adminService.rejectLawyer(accountId, reason),
    onSuccess: invalidate,
  });
  const suspend = useMutation({
    mutationFn: (reason: string) => adminService.suspendUser(accountId, reason),
    onSuccess: invalidate,
  });
  const reactivate = useMutation({
    mutationFn: (reason: string) =>
      adminService.reactivateUser(accountId, reason),
    onSuccess: invalidate,
  });
  return { approve, reject, suspend, reactivate };
};

export const useAdminVerificationDocuments = (
  accountId: string,
  enabled = true,
) =>
  useQuery({
    queryKey: ["admin", "users", accountId, "verification-documents"],
    queryFn: () =>
      adminService.getVerificationDocuments(accountId).then((r) => r.data.data),
    enabled: enabled && !!accountId,
    // Document urls are signed links that expire after 15 minutes: refetch
    // every time the viewer opens, keep the iframe link fresh while it stays
    // open, and drop the cached links as soon as the viewer closes.
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    refetchInterval: SIGNED_URL_REFRESH_MS,
  });

// ---- SCN disputes ----
// Evidence urls are signed links that expire after 15 minutes, so the list is
// refetched on every visit and its cached links dropped once the page closes.
export const useAdminScnDisputes = (params: {
  page?: number;
  limit?: number;
  status?: string;
}) =>
  useQuery({
    queryKey: ["admin", "scn-disputes", params],
    queryFn: () => adminService.getScnDisputes(params).then((r) => r.data.data),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });

export const useResolveScnDispute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      outcome,
      note,
    }: {
      id: string;
      outcome: "resolved_claimant" | "resolved_existing" | "dismissed";
      note?: string;
    }) => adminService.resolveScnDispute(id, { outcome, note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "scn-disputes"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
};

// ---- Subscriptions ----
export const useAdminSubscriptions = () =>
  useQuery({
    queryKey: ["admin", "subscriptions"],
    queryFn: () => adminService.getSubscriptions().then((r) => r.data.data),
    staleTime: STALE,
  });

// hooks/useAdmin.ts - Update the mutation

export const useUpdateSubscriptionPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      planId,
      payload,
    }: {
      planId: string;
      payload: Omit<Partial<SubscriptionPlan>, "isLoading">; // Exclude isLoading
    }) => adminService.updatePlan(planId, payload).then((r) => r.data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "subscriptions"] }),
  });
};

// ---- On the Docket ----
export const useDocket = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  eventStatus?: string;
  paymentStatus?: string;
  search?: string;
}, enabled = true) =>
  useQuery({
    queryKey: ["admin", "docket", params],
    queryFn: () => adminService.getDocket(params).then((r) => r.data.data),
    enabled,
    staleTime: STALE,
  });

// alias for older name
export const useDocketEvents = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) => useDocket(params);

// New — all events (any status, editorial + promotion), keyed by event.id.
// Use this for the main Docket table so non-promotion events show up too.
// GET /admin/docket (useDocket/useDocketEvents above) is promotion-only and
// still used by anything keyed off serviceRequest.id.
export const useAdminEvents = (params?: {
  status?: string;
  q?: string;
  page?: number;
  limit?: number;
}) =>
  useQuery({
    queryKey: ["admin", "events", params],
    queryFn: () => adminService.getEvents(params).then((r) => r.data.data),
    staleTime: STALE,
  });

// PATCH /events/:id — direct event edit (title, dates, status, etc.).
// Works for any event, including plain editorial ones with no serviceRequest.
// Also used to reactivate an event by PATCHing status back to "published".
export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      payload,
    }: {
      eventId: string;
      payload: Partial<{
        title: string;
        description: string;
        location: string;
        startAt: string;
        endAt: string;
        registrationUrl: string;
        status: "draft" | "published" | "past";
      }>;
    }) => adminService.updateEvent(eventId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "events"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "docket"] });
    },
  });
};

export const useAdminRevenue = (params?: {
  months?: number;
  page?: number;
  limit?: number;
}) =>
  useQuery({
    queryKey: ["admin", "revenue", params],
    queryFn: () =>
      adminService
        .getRevenue(
          params?.months ?? 12,
          params?.page ?? 1,
          params?.limit ?? 12,
        )
        .then((r) => r.data.data),
    staleTime: STALE,
  });

// For stats, we can derive from the above, or keep a separate stats hook that calls the same endpoint with limit=1?
// But the stats are included, so we can use the data from useDocket.
// We'll keep a separate hook for backward compatibility that uses the first page.
export const useDocketStats = () => {
  const { data } = useDocket({ page: 1, limit: 1 });
  return { data: data?.stats };
};

export const useDocketEvent = (eventId: string, enabled = true) =>
  useQuery({
    queryKey: ["admin", "docket", eventId],
    queryFn: () =>
      adminService.getDocketEvent(eventId).then((r) => r.data.data),
    enabled: enabled && !!eventId,
    staleTime: STALE,
  });

export const useApproveEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => adminService.approveEvent(eventId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "docket"] }),
  });
};

export const useUpdateEventStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      eventId,
      status,
      reason,
    }: {
      eventId: string;
      status: "Approved" | "Rejected";
      reason?: string;
    }) => {
      if (status === "Approved") {
        return adminService.approveEvent(eventId);
      }
      return adminService.rejectEvent(eventId, reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "docket"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "events"] });
    },
  });
};

export const useRejectEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, reason }: { eventId: string; reason?: string }) =>
      adminService.rejectEvent(eventId, reason),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "docket"] }),
  });
};

// After a refund the promotion is marked refunded, its event is taken down
// and it stops counting toward revenue, so every view of those is refreshed.
export const useRefundDocketItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      note,
      refundReference,
    }: {
      id: string;
      note?: string;
      refundReference?: string;
    }) =>
      adminService
        .refundDocketItem(id, { note, refundReference })
        .then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "docket"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "events"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "revenue"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateEventPayload) =>
      adminService.createEvent(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "docket"] }),
  });
};

// ---- TLS Services ----
export const useServiceRequests = (params?: {
  type?: string;
  status?: string;
  page?: number;
  limit?: number;
}) =>
  useQuery({
    queryKey: ["admin", "service-requests", params],
    queryFn: () =>
      adminService.getServiceRequests(params).then((r) => r.data.data),
    staleTime: STALE,
  });

// For stats, we can derive from the list or use a separate hook if needed.
export const useTlsServiceStats = () => {
  const { data } = useServiceRequests({ page: 1, limit: 20 });
  // Normalize stats shape to TlsServicesStats expected by UI.
  const serverStats = (data as any)?.stats;
  if (serverStats) {
    return {
      data: {
        totalEnquiries:
          serverStats.totalEnquiries ??
          serverStats.totalEvents ??
          data?.pagination?.total ??
          0,
        newEnquiries:
          serverStats.newEnquiries ?? serverStats.newEnquiriesThisWeek ?? 0,
        inProgress: serverStats.inProgress ?? serverStats.pending ?? 0,
        closed: serverStats.closed ?? serverStats.completed ?? 0,
      },
    };
  }

  // Fallback: compute best-effort stats from the returned items on this page.
  const items = data?.items ?? [];
  const counts = items.reduce(
    (acc, it: any) => {
      const s = it.status;
      if (s === "in_progress" || s === "in-progress") acc.inProgress++;
      if (s === "closed") acc.closed++;
      if (s === "new") acc.newEnquiries++;
      return acc;
    },
    {
      total: data?.pagination?.total ?? items.length,
      newEnquiries: 0,
      inProgress: 0,
      closed: 0,
    },
  );

  return {
    data: {
      totalEnquiries: counts.total,
      newEnquiries: counts.newEnquiries,
      inProgress: counts.inProgress,
      closed: counts.closed,
    },
  };
};

export const useServiceRequest = (id: string, enabled = true) =>
  useQuery({
    queryKey: ["admin", "service-requests", id],
    queryFn: () => adminService.getServiceRequest(id).then((r) => r.data.data),
    enabled: enabled && !!id,
    staleTime: STALE,
  });

export const useUpdateServiceRequestStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      note,
    }: {
      id: string;
      status: TlsServiceStatus;
      note?: string;
    }) => adminService.updateServiceRequestStatus(id, status, note),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["admin", "service-requests"],
      }),
  });
};

// ---- Support Center ----
export const useSupportTickets = (params?: {
  status?: string;
  category?: string;
  q?: string;
  page?: number;
  limit?: number;
}) =>
  useQuery({
    queryKey: ["admin", "support", params],
    queryFn: () =>
      adminService.getSupportTickets(params).then((r) => r.data.data),
    staleTime: STALE,
  });

export const useSupportStats = () => {
  const { data } = useSupportTickets({ page: 1, limit: 1 });
  return { data: data?.stats };
};

export const useSupportTicket = (id: string, enabled = true) =>
  useQuery({
    queryKey: ["admin", "support", id],
    queryFn: () => adminService.getSupportTicket(id).then((r) => r.data.data),
    enabled: enabled && !!id,
    staleTime: STALE,
  });

export const useUpdateSupportTicketStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      ticketId,
      status,
    }: {
      ticketId: string;
      status: TicketStatus;
    }) => adminService.updateSupportTicketStatus(ticketId, status),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "support"] }),
  });
};

// ---- Legal News Survey ----
// hooks/useAdmin.ts - Update the useLegalNewsSurvey hook

// hooks/useAdmin.ts
export const useLegalNewsSurvey = () =>
  useQuery({
    queryKey: ["admin", "legal-news-survey"],
    queryFn: async () => {
      const response = await adminService.getLegalNewsSurvey();
      const data = response.data.data;

      // Transform topFeatureRequests to use 'label' instead of 'feature'
      return {
        ...data,
        topFeatureRequests:
          data.topFeatureRequests?.map((req: any) => ({
            label: req.feature || req.label || "Unknown",
            votes: req.votes || 0,
          })) || [],
      };
    },
    staleTime: STALE,
  });

// ---- Analytics ----
export const useSearchInsights = (days = 30, limit = 10) =>
  useQuery({
    queryKey: ["admin", "analytics", "search", days, limit],
    queryFn: () =>
      adminService.getSearchInsights(days, limit).then((r) => r.data.data),
    staleTime: STALE,
  });

export const useAnalytics = (days = 30) =>
  useQuery({
    queryKey: ["admin", "analytics", days],
    queryFn: () => adminService.getAnalytics(days).then((r) => r.data.data),
    staleTime: STALE,
  });

// ---- Announcements ----
export const useAnnouncements = (params?: { page?: number; limit?: number }) =>
  useQuery({
    queryKey: ["admin", "announcements", params],
    queryFn: () =>
      adminService.getAnnouncements(params).then((r) => r.data.data),
    staleTime: STALE,
  });

export const useEmailTemplates = () =>
  useQuery({
    queryKey: ["admin", "email-templates"],
    queryFn: () => adminService.getEmailTemplates().then((r) => r.data.data),
    staleTime: STALE,
  });

export const usePlatformAnnouncements = () =>
  useQuery({
    queryKey: ["admin", "platform-announcements"],
    queryFn: () =>
      adminService
        .getAnnouncements({ page: 1, limit: 100 })
        .then((r) => r.data.data.items),
    staleTime: STALE,
  });

export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      title: string;
      body: string;
      audience: "all" | "lawyers" | "firms" | "clients";
      sendNow?: boolean;
      scheduledAt?: string;
      isActive: boolean;
    }) => adminService.createAnnouncement(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "announcements"] }),
  });
};

export const useSendAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.sendAnnouncement(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "announcements"] }),
  });
};

// ---- Moderation ----
export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => adminService.deletePost(postId),
    onSuccess: () => {
      // Invalidate any posts lists? Not sure. We'll just invalidate feed or posts.
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: string) => adminService.deleteReview(reviewId),
    onSuccess: () => {
      // Invalidate profile reviews
      queryClient.invalidateQueries({ queryKey: ["profile", "reviews"] });
    },
  });
};

export const useAuditLog = (params?: {
  action?: string;
  targetType?: string;
  adminAccountId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}) =>
  useQuery({
    queryKey: ["admin", "audit-log", params],
    queryFn: () => adminService.getAuditLog(params).then((r) => r.data),
    staleTime: STALE,
  });

// ── Post Reports (Admin Moderation) ──

export const useReportQueue = (params?: {
  status?: "pending" | "actioned" | "dismissed";
  reason?: string;
  autoHiddenOnly?: boolean;
  page?: number;
  limit?: number;
}) =>
  useQuery({
    queryKey: ["admin", "reports", params],
    queryFn: () => adminService.getReportQueue(params).then((r) => r.data.data),
    staleTime: STALE,
  });

export const useReportedPost = (postId: string, enabled = true) =>
  useQuery({
    queryKey: ["admin", "reports", postId],
    queryFn: () =>
      adminService.getReportedPost(postId).then((r) => r.data.data),
    enabled: enabled && !!postId,
    staleTime: STALE,
  });

export const useTakeReportAction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      postId,
      payload,
    }: {
      postId: string;
      payload: import("@/app/types/admin").ReportActionPayload;
    }) => adminService.takeReportAction(postId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
    },
  });
};
