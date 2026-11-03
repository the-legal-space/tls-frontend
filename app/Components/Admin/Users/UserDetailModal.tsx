// app/Components/Admin/Users/UserDetailModal.tsx
// Figma source: Users-2.png (lawyer pending), Users-3.png (lawyer active),
// Users-4.png (lawyer suspended), Users-5.png (client active), Users-6.png (client suspended)
"use client";

import { useState } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  GraduationCap,
  MapPin,
  Eye,
  Loader2,
} from "lucide-react";
import { AdminUserDetail, AccountListItem } from "@/app/types/admin";
import { openSignedDocument } from "@/lib/signedDocument";
import {
  useAdminUserActions,
  useAdminVerificationDocuments,
} from "@/hooks/useAdmin";
import { getDisplayStatus } from "@/app/utils/adminStatus";

interface Props {
  user: AdminUserDetail | AccountListItem;
  onClose: () => void;
}

function Field({
  icon: Icon,
  value,
  locked = false,
}: {
  icon: React.ElementType;
  value: string;
  locked?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3.5 py-2.5">
      <Icon size={15} className="text-gray-400 shrink-0" />
      <span className="text-[13px] text-gray-700 truncate flex-1">{value}</span>
      {locked && <span className="text-gray-300 text-[13px]">🔒</span>}
    </div>
  );
}

