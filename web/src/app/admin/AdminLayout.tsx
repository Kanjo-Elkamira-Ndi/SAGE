import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu, Search, Bell, HelpCircle, AppWindow } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Sidebar } from "@/features/admin/components/Sidebar";
import { Avatar } from "@/components/ui/Avatar";
import { fadeIn } from "@/lib/motion";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const displayName = user?.fullName ?? "Admin";
  const roleLabel = user?.role === "admin" ? "Super Administrator" : "Administrator";

  return (
    <div className="min-h-screen bg-admin-bg text-text-primary">
      <Sidebar mobileOpen={mobileOpen} onNavigate={() => setMobileOpen(false)} />

      <div className="flex min-h-screen flex-col lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-admin-outline bg-white px-4 md:px-6">
          <div className="flex flex-1 items-center gap-3">
            <button
              className="rounded-lg p-2 text-admin-text-muted transition-colors hover:bg-admin-container-low hover:text-text-primary lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-text-muted" />
              <input
                type="text"
                placeholder="Search systems, students, or records..."
                className="h-10 w-full rounded-lg border border-transparent bg-admin-container-low pl-10 pr-4 text-sm transition-all focus:border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-admin-royal"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <div className="flex items-center gap-1.5 md:gap-3">
              <button
                aria-label="Notifications"
                className="rounded-lg p-2 text-admin-text-muted transition-colors hover:bg-admin-container-low hover:text-admin-royal"
              >
                <Bell className="h-5 w-5" />
              </button>
              <button
                aria-label="Help"
                className="hidden rounded-lg p-2 text-admin-text-muted transition-colors hover:bg-admin-container-low hover:text-admin-royal sm:block"
              >
                <HelpCircle className="h-5 w-5" />
              </button>
              <button
                aria-label="Apps"
                className="hidden rounded-lg p-2 text-admin-text-muted transition-colors hover:bg-admin-container-low hover:text-admin-royal sm:block"
              >
                <AppWindow className="h-5 w-5" />
              </button>
            </div>
            <div className="h-8 w-px bg-admin-outline" />
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold leading-none text-text-primary">
                  {displayName}
                </p>
                <p className="mt-1 text-xs leading-none text-admin-text-muted">
                  {roleLabel}
                </p>
              </div>
              <Avatar name={displayName} size="md" />
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 px-4 py-6 md:px-6 md:py-8">
          <div className="mx-auto w-full max-w-[1280px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={location.pathname}
                initial={fadeIn.initial}
                animate={fadeIn.animate}
                exit={fadeIn.exit}
                transition={{ duration: 0.18 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        <footer className="border-t border-admin-outline bg-white px-6 py-4 text-center">
          <p className="text-xs text-admin-text-muted">
            SAGE Global Connect — Managing the future of higher education through
            precision data.
          </p>
        </footer>
      </div>
    </div>
  );
}
