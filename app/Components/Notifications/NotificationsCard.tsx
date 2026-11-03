"use client";

import {
  FileText,
  MessageSquare,
  AlertTriangle,
  ShieldAlert,
  UserPlus,
  Star,
  CheckCircle,
  XCircle,
  Bell,
  BookOpen,
  Calendar,
  Clock,
  Heart,
  ShieldCheck,
  BadgeCheck,
  RefreshCw,
  CreditCard,
  Megaphone,
  CalendarCheck,
  ClipboardCheck,
  Flag,
  ThumbsUp,
  RotateCcw,
} from "lucide-react";
import { Notification, NotificationType } from "@/app/types/notification";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getNotificationMeta(notif: Notification): {
  icon: React.ReactNode;
  label: string;
} {
  const type = notif.type;
  const kind = notif.payload.kind;
  // System notifications are distinguished by payload.kind, not type.
  switch (kind) {
    case "support_ticket_received":
      return { icon: <BookOpen size={15} />, label: "Support Ticket Received" };
    case "support_ticket_updated":
      return {
        icon: <CheckCircle size={15} />,
        label: "Support Ticket Updated",
      };
    case "event_promotion_approved":
      return {
        icon: <CalendarCheck size={15} />,
        label: "Event Promotion Approved",
      };
    case "event_promotion_rejected":
      return { icon: <XCircle size={15} />, label: "Event Promotion Rejected" };
    case "event_promotion_refunded":
      return {
        icon: <RotateCcw size={15} />,
        label: "Event Promotion Refunded",
      };
    // Admin alerts
    case "payment_dispute_opened":
      return {
        icon: <AlertTriangle size={15} className="text-red-500" />,
        label: "Payment Dispute — Urgent",
      };
    case "payment_refunded_external":
      return { icon: <CreditCard size={15} />, label: "Payment Refunded" };
    case "announcement":
      return { icon: <Megaphone size={15} />, label: "Announcement" };
    case "post_restored":
      return { icon: <RotateCcw size={15} />, label: "Post Restored" };
  }
  switch (type) {
    case "new_article":
    case "article_published":
      return { icon: <FileText size={15} />, label: "New Article" };
    case "post_liked":
      return { icon: <Heart size={15} />, label: "Post Liked" };
    case "new_message":
      return { icon: <MessageSquare size={15} />, label: "New Message" };
    case "chat_expiry_warning":
      return {
        icon: <AlertTriangle size={15} />,
        label: "Chat Expiry Warning",
      };
    case "daily_chat_limit":
      return {
        icon: <ShieldAlert size={15} />,
        label: "Daily Chat Limit Reached",
      };
    case "new_follower":
      return { icon: <UserPlus size={15} />, label: "New Follower" };
    case "new_review":
      return { icon: <Star size={15} />, label: "New Review" };
    case "new_request":
      return { icon: <UserPlus size={15} />, label: "New Request" };
    case "request_accepted":
      return { icon: <CheckCircle size={15} />, label: "Request Accepted" };
    case "request_declined":
      return { icon: <XCircle size={15} />, label: "Request Declined" };
    case "request_expired":
      return { icon: <XCircle size={15} />, label: "Request Expired" };
    case "chat_expiring":
      return { icon: <Clock size={15} />, label: "Chat Expiring Soon" };
    case "request_expiring":
      return { icon: <Clock size={15} />, label: "Lead Expiring Soon" };
    case "reply_reminder":
      return { icon: <MessageSquare size={15} />, label: "Reply Reminder" };
    case "unread_client_message":
      return {
        icon: <AlertTriangle size={15} />,
        label: "Unread Client Message",
      };
    case "review_request":
      return { icon: <Star size={15} />, label: "Review Request" };
    case "verification_update":
      return {
        icon: <ShieldCheck size={15} />,
        label: "Verification Update",
      };
    case "service_request_received":
      return {
        icon: <ClipboardCheck size={15} />,
        label: "Service Request Received",
      };
    case "subscription_activated":
      return { icon: <BadgeCheck size={15} />, label: "Membership Activated" };
    case "subscription_renewed":
      return { icon: <RefreshCw size={15} />, label: "Membership Renewed" };
    case "subscription_expiring_soon":
      return {
        icon: <Clock size={15} />,
        label: "Membership Expiring Soon",
      };
    case "subscription_expired":
      return { icon: <XCircle size={15} />, label: "Membership Expired" };
    case "payment_failed":
      return { icon: <XCircle size={15} />, label: "Payment Failed" };
    case "payment_method_updated":
      return {
        icon: <CreditCard size={15} />,
        label: "Payment Method Updated",
      };
    case "post_removed":
      return { icon: <XCircle size={15} />, label: "Post Removed" };
    case "report_reviewed":
      return { icon: <Flag size={15} />, label: "Report Reviewed" };
    default:
      return { icon: <Bell size={15} />, label: "Notification" };
  }
}

