// app/Components/Admin/shared/StatusBadge.tsx
"use client";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-50 text-green-700",
  approved: "bg-green-50 text-green-700",
  closed: "bg-green-50 text-green-700",
  completed: "bg-green-50 text-green-700",
  "under review": "bg-amber-50 text-amber-700",
  under_review: "bg-amber-50 text-amber-700",
  pending: "bg-amber-50 text-amber-700",
  "in progress": "bg-amber-50 text-amber-700",
  in_progress: "bg-amber-50 text-amber-700",
  new: "bg-blue-50 text-blue-700",
  open: "bg-red-50 text-red-600",
  suspended: "bg-red-50 text-red-600",
  rejected: "bg-red-50 text-red-600",
  deleted: "bg-gray-50 text-gray-500",
  failed: "bg-red-50 text-red-600",
  "lead lost": "bg-red-50 text-red-600",
  lead_lost: "bg-red-50 text-red-600",
  // Event-specific statuses
  draft: "bg-gray-50 text-gray-600",
  pending_payment: "bg-amber-50 text-amber-700",
  pending_review: "bg-blue-50 text-blue-700",
  published: "bg-green-50 text-green-700",
  past: "bg-gray-50 text-gray-500",
  // Payment statuses
  paid: "bg-green-50 text-green-700",
  refunded: "bg-violet-50 text-violet-700",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  approved: "Approved",
  closed: "Closed",
  completed: "Completed",
  pending: "Pending",
  new: "New",
  open: "Open",
  suspended: "Suspended",
  rejected: "Rejected",
  under_review: "Under Review",
  deleted: "Deleted",
  failed: "Failed",
  in_progress: "In Progress",
  lead_lost: "Lead Lost",
  // Event-specific labels
  draft: "Draft",
  pending_payment: "Pending Payment",
  pending_review: "Pending Review",
  published: "Published",
  past: "Past",
  paid: "Paid",
  refunded: "Refunded",
};

export default function StatusBadge({ status }: { status: string }) {
  const normalized = String(status).trim();
  const lower = normalized.toLowerCase();
  const style =
    STATUS_STYLES[normalized] ??
    STATUS_STYLES[lower] ??
    "bg-gray-100 text-gray-600";
  const displayStatus =
    STATUS_LABELS[normalized] ?? STATUS_LABELS[lower] ?? normalized;
  const dotColor = style.includes("green")
    ? "bg-green-500"
    : style.includes("amber")
      ? "bg-amber-500"
      : style.includes("red")
        ? "bg-red-500"
        : style.includes("blue")
          ? "bg-blue-500"
          : style.includes("violet")
            ? "bg-violet-500"
            : "bg-gray-400";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium ${style}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {displayStatus}
    </span>
  );
}
