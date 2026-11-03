// app/types/admin.ts
// Shared types for the Admin module (/admin/*).
// Mirrors the response shape used across the rest of the app:
// { error: boolean; message: string; data: T }

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ── Dashboard (API revamp) ─────────────────────────────────────────────────

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

export type RecentActivityKind =
  | "service_request"
  | "payment"
  | "verification"
  | "event"
  | "other";

export interface RecentActivity {
  kind: RecentActivityKind;
  title: string;
  description: string;
  at: string; // ISO 8601
}

export interface AdminDashboardData {
  cards: DashboardCards;
  pendingTasks: PendingTasks;
  recentActivities: RecentActivity[];
}

// Legacy aliases removed — prefer explicit kobo fields in dashboard types

export interface PendingTask {
  id: string;
  label: string;
  count: number;
  href: string;
}

// ── Users ───────────────────────────────────────────────────────────────────

export type AdminUserType = "Lawyer" | "Law Firm" | "Client";
export type AdminUserStatus =
  | "Active"
  | "Under Review"
  | "Suspended"
  | "Failed";

export interface AdminUserStats {
  totalUsers: number;
  lawyers: number;
  lawFirms: number;
  clients: number;
  verifiedLawyers: number;
  suspendedUsers: number;
}

export interface AdminUserListItem {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  userType: AdminUserType;
  subscription: string;
  status: AdminUserStatus;
}

export interface AccountListItem {
  id: string;
  fullName: string;
  email: string;
  subscription: string | null;
  role: "USER" | "LAWYER" | "FIRM" | "ADMIN";
  status: "active" | "suspended" | "deleted" | "under_review";
  membershipTier: "community" | "professional";
  createdAt?: string;
  lawyerProfile?: {
    verificationStatus: "pending" | "under_review" | "verified" | "rejected";
  } | null;
  firmProfile?: {
    verificationStatus: "pending" | "under_review" | "verified" | "rejected";
  } | null;
  phone?: string;
  yearOfCall?: string;
  jurisdiction?: string;
}

export interface AdminUserDetail extends AdminUserListItem {
  phone?: string;
  yearOfCall?: string;
  jurisdiction?: string;
  callToBarDocument?: {
    name: string;
    sizeKb: number;
    url: string;
  } | null;
}

// ── Subscriptions ───────────────────────────────────────────────────────────

export interface SubscriptionPlan {
  id: string;
  code: string;
  name: string; // e.g. "Community Membership", "Professional Membership"
  tier: string;
  forRole: "LAWYER" | "FIRM" | null;
  priceKobo: number;
  intervalMonths: number;
  features: string[];
  isActive: boolean;
  // isLoading: boolean;
  subscriberCount: number;
}

export interface SubscriptionsStats {
  activeSubscribers: number;
  monthlyRevenueKobo: number;
  allTimeRevenueKobo: number;
  churnRate: number;
  churnApproximate: boolean;
}

export interface SubscriptionsData extends SubscriptionsStats {
  plans: SubscriptionPlan[];
}

// ── Revenue ──────────────────────────────────────────────────────────────────

export interface RevenueStats {
  totalRevenueKobo: number;
  totalRevenueGrowth: number;
  revenueThisMonthKobo: number;
  revenueThisMonthGrowth: number;
  subscriptionRevenueKobo: number;
  onTheDocketRevenueKobo: number;
}

export interface MonthlyRevenueRow {
  month: string;
  subscriptionsKobo: number;
  docketKobo: number;
  totalKobo: number;
  growthPct: number | null;
}

export interface RevenueData {
  totalRevenueKobo: number;
  revenueThisMonthKobo: number;
  subscriptionRevenueKobo: number;
  onTheDocketRevenueKobo: number;
  growthThisMonthPct: number | null;
  breakdown: MonthlyRevenueRow[];
}

// ── On the Docket (Events) ───────────────────────────────────────────────────

export type EventStatus =
  | "draft"
  | "pending_payment"
  | "pending_review"
  | "published"
  | "rejected"
  | "past";

export interface DocketStats {
  totalEvents: number;
  pendingEvents: number;
  approvedEvents: number;
  // new API field: revenue in kobo
  revenueGeneratedKobo?: number;
}