function ArticlePreview({
  article,
}: {
  article: NonNullable<Notification["payload"]["article"]>;
}) {
  return (
    <a
      href={`/articles/${article.slug}`}
      className="mt-3 flex items-center gap-3 rounded-xl border border-gray-200 p-3 hover:bg-white transition"
    >
      <div className="w-12 h-12 rounded-lg bg-gray-900 flex flex-col items-center justify-center shrink-0">
        <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400">
          Article
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-gray-900 leading-snug truncate">
          {article.title}
        </p>
        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-gray-400 flex-wrap">
          <span className="flex items-center gap-1">
            <Calendar size={10} />
            {formatDate(article.publishedAt)}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen size={10} />
            {article.readCount} Reads
          </span>
          <span className="ml-auto text-blue-600 font-medium flex items-center gap-1">
            <FileText size={10} />
            Read Article
          </span>
        </div>
      </div>
    </a>
  );
}

function getBodyText(notif: Notification): {
  primary: string | React.ReactNode;
  secondary?: string;
} {
  const actor = notif.payload.actorName;

  switch (notif.type) {
    case "new_article":
    case "article_published":
      return {
        primary: (
          <>
            <span className="text-blue-600 font-medium">
              {actor || "A lawyer you follow"}
            </span>{" "}
            published a new article.
          </>
        ),
        secondary:
          "Stay informed with insights that may be relevant to your situation.",
      };
    case "post_liked":
      return {
        primary: "Someone liked your post.",
        secondary: "Open your post to see who reacted.",
      };
    case "new_message":
      return {
        primary: (
          <>
            <span className="text-blue-600 font-medium">{actor}</span> has
            responded to your request.
          </>
        ),
        secondary:
          "Open the conversation to review their message and continue when you're ready.",
      };
    case "chat_expiry_warning":
      return {
        primary:
          "If you don't engage in a conversation for 7 days, it will be deleted. Keep chatting to keep it alive!",
      };
    case "daily_chat_limit":
      return {
        primary: "You've hit your daily limit for starting new conversations.",
        secondary:
          "You can chat with up to 3 lawyers each day to prevent spam requests. Feel free to continue your existing chats or try again tomorrow.",
      };
    case "new_follower":
      return {
        primary: (
          <>
            <span className="text-blue-600 font-medium">{actor}</span> started
            following you.
          </>
        ),
      };
    case "new_review":
      return {
        primary: (
          <>
            <span className="text-blue-600 font-medium">{actor}</span> left you
            a review.
          </>
        ),
      };
    case "new_request": {
      const matter = notif.payload.matter as string | undefined;
      return {
        primary: "You have a new client request.",
        secondary: matter
          ? `Matter: ${matter}`
          : "A client wants to connect with you.",
      };
    }
    case "request_accepted":
      return {
        primary: (
          <>
            <span className="text-blue-600 font-medium">{actor}</span> accepted
            your request.
          </>
        ),
        secondary: "You can now start a conversation with them.",
      };
    case "request_declined": {
      const reason = notif.payload.reason as string | undefined;
      return {
        primary: (
          <>
            <span className="text-blue-600 font-medium">{actor}</span> declined
            your request.
          </>
        ),
        // A decline returns the match slot, so they can be matched again now.
        secondary: reason
          ? `Reason: ${reason}. You can be matched with another lawyer now.`
          : "You can be matched with another lawyer now.",
      };
    }
    case "request_expired":
      return {
        primary: "Your request expired without a response.",
        secondary: "You can create a new request to find another lawyer.",
      };
    case "chat_expiring": {
      const when = notif.payload.expiresAt;
      return {
        primary: "One of your conversations is about to be archived.",
        secondary: when
          ? `Chats archive after 14 days of inactivity. Send a message before ${formatDate(when)} to keep it active.`
          : "Chats archive after 14 days of inactivity. Send a message to keep it active.",
      };
    }
    case "request_expiring": {
      const when = notif.payload.expiresAt;
      return {
        primary: "A lead is about to expire.",
        secondary: when
          ? `Respond before ${formatDate(when)} so you don't lose it.`
          : "Respond soon so you don't lose it.",
      };
    }
    case "reply_reminder":
      return {
        primary: "You have an unread message waiting for your reply.",
        secondary: "Open the conversation to read it and respond.",
      };
    case "unread_client_message":
      return {
        primary: "A client is still waiting to hear from you.",
        secondary:
          "You have an unread client message — reply to keep the conversation moving.",
      };
    case "review_request":
      return {
        primary: "How was your experience?",
        secondary: "Leave a review for your recent conversation.",
      };
    case "verification_update": {
      const status = notif.payload.status as string | undefined;
      const reason = notif.payload.reason as string | undefined;
      if (status === "verified") {
        return {
          primary: "Your account has been verified.",
          secondary: "You can now enjoy the full TLS experience.",
        };
      }
      return {
        primary: "Your verification status has changed.",
        secondary: reason ? `Reason: ${reason}` : "Please review your details.",
      };
    }
    case "service_request_received": {
      const serviceType = notif.payload.serviceType as string | undefined;
      return {
        primary: "We've received your service request.",
        secondary: serviceType
          ? `Service: ${serviceType.replace(/_/g, " ")}`
          : "Our team will be in touch shortly.",
      };
    }
    case "subscription_activated": {
      const planName = notif.payload.planName as string | undefined;
      return {
        primary: "Your membership is now active.",
        secondary: planName ? `Plan: ${planName}` : "Welcome aboard!",
      };
    }
    case "subscription_renewed": {
      const planName = notif.payload.planName as string | undefined;
      return {
        primary: "Your membership has been renewed.",
        secondary: planName
          ? `Plan: ${planName}`
          : "Thanks for staying with us.",
      };
    }
    case "subscription_expiring_soon": {
      const when = notif.payload.currentPeriodEnd as string | undefined;
      return {
        primary: "Your membership expires soon.",
        secondary: when
          ? `Renew before ${formatDate(when)} to keep your benefits.`
          : "Renew to keep your benefits.",
      };
    }
    case "subscription_expired":
      return {
        primary: "Your membership has expired.",
        secondary: "Renew your membership to regain access.",
      };
    case "payment_failed":
      return {
        primary: "A payment for your membership failed.",
        secondary: "Please update your payment method to avoid interruption.",
      };
    case "payment_method_updated":
      return {
        primary: "Your payment method has been updated.",
        secondary: "Future charges will use your new payment details.",
      };
    case "post_removed": {
      const reason = notif.payload.reason as string | undefined;
      return {
        primary: "Your post was removed after a review.",
        secondary: reason
          ? `Reason: ${reason}`
          : "One of your posts was taken down.",
      };
    }
    case "report_reviewed": {
      return {
        primary: "A post you reported has been reviewed.",
        secondary: "Thanks for helping keep The Legal Space professional.",
      };
    }
    default: {
      // System notifications are distinguished by payload.kind.
      const kind = notif.payload.kind;
      const ticketNumber = notif.payload.ticketNumber as number | undefined;
      if (kind === "support_ticket_received") {
        const subject = notif.payload.subject as string | undefined;
        return {
          primary: `Your support ticket${
            ticketNumber ? ` #${ticketNumber}` : ""
          } has been received.`,
          secondary: subject
            ? `Subject: ${subject}`
            : "Our team will get back to you shortly.",
        };
      }
      if (kind === "support_ticket_updated") {
        const status = notif.payload.status as string | undefined;
        return {
          primary: `Your support ticket${
            ticketNumber ? ` #${ticketNumber}` : ""
          } has been updated.`,
          secondary: status
            ? `Status: ${status.replace(/_/g, " ")}`
            : "Check your support ticket for the latest update.",
        };
      }
      if (kind === "event_promotion_approved") {
        const title = notif.payload.title as string | undefined;
        return {
          primary: "Your event promotion was approved.",
          secondary: title ? `Event: ${title}` : "Your event is now published.",
        };
      }
      if (kind === "event_promotion_rejected") {
        // The backend body carries the reason and, for a paid promotion,
        // ends with "Contact support to arrange your refund".
        if (notif.body) {
          const title = notif.payload.title as string | undefined;
          return {
            primary: notif.body,
            secondary: title ? `Event: ${title}` : undefined,
          };
        }
        const title = notif.payload.title as string | undefined;
        const reason = notif.payload.reason as string | undefined;
        return {
          primary: "Your event promotion was rejected.",
          secondary: [
            title ? `Event: ${title}` : undefined,
            reason ? `Reason: ${reason}` : undefined,
          ]
            .filter(Boolean)
            .join(" · "),
        };
      }
      // New kinds: the backend renders the copy, so show its body as-is
      // (its title just repeats the label above).
      if (kind === "payment_dispute_opened") {
        // Paystack sets a response deadline; past it the dispute is lost.
        const dueAt = notif.payload.dueAt as string | undefined;
        return {
          primary: notif.body ?? "A customer disputed a payment.",
          secondary: dueAt
            ? `Respond by ${new Date(dueAt).toLocaleString("en-GB", {
                dateStyle: "medium",
                timeStyle: "short",
              })}`
            : undefined,
        };
      }
      if (
        kind === "event_promotion_refunded" ||
        kind === "payment_refunded_external"
      ) {
        return { primary: notif.body ?? "A payment was refunded." };
      }
      if (kind === "post_restored") {
        const snippet = notif.payload.snippet as string | undefined;
        return {
          primary: "Your post is back.",
          secondary: snippet
            ? `"${snippet}" was reviewed and is visible again.`
            : "Your post was reviewed and is visible again — no action needed.",
        };
      }
      if (kind === "announcement") {
        const title = notif.payload.title as string | undefined;
        const body = notif.payload.body as string | undefined;
        return {
          primary: title || "New announcement from The Legal Space.",
          secondary: body,
        };
      }
      return {
        primary:
          notif.payload.message ??
          notif.body ??
          "You have a new notification.",
      };
    }
  }
}

interface Props {
  notification: Notification;
  onMarkRead: (id: string) => void;
}

export default function NotificationCard({ notification, onMarkRead }: Props) {
  const { icon, label } = getNotificationMeta(notification);
  const { primary, secondary } = getBodyText(notification);
  const isUnread = !notification.readAt;

  function handleClick() {
    if (isUnread) onMarkRead(notification.id);
  }

  return (
    <div
      onClick={handleClick}
      className={`relative px-4 md:px-5 py-4 cursor-pointer transition hover:bg-white/60 ${
        isUnread ? "bg-white" : "bg-white/30"
      }`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <div className="flex items-center gap-2">
          {isUnread && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-0.5" />
          )}
          <span className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-900">
            {icon}
            {label}
          </span>
        </div>
        <span className="text-[11px] text-gray-400 shrink-0">
          {timeAgo(notification.createdAt)}
        </span>
      </div>

      {/* Body */}
      <div className="text-[13px] text-gray-600 leading-relaxed">
        <p>{primary}</p>
        {secondary && <p className="mt-0.5 text-gray-500">{secondary}</p>}
      </div>

      {/* Article preview */}
      {notification.payload.article && (
        <ArticlePreview article={notification.payload.article} />
      )}

      {/* Full-width divider — breaks out of px padding */}
      <span className="absolute bottom-0 left-0 right-0 h-px bg-[#E5E7EB]" />
    </div>
  );
}
