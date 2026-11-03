// app/Components/Admin/Docket/DocketPage.tsx
// Figma source: On the Docket.png, On the Docket-1.png, On the Docket-2.png
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import AdminPageHeader from "../shared/AdminPageHeader";
import StatCard from "../shared/StatCard";
import StatusBadge from "../shared/StatusBadge";
import TableToolbar from "../shared/TableToolbar";
import TablePagination from "../shared/TablePagination";
import AddEventModal from "./AddEventModal";
import EditEventModal from "./EditEventModal";
import { useAdminEvents, useDocket } from "@/hooks/useAdmin";
import type { AdminEventListItem } from "@/services/admin.services";
import type { DocketEventListItem } from "@/app/types/admin";
import { formatDate, formatNaira } from "../shared/format";

// Matches AdminEventStatus from services/admin.services.ts
const STATUS_OPTIONS = [
  { label: "All Status", value: "" },
  { label: "Draft", value: "draft" },
  { label: "Pending Payment", value: "pending_payment" },
  { label: "Pending Review", value: "pending_review" },
  { label: "Published", value: "published" },
  { label: "Rejected", value: "rejected" },
  { label: "Past", value: "past" },
];

// GET /admin/docket?paymentStatus= — promotions only, since editorial
// events have no payment.
// (TableToolbar renders the empty "All Payments" option itself.)
const PAYMENT_OPTIONS = [
  { label: "Pending", value: "pending" },
  { label: "Paid", value: "paid" },
  { label: "Refunded", value: "refunded" },
];

// One table row, built from either list endpoint.
interface DocketRow {
  key: string;
  title: string;
  organizer: string;
  contact: string;
  startAt?: string;
  endAt?: string;
  status: string;
  amountKobo?: number;
  paymentStatus?: string;
  /** serviceRequest.id — detail/approve/reject/refund are keyed by it. */
  promotionId?: string;
  /** Editorial event (no serviceRequest) to edit directly. */
  editable?: AdminEventListItem;
}

function rowFromEvent(ev: AdminEventListItem): DocketRow {
  const sr = ev.serviceRequest;
  return {
    key: ev.id,
    title: ev.title ?? "Untitled",
    organizer: sr?.account?.fullName ?? sr?.contactName ?? "—",
    contact: sr?.contactEmail ?? "—",
    startAt: ev.startAt,
    endAt: ev.endAt,
    status: ev.status,
    amountKobo: sr?.amount,
    paymentStatus: sr?.paymentStatus,
    promotionId: sr?.id,
    editable: sr?.id ? undefined : ev,
  };
}

function rowFromPromotion(item: DocketEventListItem): DocketRow {
  return {
    key: item.id,
    title: item.event?.title ?? item.payload?.title ?? item.eventName ?? "Untitled",
    organizer: item.account?.fullName ?? item.contactName ?? item.firmName ?? "—",
    contact: item.contactEmail ?? item.account?.email ?? "—",
    startAt: item.event?.startAt ?? item.payload?.startAt,
    endAt: item.event?.endAt ?? item.payload?.endAt,
    status: item.event?.status ?? item.status,
    amountKobo: item.amount,
    paymentStatus: item.paymentStatus,
    promotionId: item.id,
  };
}

// status pill labels per the API notes: pending_review→Pending, published→Approved, rejected→Rejected
function statusLabel(status: string) {
  switch (status) {
    case "pending_review":
      return "Pending";
    case "published":
      return "Approved";
    case "rejected":
      return "Rejected";
    case "pending_payment":
      return "Pending Payment";
    case "draft":
      return "Draft";
    case "past":
      return "Past";
    default:
      return status;
  }
}