export default function UserDetailModal({ user, onClose }: Props) {
  const { approve, reject, suspend, reactivate } = useAdminUserActions(user.id);
  const docsQuery = useAdminVerificationDocuments(user.id);
  const [pending, setPending] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const hasReason = reason.trim().length > 0;

  const fullName =
    "firstName" in user ? `${user.firstName} ${user.lastName}` : user.fullName;
  const nameParts = fullName.split(" ");
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ") || "";

  const userType =
    "userType" in user
      ? user.userType
      : user.role === "LAWYER"
        ? "Lawyer"
        : user.role === "FIRM"
          ? "Law Firm"
          : user.role === "USER"
            ? "Client"
            : "Client";

  // `under_review` lives on the satellite profile (lawyerProfile / firmProfile
  // `.verificationStatus`), not on the account row, so the review state has to
  // be derived — reading `user.status` alone always reported "active".
  const displayStatus = getDisplayStatus(user);
  const accountStatus = user.status.toString().toLowerCase().replace(/ /g, "_");

  const isLawyerOrFirm = userType === "Lawyer" || userType === "Law Firm";
  const isClientUser = userType === "Client";
  const isActive = accountStatus === "active";
  const isSuspended = accountStatus === "suspended";
  const isUnderReview = displayStatus === "under_review";
  // Approve/Reject is the only decision available while a professional is
  // under review, so don't stack a Suspend button on top of it.
  const canSuspend = isActive && !isUnderReview;

  const phone = "phone" in user ? user.phone : undefined;
  const yearOfCall = "yearOfCall" in user ? user.yearOfCall : undefined;
  const jurisdiction = "jurisdiction" in user ? user.jurisdiction : undefined;

  async function run(action: "approve" | "reject" | "suspend" | "reactivate") {
    if (!hasReason) {
      return;
    }

    setPending(action);
    try {
      if (action === "approve") await approve.mutateAsync(reason);
      if (action === "reject") await reject.mutateAsync(reason);
      if (action === "suspend") await suspend.mutateAsync(reason);
      if (action === "reactivate") await reactivate.mutateAsync(reason);
      onClose();
    } finally {
      setPending(null);
    }
  }

  const isBusy = pending !== null;

  return (
    <div className="fixed inset-0 z-1000000001 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm z-1000000000"
        onClick={!isBusy ? onClose : undefined}
      />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6 z-1000000000 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full border border-gray-200 text-[13px] font-medium text-gray-700">
            {userType}
          </span>
          <button
            onClick={onClose}
            disabled={isBusy}
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <Field icon={User} value={firstName} />
          <Field icon={User} value={lastName} />
        </div>

        <div className="mb-3">
          <Field icon={Mail} value={user.email} locked />
        </div>

        {(isLawyerOrFirm || isClientUser) && (
          <>
            <div className="mb-1.5">
              <Field icon={Phone} value={phone ?? "—"} />
            </div>
            <p className="text-[11px] text-gray-400 mb-3">
              Your number will remain confidential and will only be shared if
              you choose to do so.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-3">
              {isLawyerOrFirm ? (
                <>
                  <Field icon={GraduationCap} value={yearOfCall ?? "—"} />
                  <Field icon={MapPin} value={jurisdiction ?? "—"} />
                </>
              ) : (
                <div className="col-span-2">
                  <Field icon={MapPin} value={user.fullName} />
                </div>
              )}
            </div>

            {docsQuery.data?.items?.length ? (
              <>
                <div className="flex items-center justify-between border border-gray-200 rounded-lg px-3.5 py-2.5 mb-5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-8 h-8 rounded bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      DOC
                    </span>
                    <div className="min-w-0">
                      <p className="text-[13px] text-gray-800 truncate">
                        {docsQuery.data.items[0].docType === "call_to_bar_cert"
                          ? "Call to Bar Certificate"
                          : docsQuery.data.items[0].docType}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {new Date(
                          docsQuery.data.items[0].createdAt,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {/* Signed link (expires after 15 min): refetch before opening
                      so a viewer left open never lands on an expired link.
                      Many KYC documents are images, so open the raw link in a
                      tab rather than a PDF-only viewer. */}
                  <button
                    type="button"
                    onClick={() =>
                      openSignedDocument(async () => {
                        const { data } = await docsQuery.refetch();
                        return data?.items?.[0]?.url;
                      })
                    }
                    title="Open document in a new tab"
                    className="text-gray-400 hover:text-gray-700"
                  >
                    <Eye size={16} />
                  </button>
                </div>
                <div className="mb-5 overflow-hidden rounded-2xl border border-gray-200">
                  <iframe
                    src={docsQuery.data.items[0].url}
                    title="Verification document preview"
                    className="w-full h-64"
                  />
                </div>
              </>
            ) : null}
          </>
        )}

        <div className={isLawyerOrFirm ? "" : "mt-5"}>
          <div className="mb-4">
            <label
              className="block text-[12px] font-semibold text-gray-700 mb-2"
              htmlFor="admin-action-reason"
            >
              Action reason
            </label>
            <textarea
              id="admin-action-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={4}
              placeholder="Enter a reason for this action"
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-[13px] text-gray-700 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-200 focus:outline-none focus:ring"
            />
            {!hasReason && (
              <p className="mt-2 text-[12px] text-red-600">
                A reason is required before taking any action.
              </p>
            )}
          </div>

          {isUnderReview && isLawyerOrFirm && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => run("approve")}
                disabled={isBusy || !hasReason}
                className="py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {pending === "approve" && (
                  <Loader2 size={14} className="animate-spin" />
                )}
                Approve Lawyer
              </button>
              <button
                onClick={() => run("reject")}
                disabled={isBusy || !hasReason}
                className="py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[13px] font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {pending === "reject" && (
                  <Loader2 size={14} className="animate-spin" />
                )}
                Reject Lawyer
              </button>
            </div>
          )}

          {canSuspend && (
            <button
              onClick={() => run("suspend")}
              disabled={isBusy || !hasReason}
              className="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[13px] font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {pending === "suspend" && (
                <Loader2 size={14} className="animate-spin" />
              )}
              Suspend {isLawyerOrFirm ? "Lawyer" : "Client"}
            </button>
          )}

          {isSuspended && (
            <button
              onClick={() => run("reactivate")}
              disabled={isBusy || !hasReason}
              className="w-full py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-[13px] font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {pending === "reactivate" && (
                <Loader2 size={14} className="animate-spin" />
              )}
              Re-activate {isLawyerOrFirm ? "Lawyer" : "Client"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
