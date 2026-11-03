// app/Components/Admin/ScnDisputes/ScnDisputesPage.tsx
// SCN impersonation disputes: a registrant says the account already holding
// their Supreme Court Number is not them. The admin reviews both accounts and
// the claimant's evidence, then rules on who keeps the SCN.
"use client";

import { useState } from "react";
import { isAxiosError } from "axios";
import { Eye, FileText, Loader2 } from "lucide-react";
import AdminPageHeader from "../shared/AdminPageHeader";
import StatusBadge from "../shared/StatusBadge";
import TablePagination from "../shared/TablePagination";
import { formatDate } from "../shared/format";
import { useAdminScnDisputes, useResolveScnDispute } from "@/hooks/useAdmin";
import type { ScnDisputeItem } from "@/services/admin.services";
import { openSignedDocument } from "@/lib/signedDocument";

const STATUS_OPTIONS = [
  { label: "Open", value: "open" },
  { label: "Resolved for claimant", value: "resolved_claimant" },
  { label: "Resolved for existing holder", value: "resolved_existing" },
  { label: "Dismissed", value: "dismissed" },
];

const OUTCOMES = [
  {
    value: "resolved_claimant",
    label: "Claimant is the real holder",
    hint: "The SCN moves to the claimant; the existing account is rejected.",
  },
  {
    value: "resolved_existing",
    label: "Existing holder keeps the SCN",
    hint: "The claimant is rejected.",
  },
  {
    value: "dismissed",
    label: "Dismiss",
    hint: "Nothing established. Both accounts go back where they were.",
  },
] as const;

type Outcome = (typeof OUTCOMES)[number]["value"];

function statusLabel(status: string) {
  return STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;
}

