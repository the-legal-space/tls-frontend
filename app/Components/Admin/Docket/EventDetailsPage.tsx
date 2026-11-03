// app/Components/Admin/Docket/EventDetailsPage.tsx
// Figma source: On the Docket-3.png (pending), On the Docket-4.png (approved)
"use client";

import { useState } from "react";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Printer, RotateCcw, X } from "lucide-react";
import StatusBadge from "../shared/StatusBadge";
import StatCard from "../shared/StatCard";
import { formatDate, formatNairaFull } from "../shared/format";
import {
  useDocketEvent,
  useRefundDocketItem,
  useUpdateEventStatus,
} from "@/hooks/useAdmin";
import type { DocketRefund } from "@/app/types/admin";

export default function EventDetailsPage({ eventId }: { eventId: string }) {
  const router = useRouter();
  const { data: event, isLoading } = useDocketEvent(eventId);
  const updateStatus = useUpdateEventStatus();
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  if (isLoading || !event) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400 gap-2">
        <Loader2 size={16} className="animate-spin" />
        Loading event...
      </div>
    );
  }

  async function approve() {
    await updateStatus.mutateAsync({ eventId, status: "Approved" });
  }

  // Refunds are paid by hand (no wallet), then recorded here. Offered for any
  // paid promotion — most often one that has just been rejected.
  const canRefund = event.paymentStatus === "paid";
  const refund = event.payload?.refund;

  return (
    <div className="min-h-screen bg-white">
      <div className="flex items-center justify-between px-6 md:px-8 py-6 border-b border-[#E5E7EB] sticky top-0 bg-white z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admin/docket")}
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="font-[Instrument_Serif] text-[22px] leading-none font-light text-[#1F2937]">
            Event Details
          </h1>
        </div>

        <div className="flex items-center gap-2">
        {canRefund && (
          <button
            onClick={() => setShowRefundModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-[13px] font-semibold transition-colors"
          >
            <RotateCcw size={14} />
            Mark as refunded
          </button>
        )}
        {event.event?.status === "pending_review" &&
        event.status !== "pending_payment" ? (
          <div className="flex items-center gap-2">
            <button
              onClick={approve}
              disabled={updateStatus.isPending}
              className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-[13px] font-semibold transition-colors disabled:opacity-60"
            >
              Approve
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={updateStatus.isPending}
              className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[13px] font-semibold transition-colors disabled:opacity-60"
            >
              Reject
            </button>
          </div>
        ) : (
          <StatusBadge status={event.event?.status ?? event.status} />
        )}
        </div>
      </div>

      <div className="px-6 md:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          {/* Flyer */}
          <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
            <img
              src={event.payload?.flyerUrl}
              alt={`${event.eventName} flyer`}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Ad info */}
          <div className="border border-[#E5E7EB] rounded-xl p-5">
            <h2 className="text-[14px] font-semibold text-gray-900 mb-4">
              Ad Information
            </h2>
            <dl className="flex flex-col gap-3.5 text-[13px]">
              <Row label="Event Name" value={event?.payload?.title ?? ""} />
              {(event.payload?.links?.length ?? 0) > 0 && (
                <Row
                  label="Additional Infrmation"
                  value={
                    <a
                      href={event.payload?.links?.[0] ?? "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Visit Link
                    </a>
                  }
                />
              )}
              {event.tlsSocials !== undefined && (
                <Row
                  label="TLS Socials"
                  value={event.tlsSocials ? "YES" : "NO"}
                />
              )}
              <Row label="Address" value={event.address} />
              <Row label="Name" value={event.contactName} />
              <Row label="Email" value={event.contactEmail} />
              {event.contactPhone && (
                <Row label="Phone" value={event.contactPhone} />
              )}
              <Row
                label="Status"
                value={
                  <StatusBadge status={event.event?.status ?? event.status} />
                }
              />
            </dl>
          </div>

          {/* Payment info */}
          <div className="border border-[#E5E7EB] rounded-xl p-5">
            <h2 className="text-[14px] font-semibold text-gray-900 mb-4">
              Payment Information
            </h2>
            {event.payment ? (
              <dl className="flex flex-col gap-3.5 text-[13px]">
                <Row
                  label="Amount Paid"
                  value={formatNairaFull(event.payment.amountPaid)}
                />
                <Row
                  label="Payment Date"
                  value={formatDate(event.payment.paymentDate)}
                />
                <Row
                  label="Payment Method"
                  value={event.payment.paymentMethod}
                />
                {event.paymentStatus && (
                  <Row
                    label="Payment Status"
                    value={<StatusBadge status={event.paymentStatus} />}
                  />
                )}
                <Row label="Duration" value={event.payment.durationLabel} />
                <Row
                  label="Start Date"
                  value={formatDate(event.payment.startDate)}
                />
                <Row
                  label="End Date"
                  value={formatDate(event.payment.endDate)}
                />
              </dl>
            ) : event.amount != null || event.pricing ? (
              <dl className="flex flex-col gap-3.5 text-[13px]">
                <Row
                  label="Amount"
                  value={formatNairaFull(
                    event.amount != null ? event.amount / 100 : undefined,
                  )}
                />
                <Row
                  label="Payment Status"
                  value={
                    event.paymentStatus ? (
                      <StatusBadge status={event.paymentStatus} />
                    ) : (
                      "—"
                    )
                  }
                />
                {event.pricing ? (
                  <>
                    <Row
                      label="Days"
                      value={event.pricing.days?.toString() ?? "—"}
                    />
                    <Row
                      label="Daily Rate"
                      value={formatNairaFull(event.pricing.dailyRateKobo / 100)}
                    />
                    <Row
                      label="Social Addon"
                      value={formatNairaFull(
                        event.pricing.socialAddonKobo / 100,
                      )}
                    />
                    <Row
                      label="Total"
                      value={formatNairaFull(event.pricing.totalKobo / 100)}
                    />
                  </>
                ) : null}
              </dl>
            ) : (
              <div className="text-[13px] text-gray-500">
                No payment information available.
              </div>
            )}
          </div>
        </div>

        {refund && <RefundDetails refund={refund} />}

        {/* Performance metrics */}
        <div className="border border-[#E5E7EB] rounded-xl p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[14px] font-semibold text-gray-900">
              Performance Metrics
            </h2>
            <button
              onClick={() => window.print()}
              className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50"
            >
              <Printer size={15} />
            </button>
          </div>
          {event.metrics ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard
                label="Total Views"
                value={event.metrics.totalViews?.toLocaleString() ?? "—"}
              />
              <StatCard
                label="Total Clicks"
                value={event.metrics.totalClicks?.toLocaleString() ?? "—"}
              />
              <StatCard
                label="CTR"
                value={
                  event.metrics.ctr != null ? `${event.metrics.ctr}%` : "—"
                }
              />
              <StatCard
                label="Cost Per Click"
                value={formatNairaFull(
                  event.metrics.costPerClickKobo != null
                    ? event.metrics.costPerClickKobo / 100
                    : undefined,
                )}
              />
            </div>
          ) : (
            <div className="text-[13px] text-gray-500">
              No performance metrics available.
            </div>
          )}
        </div>

        {event.metrics?.audience ? (
          <div className="border border-[#E5E7EB] rounded-xl p-5">
            <h2 className="text-[14px] font-semibold text-gray-900 mb-4">
              Audience Breakdown
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <AudienceGroup
                title="By Device"
                items={event.metrics.audience.byDevice ?? []}
              />
              <AudienceGroup
                title="By Geography"
                items={event.metrics.audience.byGeography ?? []}
              />
              <AudienceGroup
                title="By User Type"
                items={
                  event.metrics.audience.byUserType
                    ? Object.entries(event.metrics.audience.byUserType).map(
                        ([key, value]) => ({
                          label:
                            key === "lawFirms"
                              ? "Law Firms"
                              : key
                                  .replace(/([A-Z])/g, " $1")
                                  .replace(/^./, (s) => s.toUpperCase()),
                          percent: value.percentage,
                        }),
                      )
                    : []
                }
              />
            </div>
          </div>
        ) : (
          <div className="border border-[#E5E7EB] rounded-xl p-5 text-[13px] text-gray-500">
            No audience breakdown available.
          </div>
        )}
      </div>

      {showRejectModal && (
        <RejectModal
          docketId={eventId}
          paid={event.paymentStatus === "paid"}
          onClose={() => setShowRejectModal(false)}
        />
      )}

      {showRefundModal && (
        <RefundModal
          docketId={eventId}
          onClose={() => setShowRefundModal(false)}
        />
      )}
    </div>
  );
}