export interface DocketEventListItem {
  id: string;
  type:
    | "event_promotion"
    | "website"
    | "appointment"
    | "productivity"
    | "consulting";
  status: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  firmName?: string;
  payload?: {
    endAt: string;
    links: string[];
    title: string;
    startAt: string;
    flyerUrl: string;
    shareOnSocial: boolean;
  };
  amount?: number;
  pricing?: {
    days: number;
    totalKobo: number;
    dailyRateKobo: number;
    socialAddonKobo: number;
  };
  paymentStatus?: string;
  eventId?: string;
  createdAt: string;
  updatedAt: string;
  event?: {
    id: string;
    title: string;
    description?: string | null;
    coverUrl?: string;
    location?: string | null;
    startAt?: string;
    endAt?: string;
    registrationUrl?: string | null;
    status?: string;
    clickCount?: number;
    createdByAdminId?: string | null;
    createdAt?: string;
    updatedAt?: string;
  };
  account?: {
    id: string;
    fullName?: string;
    email?: string;
    role?: string;
  };
  // Backward-compatible fields
  eventName?: string;
  organizerEmail?: string;
  flyerUrl?: string;
  additionalInfoUrl?: string | null;
  startDate?: string;
  endDate?: string;
}

// Recorded refund on a promotion's serviceRequest (payload.refund).
// source "manual": an admin paid it by hand and recorded it via
// POST /admin/docket/:id/refund. "paystack": refunded in the Paystack
// dashboard and recorded by the webhook, so no admin action is needed.
export interface DocketRefund {
  source: "manual" | "paystack";
  reference?: string | null;
  note?: string | null;
  byAdminId?: string | null;
  refundedAt: string;
}

export type DocketPaymentStatus = "pending" | "paid" | "refunded" | string;

export interface DocketEventDetail {
  id: string;
  eventName: string;
  flyerUrl: string;
  additionalInfoUrl?: string | null;
  address: string;
  tlsSocials?: boolean;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  status: EventStatus;
  payment?: {
    amountPaid: number;
    paymentDate: string;
    paymentMethod: string;
    durationLabel: string;
    startDate: string;
    endDate: string;
  };
  amount?: number;
  pricing?: {
    days?: number;
    totalKobo: number;
    dailyRateKobo: number;
    socialAddonKobo: number;
  };
  payload?: {
    endAt: string;
    links: string[];
    title: string;
    startAt: string;
    flyerUrl: string;
    shareOnSocial: boolean;
    refund?: DocketRefund;
  };
  event?: {
    id: string;
    title: string;
    description?: string | null;
    coverUrl?: string;
    location?: string | null;
    startAt?: string;
    endAt?: string;
    registrationUrl?: string | null;
    status?: string;
    clickCount?: number;
    createdByAdminId?: string | null;
    createdAt?: string;
    updatedAt?: string;
  };
  paymentStatus?: string;
  metrics: {
    approximate?: boolean;
    totalViews: number;
    totalClicks: number;
    ctr: number;
    costPerClick?: number;
    costPerClickKobo?: number;
    audience?: {
      byDevice?: { label: string; percent: number }[];
      byGeography?: { label: string; percent: number }[];
      byUserType?: Record<string, { percentage: number }>;
    };
  };
  audience?: {
    byDevice: { label: string; percent: number }[];
    byGeography: { label: string; percent: number }[];
    byUserType: { label: string; percent: number }[];
  };
}

export interface CreateEventPayload {
  eventName: string;
  flyer: File | null;
  startAt: string;
  endAt: string;
  shareOnSocial: Boolean;
  links: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  firmName?: string;
  title: string;
  promotionStartDate: string;
  promotionEndDate: string;
  additionalLink?: string;
}

// ── TLS Services (enquiries / leads) ─────────────────────────────────────────

export type TlsServiceStatus =
  | "new"
  | "in_progress"
  | "lead_lost"
  | "closed"
  | "pending"
  | "active"
  | "completed";

export interface TlsServicesStats {
  totalEnquiries: number;
  newEnquiries: number;
  inProgress: number;
  closed: number;
}

export interface TlsServiceListItem {
  id: string;
  type:
    | "website"
    | "appointment"
    | "productivity"
    | "consulting"
    | "event_promotion";
  status: TlsServiceStatus;
  paymentStatus?: string;
  amount?: number;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  firmName?: string;
  eventId?: string;
  account?: {
    id: string;
    fullName?: string;
    email?: string;
    role?: string;
  };
  createdAt: string;
  updatedAt: string;
  payload?: Record<string, unknown>;
  pricing?: {
    days: number;
    totalKobo: number;
    dailyRateKobo: number;
    socialAddonKobo: number;
  };
  event?: {
    id: string;
    title: string;
    description?: string | null;
    coverUrl?: string;
    location?: string | null;
    startAt?: string;
    endAt?: string;
    registrationUrl?: string | null;
    status?: string;
    clickCount?: number;
    createdByAdminId?: string | null;
    createdAt?: string;
    updatedAt?: string;
  };
}