export default function ScnDisputesPage() {
  const [status, setStatus] = useState("open");
  const [page, setPage] = useState(1);
  const params = { page, limit: 10, status };
  const query = useAdminScnDisputes(params);
  const items = query.data?.items ?? [];
  const pagination = query.data?.pagination;

  // Evidence links expire after 15 minutes. Refetch the list and open the
  // url it returns for the same item, so a page left open never shows a 401.
  function viewEvidence(disputeId: string, evidenceId: string) {
    return openSignedDocument(async () => {
      const { data } = await query.refetch();
      return data?.items
        ?.find((d) => d.id === disputeId)
        ?.evidence.find((e) => e.id === evidenceId)?.url;
    });
  }

  return (
    <div className="min-h-screen bg-white">
      <AdminPageHeader title="SCN Disputes" />

      <div className="px-6 md:px-8 py-6">
        <div className="flex items-center justify-between gap-3 mb-5">
          <p className="text-[13px] text-gray-500">
            Claims that an account holding a Supreme Court Number is not its
            real owner.
          </p>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-[13px] text-gray-700 bg-white outline-none"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {query.isLoading ? (
          <div className="py-16 text-center text-gray-400 text-[13px]">
            <Loader2 size={16} className="animate-spin inline mr-2" />
            Loading disputes...
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-[13px] border border-[#E5E7EB] rounded-xl">
            No disputes found.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {items.map((d) => (
              <DisputeCard
                key={d.id}
                dispute={d}
                onViewEvidence={(evidenceId) => viewEvidence(d.id, evidenceId)}
              />
            ))}
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="mt-4 border border-[#E5E7EB] rounded-xl">
            <TablePagination
              page={pagination.page ?? 1}
              totalPages={pagination.totalPages ?? 1}
              onChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function DisputeCard({
  dispute: d,
  onViewEvidence,
}: {
  dispute: ScnDisputeItem;
  onViewEvidence: (evidenceId: string) => void;
}) {
  const [resolving, setResolving] = useState(false);

  return (
    <div className="border border-[#E5E7EB] rounded-xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-[14px] font-semibold text-gray-900">
            {d.caseReference}
          </p>
          <p className="text-[12px] text-gray-400 mt-0.5">
            SCN {d.scn} · Raised {formatDate(d.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge
            status={d.status === "open" ? "open" : statusLabel(d.status)}
          />
          {d.status === "open" && !resolving && (
            <button
              onClick={() => setResolving(true)}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[12.5px] font-medium"
            >
              Resolve
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Party
          title="Claimant"
          name={d.claimant.fullName}
          email={d.claimant.email}
          barFullName={d.claimant.barFullName}
          verificationStatus={d.claimant.verificationStatus}
          extra={
            d.claimant.identityCheckStatus
              ? `Identity check: ${d.claimant.identityCheckStatus.replace(/_/g, " ")}`
              : undefined
          }
        />
        <Party
          title="Existing account"
          name={d.existingAccount.fullName}
          email={d.existingAccount.email}
          barFullName={d.existingAccount.barFullName}
          verificationStatus={d.existingAccount.verificationStatus}
        />
      </div>

      {d.claimantStatement && (
        <div className="mb-4">
          <p className="text-[11px] tracking-wide text-gray-400 uppercase mb-1.5">
            Claimant statement
          </p>
          <p className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-wrap">
            {d.claimantStatement}
          </p>
        </div>
      )}

      <div>
        <p className="text-[11px] tracking-wide text-gray-400 uppercase mb-1.5">
          Evidence
        </p>
        {d.evidence.length === 0 ? (
          <p className="text-[13px] text-gray-500">No evidence uploaded.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {d.evidence.map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between gap-3 border border-gray-200 rounded-lg px-3.5 py-2.5"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText size={16} className="text-gray-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[13px] text-gray-800 truncate">
                      {e.label}
                    </p>
                    <p className="text-[11px] text-gray-400 truncate">
                      Uploaded {formatDate(e.createdAt)}
                    </p>
                  </div>
                </div>
                {e.url && (
                  <button
                    type="button"
                    onClick={() => onViewEvidence(e.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-[12px] font-medium shrink-0"
                  >
                    <Eye size={13} />
                    View
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {d.status !== "open" && d.resolutionNote && (
        <p className="mt-4 text-[13px] text-gray-600">
          <span className="text-gray-400">Resolution note: </span>
          {d.resolutionNote}
        </p>
      )}

      {resolving && (
        <ResolveForm disputeId={d.id} onDone={() => setResolving(false)} />
      )}
    </div>
  );
}

function Party({
  title,
  name,
  email,
  barFullName,
  verificationStatus,
  extra,
}: {
  title: string;
  name: string;
  email: string;
  barFullName: string | null;
  verificationStatus: string | null;
  extra?: string;
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 text-[13px]">
      <p className="text-[11px] tracking-wide text-gray-400 uppercase mb-2">
        {title}
      </p>
      <p className="font-medium text-gray-900">{name}</p>
      <p className="text-gray-500">{email}</p>
      {barFullName && (
        <p className="text-gray-500 mt-1">Name on roll: {barFullName}</p>
      )}
      {verificationStatus && (
        <p className="text-gray-500">
          Verification: {verificationStatus.replace(/_/g, " ")}
        </p>
      )}
      {extra && <p className="text-gray-500">{extra}</p>}
    </div>
  );
}

function ResolveForm({
  disputeId,
  onDone,
}: {
  disputeId: string;
  onDone: () => void;
}) {
  const resolve = useResolveScnDispute();
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!outcome) return;
    setError(null);
    try {
      await resolve.mutateAsync({
        id: disputeId,
        outcome,
        note: note.trim() || undefined,
      });
      onDone();
    } catch (err) {
      setError(
        (isAxiosError(err) && err.response?.data?.message) ||
          "Couldn't resolve this dispute. Please try again.",
      );
    }
  }

  return (
    <div className="mt-5 pt-5 border-t border-[#E5E7EB]">
      <p className="text-[13px] font-semibold text-gray-900 mb-3">Ruling</p>
      <div className="flex flex-col gap-2 mb-3">
        {OUTCOMES.map((o) => (
          <label
            key={o.value}
            className={`flex items-start gap-2.5 border rounded-lg px-3.5 py-2.5 cursor-pointer ${
              outcome === o.value
                ? "border-blue-400 bg-blue-50/50"
                : "border-gray-200"
            }`}
          >
            <input
              type="radio"
              name={`outcome-${disputeId}`}
              checked={outcome === o.value}
              onChange={() => setOutcome(o.value)}
              className="mt-0.5"
            />
            <span>
              <span className="block text-[13px] text-gray-800">{o.label}</span>
              <span className="block text-[12px] text-gray-500">{o.hint}</span>
            </span>
          </label>
        ))}
      </div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        maxLength={1000}
        rows={2}
        placeholder="Note (optional)"
        className="w-full mb-3 px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400 resize-none"
      />
      {error && <p className="text-[12px] text-red-500 mb-3">{error}</p>}
      <div className="flex justify-end gap-2">
        <button
          onClick={onDone}
          disabled={resolve.isPending}
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-[13px] font-medium disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={submit}
          disabled={!outcome || resolve.isPending}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold disabled:opacity-60"
        >
          {resolve.isPending && <Loader2 size={14} className="animate-spin" />}
          Submit ruling
        </button>
      </div>
    </div>
  );
}