// The backend requires a reason (1–500 chars); it is sent to the organiser.
function RejectModal({
  docketId,
  paid,
  onClose,
}: {
  docketId: string;
  paid: boolean;
  onClose: () => void;
}) {
  const updateStatus = useUpdateEventStatus();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) return;
    setError(null);
    try {
      await updateStatus.mutateAsync({
        eventId: docketId,
        status: "Rejected",
        reason: reason.trim(),
      });
      onClose();
    } catch (err) {
      setError(
        (isAxiosError(err) && err.response?.data?.message) ||
          "Couldn't reject this promotion. Please try again.",
      );
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={!updateStatus.isPending ? onClose : undefined}
      />
      <form
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reject-modal-title"
        className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6"
      >
        <div className="flex items-center justify-between mb-2">
          <h3
            id="reject-modal-title"
            className="text-[16px] font-semibold text-gray-900"
          >
            Reject promotion
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={updateStatus.isPending}
            className="text-gray-400 hover:text-gray-700"
          >
            <X size={16} />
          </button>
        </div>
        <p className="text-[13px] text-gray-500 leading-relaxed mb-5">
          The organiser will see this reason.
          {paid &&
            " They have paid, so they'll be asked to contact support to arrange a refund. Record it here with \"Mark as refunded\" once it's paid."}
        </p>

        <label
          htmlFor="reject-reason"
          className="block text-[12px] font-semibold text-gray-700 mb-1.5"
        >
          Reason
        </label>
        <textarea
          id="reject-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={500}
          rows={3}
          required
          placeholder="e.g. The flyer doesn't match the event details"
          className="w-full mb-4 px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400 resize-none"
        />

        {error && <p className="text-[12px] text-red-500 mb-3">{error}</p>}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={updateStatus.isPending}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-[13px] font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!reason.trim() || updateStatus.isPending}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[13px] font-semibold disabled:opacity-60"
          >
            {updateStatus.isPending && (
              <Loader2 size={14} className="animate-spin" />
            )}
            Reject
          </button>
        </div>
      </form>
    </div>
  );
}

