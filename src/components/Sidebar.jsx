import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);

  const navigation = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: "⌂",
    },
    {
      label: "Scores",
      path: "/dashboard/scores",
      icon: "◒",
    },
    {
      label: "Charity",
      path: "/dashboard/charity",
      icon: "✦",
    },
    {
      label: "Subscription",
      path: "/dashboard/subscription",
      icon: "◇",
    },
    {
      label: "Draw",
      path: "/dashboard/draw",
      icon: "◉",
    },
    {
      label: "Winnings",
      path: "/dashboard/winnings",
      icon: "↗",
    },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
    setMobileOpen(false);
  };

  const displayName = profile?.full_name || "Digital Hero";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <>
      {/* ================= MOBILE TOP BAR ================= */}
      <header className="lg:hidden sticky top-0 z-50 w-full bg-[#0d2117] border-b border-white/10">
        <div className="h-[70px] px-5 flex items-center justify-between">

          {/* Logo */}
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-[#8ee276] text-[#103523] flex items-center justify-center font-black italic text-sm">
              DH
            </div>

            <div className="text-left leading-none">
              <div className="text-lg font-bold tracking-[-0.03em] text-white">
                digital.
              </div>

              <div className="mt-1 text-[9px] uppercase tracking-[0.24em] text-[#8ee276] font-semibold">
                Heroes
              </div>
            </div>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="w-10 h-10 rounded-full bg-[#8ee276] text-[#103523] flex items-center justify-center text-lg font-semibold"
            aria-label="Toggle sidebar"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? "×" : "☰"}
          </button>
        </div>
      </header>

      {/* ================= MOBILE OVERLAY ================= */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-[#07150d]/60 backdrop-blur-sm"
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-[270px]
          bg-[#0d2117] text-white
          border-r border-white/10
          flex flex-col
          transition-transform duration-300 ease-out

          lg:translate-x-0

          ${mobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
          }
        `}
      >

        {/* ================= BRAND ================= */}
        <div className="px-6 pt-7 pb-6">
          <button
            onClick={() => handleNavigation("/dashboard")}
            className="group flex items-center gap-3"
          >
            <div className="w-11 h-11 rounded-full bg-[#8ee276] text-[#103523] flex items-center justify-center font-black italic tracking-[-0.08em] text-sm shadow-[0_8px_25px_rgba(142,226,118,0.15)] group-hover:scale-105 transition-transform">
              DH
            </div>

            <div className="text-left leading-none">
              <div className="text-xl font-bold tracking-[-0.04em]">
                digital.
              </div>

              <div className="mt-1 text-[9px] uppercase tracking-[0.25em] text-[#8ee276] font-semibold">
                Heroes
              </div>
            </div>
          </button>
        </div>

        <div className="mx-6 h-px bg-white/10" />

        {/* ================= NAVIGATION ================= */}
        <div className="px-4 pt-7">

          <p className="px-3 mb-3 text-[9px] uppercase tracking-[0.22em] text-white/30 font-semibold">
            Main menu
          </p>

          <nav className="space-y-1">

            {navigation.map((item) => {
              const active = isActive(item.path);

              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`
                    group relative w-full
                    flex items-center gap-3
                    px-3 py-3
                    rounded-xl
                    text-left
                    transition-all duration-200

                    ${
                      active
                        ? "bg-[#8ee276] text-[#103523]"
                        : "text-white/55 hover:bg-white/[0.06] hover:text-white"
                    }
                  `}
                >

                  {/* Active indicator */}
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-[#103523]" />
                  )}

                  {/* Icon */}
                  <span
                    className={`
                      w-9 h-9
                      rounded-lg
                      flex items-center justify-center
                      text-sm
                      shrink-0

                      ${
                        active
                          ? "bg-[#103523]/10 text-[#103523]"
                          : "bg-white/[0.05] text-white/50 group-hover:text-[#8ee276]"
                      }
                    `}
                  >
                    {item.icon}
                  </span>

                  {/* Label */}
                  <span className="text-sm font-medium">
                    {item.label}
                  </span>

                  {/* Arrow */}
                  {active && (
                    <span className="ml-auto text-sm">
                      →
                    </span>
                  )}

                </button>
              );
            })}

          </nav>
        </div>

        {/* Push account section to bottom */}
        <div className="flex-1" />

        {/* ================= ACCOUNT ================= */}
        <div className="px-4 pb-4">

          <div className="rounded-2xl bg-white/[0.05] border border-white/10 p-4">

            <p className="px-1 mb-3 text-[9px] uppercase tracking-[0.2em] text-white/30">
              Your account
            </p>

            <div className="flex items-center gap-3">

              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-[#47775f] border border-white/10 flex items-center justify-center text-sm font-semibold text-white shrink-0">
                {initial}
              </div>

              {/* Name */}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {displayName}
                </p>

                <p className="mt-0.5 text-[9px] uppercase tracking-[0.15em] text-white/35">
                  Digital Hero
                </p>
              </div>

            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="mt-4 w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-white/10 text-xs font-medium text-white/55 hover:text-white hover:bg-white/[0.06] transition-all"
            >
              <span>Logout</span>
              <span>→</span>
            </button>

          </div>

          <div className="px-2 pt-4">
            <p className="text-[9px] uppercase tracking-[0.15em] text-white/20">
              Performance with purpose.
            </p>
          </div>

        </div>

      </aside>
    </>
  );
}