export default function DocketPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AdminEventListItem | null>(null);

  // GET /admin/events has no payment filter, so while one is set the table
  // switches to GET /admin/docket, which lists promotions only and has no
  // text search. Promotions are never drafts, so that combination is empty.
  const byPayment = !!paymentStatus;
  const eventsQuery = useAdminEvents({
    page,
    limit: 8,
    q: search,
    status,
  });
  const docketQuery = useDocket(
    { page, limit: 8, paymentStatus, eventStatus: status },
    byPayment && status !== "draft",
  );

  const active = byPayment ? docketQuery : eventsQuery;
  const isLoading = active.isLoading && active.fetchStatus !== "idle";
  const rows: DocketRow[] = byPayment
    ? status === "draft"
      ? []
      : (docketQuery.data?.items ?? []).map(rowFromPromotion)
    : (eventsQuery.data?.items ?? []).map(rowFromEvent);
  // Stat cards always describe all events, not the filtered page.
  const stats = eventsQuery.data?.stats;
  const pagination = active.data?.pagination;

  return (
    <div className="min-h-screen bg-white">
      <AdminPageHeader title="On The Docket" />

      <div className="px-6 md:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard label="Total Events" value={(stats?.totalEvents ?? 0).toLocaleString()} />
          <StatCard label="Pending Events" value={(stats?.pendingEvents ?? 0).toLocaleString()} />
          <StatCard label="Approved Events" value={(stats?.approvedEvents ?? 0).toLocaleString()} />
          <StatCard
            label="Revenue Generated"
            value={formatNaira(((stats?.revenueGeneratedKobo ?? 0) as number) / 100)}
          />
        </div>

        <TableToolbar
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          filters={[
            {
              label: "All Status",
              value: status,
              options: STATUS_OPTIONS,
              onChange: (v) => {
                setStatus(v);
                setPage(1);
              },
            },
            {
              label: "All Payments",
              value: paymentStatus,
              options: PAYMENT_OPTIONS,
              onChange: (v) => {
                setPaymentStatus(v);
                setPage(1);
              },
            },
          ]}
          rightAction={
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium rounded-lg transition-colors"
            >
              <Plus size={15} />
              Add Event
            </button>
          }
        />

        <div className="border border-[#E5E7EB] rounded-xl overflow-x-auto">
          <table className="w-full text-left min-w-225">
            <thead>
              <tr className="bg-gray-50 border-b border-[#E5E7EB]">
                {[
                  "Title",
                  "Firm / Organizer",
                  "Contact",
                  "Start Date",
                  "End Date",
                  "Status",
                  "Payment",
                  "Action",
                ].map((h) => (
                  <th key={h} className="text-[12px] font-semibold text-gray-600 px-5 py-3 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-gray-400">
                    <Loader2 size={16} className="animate-spin inline mr-2" />
                    Loading events...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-gray-400 text-[13px]">
                    No events found.
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const amount =
                    row.amountKobo != null
                      ? `₦${(row.amountKobo / 100).toLocaleString()}`
                      : "—";

                  // Actions for promotion events route through serviceRequest.id,
                  // since /admin/docket/:id (detail/approve/reject) is keyed by
                  // that id, not event.id. Plain editorial events (no
                  // serviceRequest) get a direct Edit action via PATCH /events/:id.
                  const isPending = row.status === "pending_review";

                  return (
                    <tr key={row.key} className="border-b border-[#F3F4F6] last:border-0">
                      <td className="px-5 py-3.5 text-[13px] text-gray-800 whitespace-nowrap">{row.title}</td>
                      <td className="px-5 py-3.5 text-[13px] text-gray-500 whitespace-nowrap">{row.organizer}</td>
                      <td className="px-5 py-3.5 text-[13px] text-gray-700 whitespace-nowrap">{row.contact}</td>
                      <td className="px-5 py-3.5 text-[13px] text-gray-700 whitespace-nowrap">
                        {row.startAt ? formatDate(row.startAt) : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-gray-700 whitespace-nowrap">
                        {row.endAt ? formatDate(row.endAt) : "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={statusLabel(row.status)} />
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-gray-700 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span>{amount}</span>
                          {row.paymentStatus && (
                            <StatusBadge status={row.paymentStatus} />
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {row.promotionId ? (
                          <button
                            onClick={() => router.push(`/admin/docket/${row.promotionId}`)}
                            className={`px-4 py-1.5 rounded-lg text-[12.5px] font-medium whitespace-nowrap transition-colors ${
                              isPending
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {isPending ? "Take Action" : "View Details"}
                          </button>
                        ) : row.editable ? (
                          <button
                            onClick={() => setEditingEvent(row.editable!)}
                            className="px-4 py-1.5 rounded-lg text-[12.5px] font-medium whitespace-nowrap border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            Edit
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          <TablePagination
            page={pagination?.page ?? 1}
            totalPages={pagination?.totalPages ?? 1}
            onChange={setPage}
          />
        </div>
      </div>

      {showAddModal && <AddEventModal onClose={() => setShowAddModal(false)} />}
      {editingEvent && (
        <EditEventModal event={editingEvent} onClose={() => setEditingEvent(null)} />
      )}
    </div>
  );
}