function RefundDetails({ refund }: { refund: DocketRefund }) {
  return (
    <div className="border border-violet-100 bg-violet-50/40 rounded-xl p-5 mb-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[14px] font-semibold text-gray-900">
          Refund Details
        </h2>
        <StatusBadge status="refunded" />
      </div>
      <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 text-[13px]">
        <Row
          label="Recorded via"
          value={
            refund.source === "paystack"
              ? "Paystack dashboard (recorded automatically)"
              : "Manual (recorded by admin)"
          }
        />
        <Row label="Refunded On" value={formatDate(refund.refundedAt)} />
        <Row label="Reference" value={refund.reference || "—"} />
        {refund.source === "manual" && (
          <Row label="Recorded By (admin ID)" value={refund.byAdminId || "—"} />
        )}
        <div className="md:col-span-2">
          <Row label="Note" value={refund.note || "—"} />
        </div>
      </dl>
    </div>
  );
}

function RefundModal({
  docketId,
  onClose,
}: {
  docketId: string;
  onClose: () => void;
}) {
  const refund = useRefundDocketItem();
  const [note, setNote] = useState("");
  const [refundReference, setRefundReference] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      // Both fields are optional; send only what was filled in.
      await refund.mutateAsync({
        id: docketId,
        note: note.trim() || undefined,
        refundReference: refundReference.trim() || undefined,
      });
      // 200 covers both "Refund recorded" and "Refund was already recorded";
      // either way the page refetches and shows the recorded refund.
      onClose();
    } catch (err) {
      setError(
        isAxiosError(err) && err.response?.status === 400
          ? err.response.data?.message ||
              "This promotion was never paid, so there is nothing to refund."
          : "Couldn't record the refund. Please try again.",
      );
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={!refund.isPending ? onClose : undefined}
      />
      <form
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="refund-modal-title"
        className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6"
      >
        <div className="flex items-center justify-between mb-2">
          <h3
            id="refund-modal-title"
            className="text-[16px] font-semibold text-gray-900"
          >
            Mark as refunded
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={refund.isPending}
            className="text-gray-400 hover:text-gray-700"
          >
            <X size={16} />
          </button>
        </div>
        <p className="text-[13px] text-gray-500 leading-relaxed mb-5">
          Record a refund you have already paid to the organiser. The promotion
          will be marked refunded, the event taken down if it is live or
          awaiting review, and the organiser notified.
        </p>

        <label
          htmlFor="refund-reference"
          className="block text-[12px] font-semibold text-gray-700 mb-1.5"
        >
          Refund reference <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <input
          id="refund-reference"
          value={refundReference}
          onChange={(e) => setRefundReference(e.target.value)}
          maxLength={120}
          placeholder="e.g. TRF-20261103-001"
          className="w-full mb-4 px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400"
        />

        <label
          htmlFor="refund-note"
          className="block text-[12px] font-semibold text-gray-700 mb-1.5"
        >
          Note <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <textarea
          id="refund-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="e.g. Refunded by bank transfer, support ticket 1042"
          className="w-full mb-4 px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400 resize-none"
        />

        {error && <p className="text-[12px] text-red-500 mb-3">{error}</p>}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={refund.isPending}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-[13px] font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={refund.isPending}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold disabled:opacity-60"
          >
            {refund.isPending && <Loader2 size={14} className="animate-spin" />}
            Record refund
          </button>
        </div>
      </form>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-gray-400 shrink-0">{label}</dt>
      <dd className="text-gray-800 font-medium text-right">{value}</dd>
    </div>
  );
}

function AudienceGroup({
  title,
  items,
}: {
  title: string;
  items: { label: string; percent: number }[];
}) {
  return (
    <div>
      <p className="text-[11px] tracking-wide text-gray-400 uppercase mb-3">
        {title}
      </p>
      <div className="flex flex-col gap-2.5">
        {items.map((item, index) => (
          <div
            key={`${item.label}-${index}`}
            className="flex items-center justify-between text-[13px]"
          >
            <span className="text-gray-600">{item.label}</span>
            <span className="font-medium text-gray-900">{item.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
