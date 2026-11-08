// app/Components/Admin/Users/UsersPage.tsx
// Figma source: Users.png, Users-1.png (list view)
"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import AdminPageHeader from "../shared/AdminPageHeader";
import StatCard from "../shared/StatCard";
import StatusBadge from "../shared/StatusBadge";
import TableToolbar from "../shared/TableToolbar";
import TablePagination from "../shared/TablePagination";
import UserDetailModal from "./UserDetailModal";
import { useAdminUsers, useAdminUserStats } from "@/hooks/useAdmin";
import { getDisplayStatus } from "@/app/utils/adminStatus";

const TYPE_OPTIONS = [
  { label: "Lawyer", value: "LAWYER" },
  { label: "Law Firm", value: "FIRM" },
  { label: "Client", value: "USER" },
];

const STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Under Review", value: "under_review" },
  { label: "Suspended", value: "suspended" },
  { label: "Dormant", value: "dormant" },
  { label: "Deleted", value: "deleted" },
];

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: stats } = useAdminUserStats();

  // Map UI filters to API params
  const roleParam = type || undefined;
  let statusParam: string | undefined = undefined;
  let verificationParam: string | undefined = undefined;
  if (status) {
    if (status === "under_review") verificationParam = "under_review";
    else statusParam = status;
  }

  const { data, isLoading } = useAdminUsers({
    page,
    limit: 8,
    q: search,
    role: roleParam,
    status: statusParam,
    verificationStatus: verificationParam,
  });
  const items = data?.items ?? [];
  const statusPriority = (status: string) => {
    switch (status) {
      case "under_review":
        return 0;
      case "pending":
        return 1;
      case "active":
        return 2;
      case "rejected":
        return 3;
      case "suspended":
        return 4;
      case "dormant":
        return 5;
      case "deleted":
        return 6;
      default:
        return 7;
    }
  };

  const sortedItems = [...items].sort((a, b) => {
    const aGroup = statusPriority(getDisplayStatus(a));
    const bGroup = statusPriority(getDisplayStatus(b));

    if (aGroup !== bGroup) {
      return aGroup - bGroup;
    }

    const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bDate - aDate;
  });

  const selectedUser = selectedId
    ? (sortedItems.find((u) => u.id === selectedId) ?? null)
    : null;
  const pagination = data?.pagination;

  return (
    <div className="min-h-screen bg-white">
      <AdminPageHeader title="Users" />

      <div className="px-6 md:px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
          <StatCard
            label="Total Users"
            value={(stats?.totalUsers ?? 0).toLocaleString()}
          />
          <StatCard
            label="Lawyers"
            value={(stats?.lawyers ?? 0).toLocaleString()}
          />
          <StatCard
            label="Law Firms"
            value={(stats?.lawFirms ?? 0).toLocaleString()}
          />
          <StatCard
            label="Clients"
            value={(stats?.clients ?? 0).toLocaleString()}
          />
          <StatCard
            label="Verified Lawyers"
            value={(stats?.verifiedLawyers ?? 0).toLocaleString()}
          />
          <StatCard
            label="Suspended Users"
            value={(stats?.suspendedUsers ?? 0).toLocaleString()}
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
              label: "All Types",
              value: type,
              options: TYPE_OPTIONS,
              onChange: (v) => {
                setType(v);
                setPage(1);
              },
            },
            {
              label: "All Status",
              value: status,
              options: STATUS_OPTIONS,
              onChange: (v) => {
                setStatus(v);
                setPage(1);
              },
            },
          ]}
          onPrint={() => window.print()}
        />

        <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-[#E5E7EB]">
                {[
                  "Name",
                  "Email",
                  "User Type",
                  "Subscription",
                  "Status",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-[12px] font-semibold text-gray-600 px-5 py-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-gray-400">
                    <Loader2 size={16} className="animate-spin inline mr-2" />
                    Loading users...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-16 text-center text-gray-400 text-[13px]"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                sortedItems.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-[#F3F4F6] last:border-0"
                  >
                    <td className="px-5 py-3.5 text-[13px] text-gray-800">
                      {u.fullName}
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-gray-500">
                      {u.email}
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-gray-700">
                      {u.role}
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-gray-700">
                      {u.membershipTier}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={getDisplayStatus(u)} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedId(u.id)}
                          className="px-4 py-1.5 border border-gray-300 rounded-lg text-[12.5px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          View
                        </button>
                        {/* Dormant users can't sign in until reactivated. This
                            opens the same modal, where the admin gives a reason
                            and confirms. */}
                        {String(u.status).toLowerCase() === "dormant" && (
                          <button
                            onClick={() => setSelectedId(u.id)}
                            className="px-4 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-[12.5px] font-medium transition-colors"
                          >
                            Activate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
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

      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
