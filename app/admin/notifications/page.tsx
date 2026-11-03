// app/admin/notifications/page.tsx
// Admins get their own alerts (payment disputes, external refunds), so the
// console needs a notifications list just like the member dashboard.
"use client";

import AdminPageHeader from "@/app/Components/Admin/shared/AdminPageHeader";
import NotificationsPage from "@/app/Components/Notifications/NotificationsPage";

export default function Page() {
  return (
    <div className="min-h-screen bg-white">
      <AdminPageHeader title="Notifications" />
      <div className="max-w-3xl">
        <NotificationsPage />
      </div>
    </div>
  );
}