export interface TlsServiceDetail extends TlsServiceListItem {
  note?: string;
}

// ── Legal News Survey ─────────────────────────────────────────────────────────

export interface SurveyFeatureRequest {
  label: string;
  votes: number;
}

export interface LegalNewsSurveyData {
  question: string;
  totalResponses: number;
  yesResponses: number;
  noResponses: number;
  participationRate: number;
  participationRateGrowth?: number;
  breakdownByUserType: {
    lawyers: { count: number; percentage: number };
    lawFirms: { count: number; percentage: number };
  };
  topFeatureRequests: SurveyFeatureRequest[];
  responseDistribution: {
    answer: string;
    count: number;
    percentage: number;
  }[];
}

// ── Support Center ────────────────────────────────────────────────────────────

export type TicketStatus = "open" | "in_progress" | "closed";

export interface SupportStats {
  totalTickets: number;
  openTickets: number;
  closedTickets: number;
}

export interface SupportTicketListItem {
  id: string;
  ticketNumber: string;
  name: string;
  subject: string;
  dateSubmitted: string;
  status: TicketStatus;
}

export interface SupportTicketDetail {
  id: string;
  ticketRef: string;
  name: string;
  email: string;
  category: string;
  createdAt: string;
  message: string;
  status: TicketStatus;
}

// ── Analytics ──────────────────────────────────────────────────────────────────

export interface AnalyticsData {
  dailyActiveUsers: number;
  dailyActiveUsersGrowth: number;
  monthlyActiveUsers: number;
  monthlyActiveUsersGrowth: number;
  avgSessionDuration: string;
  avgSessionDurationGrowth: string;
  pageViews: number;
  pageViewsGrowth: number;
  mostVisitedPages: { label: string; views: number }[];
  topSearchQueries: { query: string; count: number }[];
  platformStats: {
    desktopUsers: number;
    mobileUsers: number;
    tabletUsers: number;
    avgLoadTime: string;
    bounceRate: number;
    pagesPerSession: number;
  };
}

// ── Announcements ──────────────────────────────────────────────────────────────

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  updatedAt: string;
}

export interface PlatformAnnouncement {
  id: string;
  title: string;
  body: string;
  isActive: boolean;
  scheduledFor?: string | null;
  createdAt: string;
}

// ── Post Reports (Admin Moderation) ────────────────────────────────────────────

export type ReportStatus = "pending" | "actioned" | "dismissed";

export interface ReportReasonsBreakdown {
  misinformation?: number;
  impersonation?: number;
  confidentiality?: number;
  harassment?: number;
  inappropriate?: number;
  spam?: number;
  other?: number;
  [key: string]: number | undefined;
}

export interface ReportRow {
  id: string;
  reason: string;
  details?: string | null;
  reporter?: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
  };
  createdAt: string;
}

export interface ReportedPostItem {
  post: {
    id: string;
    body: string;
    title?: string | null;
    pdfUrl?: string | null;
    authorAccountId: string;
    author: {
      id: string;
      fullName: string;
      avatarUrl?: string | null;
    };
    likeCount: number;
    dislikeCount: number;
    createdAt: string;
    moderationStatus?: "under_review" | null;
  };
  openReportCount: number;
  autoHidden: boolean;
  autoHiddenAt?: string | null;
  reasons: ReportReasonsBreakdown;
  topReason: string;
  topReasonLabel: string;
  firstReportedAt: string;
  lastReportedAt: string;
  reports: ReportRow[];
}

export interface ReportedPostDetail extends ReportedPostItem {
  totalReportCount: number;
  resolvedReports?: (ReportRow & {
    reviewedByAdmin?: string;
    resolutionNote?: string;
  })[];
  authorPriorRemovals: number;
}

export interface ReportQueueStats {
  pendingPosts: number;
  autoHiddenPosts: number;
  pendingReports: number;
  actionedReports: number;
  dismissedReports: number;
  autoHideThreshold: number;
}

export interface ReportQueueResponse {
  items: ReportedPostItem[];
  stats: ReportQueueStats;
  pagination: Pagination;
}

export type ReportAction = "remove" | "dismiss";

export interface ReportActionPayload {
  action: ReportAction;
  reason: string;
}
