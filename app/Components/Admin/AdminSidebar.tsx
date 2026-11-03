// app/Components/Admin/AdminSidebar.tsx
// Figma source: Dashboard.png (sidebar visible across every admin screen)
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutGrid,
  Users,
  CreditCard,
  Gauge,
  CalendarClock,
  PackageSearch,
  BookOpenText,
  LifeBuoy,
  BarChart3,
  Megaphone,
  LogOut,
  Menu,
  X,
  AlertTriangle,
  Loader2,
  Flag,
  Download,
  Bell,
  Scale,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutGrid },
  { label: "Notifications", href: "/admin/notifications", icon: Bell },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "SCN Disputes", href: "/admin/scn-disputes", icon: Scale },
  { label: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
  { label: "Revenue", href: "/admin/revenue", icon: Gauge },
  { label: "On the Docket", href: "/admin/docket", icon: CalendarClock },
  { label: "TLS Services", href: "/admin/services", icon: PackageSearch },
  {
    label: "Legal News Survey",
    href: "/admin/legal-news-survey",
    icon: BookOpenText,
  },
  { label: "Reported Posts", href: "/admin/reports", icon: Flag },
  { label: "Support Center", href: "/admin/support", icon: LifeBuoy },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
];

function LogoutModal({
  onConfirm,
  onCancel,
  isLoggingOut,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  isLoggingOut: boolean;
}) {
  return (
    <div className="fixed inset-0 z-1000000001 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm z-1000000000"
        onClick={!isLoggingOut ? onCancel : undefined}
      />
      <div className="relative w-full max-w-xs bg-white rounded-2xl shadow-xl p-6 z-1000000000">
        <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-5 h-5 text-red-500" />
        </div>
        <h3 className="text-[16px] font-semibold text-gray-900 text-center mb-1">
          Sign out?
        </h3>
        <p className="text-[13px] text-gray-500 text-center leading-relaxed mb-6">
          You&apos;ll need to sign in again to access the admin console.
        </p>
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onConfirm}
            disabled={isLoggingOut}
            className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white text-[13px] font-medium rounded-xl transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isLoggingOut ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Signing out...
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4" /> Yes, sign out
              </>
            )}
          </button>
          <button
            onClick={onCancel}
            disabled={isLoggingOut}
            className="w-full py-2.5 bg-white hover:bg-gray-100 text-gray-700 text-[13px] font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const unreadNotificationCount = Number(user?.unreadNotificationCount ?? 0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow =
      mobileOpen || showLogoutModal ? "hidden" : prev || "";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen, showLogoutModal]);

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  const isItemActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const sidebarContent = (
    <aside className="w-60 h-screen fixed top-0 left-0 border-r border-[#E5E7EB] flex flex-col bg-white">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#E5E7EB] flex items-center justify-between">
        <img
          src="/logo.png"
          alt="The Legal Space"
          className="w-full h-8.5 object-contain"
        />
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pt-4 overflow-y-auto">
        {ADMIN_NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = isItemActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[14px] mb-1 transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${isActive ? "text-blue-600" : "text-gray-400"}`}
              />
              {label}
              {href === "/admin/notifications" &&
                unreadNotificationCount > 0 && (
                  <span className="ml-auto min-w-5 h-5 px-1.5 rounded-full bg-red-500 text-white text-[11px] font-semibold flex items-center justify-center">
                    {unreadNotificationCount > 99
                      ? "99+"
                      : unreadNotificationCount}
                  </span>
                )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-[#E5E7EB] flex flex-col gap-2">
        <a
          href="/api/waitlist"
          className="w-full py-2 rounded-lg text-[14px] font-medium text-gray-900 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          style={{
            border: "2px solid transparent",
            backgroundImage:
              "linear-gradient(white, white), linear-gradient(90deg, #216399 0%, #FFE500 50%, #C34B00 100%)",
            backgroundOrigin: "border-box",
            backgroundClip: "padding-box, border-box",
          }}
        >
          <Download className="w-4 h-4" />
          Download Waitlist
        </a>
        <button
          onClick={() => setShowLogoutModal(true)}
          className="w-full py-2.5 rounded-lg bg-red-50 text-[14px] font-medium text-red-500 flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {showLogoutModal && (
        <LogoutModal
          onConfirm={handleLogoutConfirm}
          onCancel={() => setShowLogoutModal(false)}
          isLoggingOut={isLoggingOut}
        />
      )}

      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 right-4 z-40 p-2 bg-white border border-gray-200 rounded-lg shadow-sm"
      >
        <Menu className="w-5 h-5 text-gray-700" />
      </button>

      <div className="hidden md:flex md:shrink-0">
        <div className="w-60 min-h-screen sticky top-0">{sidebarContent}</div>
      </div>

      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/40 z-40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="md:hidden fixed top-0 left-0 h-full z-50 shadow-xl">
            {sidebarContent}
          </div>
        </>
      )}
    </>
  );
}
