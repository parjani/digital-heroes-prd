import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminSidebar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { profile, user, logout } = useAuth();

  const navItems = [
    {
      label: "Overview",
      path: "/admin",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
    },
    {
      label: "Users",
      path: "/admin/users",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      label: "Draws",
      path: "/admin/draws",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M8 2v4M16 2v4M3 10h18" />
          <path d="M8 14h2M14 14h2M8 17h2" />
        </svg>
      ),
    },
    {
      label: "Charities",
      path: "/admin/charities",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M20.8 8.6c0 5.5-8.8 11-8.8 11s-8.8-5.5-8.8-11A4.6 4.6 0 0 1 12 5.7a4.6 4.6 0 0 1 8.8 2.9Z" />
        </svg>
      ),
    },
    {
      label: "Winners",
      path: "/admin/winners",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M8 21h8" />
          <path d="M12 17v4" />
          <path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" />
          <path d="M7 6H3v1a4 4 0 0 0 4 4" />
          <path d="M17 6h4v1a4 4 0 0 1-4 4" />
        </svg>
      ),
    },
    {
      label: "Reports",
      path: "/admin/reports",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M4 19V5" />
          <path d="M4 19h17" />
          <path d="m7 15 4-4 3 2 5-6" />
        </svg>
      ),
    },
  ];

  const isActive = (path) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }

    return location.pathname.startsWith(path);
  };

  const displayName =
    profile?.full_name ||
    user?.email?.split("@")[0] ||
    "Administrator";

  const initial = displayName.charAt(0).toUpperCase();

  const handleNavigate = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate("/login");
  };

  return (
    <>
      {/* ================= MOBILE / TABLET TOP BAR ================= */}

      <div className="lg:hidden fixed top-0 left-0 right-0 z-[60] h-[68px] bg-[#0b1711] border-b border-white/10">
        <div className="h-full px-4 sm:px-6 flex items-center justify-between">

          {/* Brand */}

          <button
            onClick={() => handleNavigate("/admin")}
            className="flex items-center gap-2.5"
          >
            <div className="w-9 h-9 rounded-lg bg-[#8ee276] text-[#0b1711] flex items-center justify-center font-black text-xs">
              DH
            </div>

            <div className="text-left">
              <div className="text-sm font-bold text-white tracking-[-0.03em]">
                digital.
                <span className="text-[#8ee276]">HEROES</span>
              </div>

              <div className="text-[7px] uppercase tracking-[0.18em] text-white/35">
                Admin Console
              </div>
            </div>
          </button>


          {/* Mobile menu button */}

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle admin menu"
            aria-expanded={menuOpen}
            className="
              w-10
              h-10
              rounded-lg
              border
              border-white/10
              bg-white/[0.04]
              flex
              items-center
              justify-center
              text-white/70
              hover:bg-[#8ee276]
              hover:text-[#0b1711]
              transition
            "
          >
            <div className="space-y-1.5">
              <span
                className={`block w-5 h-px bg-current transition-transform ${
                  menuOpen ? "translate-y-2 rotate-45" : ""
                }`}
              />

              <span
                className={`block w-5 h-px bg-current transition-opacity ${
                  menuOpen ? "opacity-0" : ""
                }`}
              />

              <span
                className={`block w-5 h-px bg-current transition-transform ${
                  menuOpen ? "-translate-y-2 -rotate-45" : ""
                }`}
              />
            </div>
          </button>
        </div>
      </div>


      {/* ================= MOBILE OVERLAY ================= */}

      {menuOpen && (
        <button
          type="button"
          aria-label="Close admin menu"
          onClick={() => setMenuOpen(false)}
          className="
            fixed
            inset-0
            z-[55]
            bg-black/60
            backdrop-blur-[2px]
            lg:hidden
          "
        />
      )}


      {/* ================= SIDEBAR ================= */}

      <aside
        className={`
          fixed
          top-0
          bottom-0
          left-0
          z-[70]
          w-[270px]
          bg-[#0b1711]
          border-r
          border-white/10
          flex
          flex-col
          transition-transform
          duration-300
          ease-out

          lg:translate-x-0

          ${
            menuOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }

          [&::-webkit-scrollbar]:w-[3px]
          [&::-webkit-scrollbar-track]:bg-[#0b1711]
          [&::-webkit-scrollbar-thumb]:bg-[#47775f]
          [&::-webkit-scrollbar-thumb]:rounded-full
          hover:[&::-webkit-scrollbar-thumb]:bg-[#8ee276]

          scrollbar-width:thin
          scrollbar-color:#47775f #0b1711
        `}
      >

        {/* ================= BRAND ================= */}

        <div className="shrink-0 px-6 pt-7 pb-6 border-b border-white/[0.07]">

          <button
            onClick={() => handleNavigate("/admin")}
            className="flex items-center gap-3 text-left"
          >
            <div className="
              w-11
              h-11
              rounded-xl
              bg-[#8ee276]
              text-[#0b1711]
              flex
              items-center
              justify-center
              font-black
              italic
              tracking-[-0.08em]
              text-sm
            ">
              DH
            </div>

            <div>
              <div className="text-lg font-bold text-white tracking-[-0.04em]">
                digital.
              </div>

              <div className="text-[8px] uppercase tracking-[0.25em] text-[#8ee276] font-bold">
                Admin Console
              </div>
            </div>
          </button>


          {/* System status */}

          <div className="
            mt-6
            flex
            items-center
            justify-between
            rounded-lg
            bg-white/[0.035]
            border
            border-white/[0.07]
            px-3
            py-2.5
          ">
            <div className="flex items-center gap-2">

              <span className="relative flex w-2 h-2">
                <span className="absolute inset-0 rounded-full bg-[#8ee276] animate-ping opacity-40" />
                <span className="relative w-2 h-2 rounded-full bg-[#8ee276]" />
              </span>

              <span className="text-[8px] uppercase tracking-[0.15em] font-semibold text-white/45">
                System
              </span>

            </div>

            <span className="text-[8px] uppercase tracking-[0.12em] font-bold text-[#8ee276]">
              Online
            </span>
          </div>
        </div>


        {/* ================= NAVIGATION ================= */}

        <div
          className="
            flex-1
            overflow-y-auto
            px-4
            py-6

            [&::-webkit-scrollbar]:w-[3px]
            [&::-webkit-scrollbar-track]:bg-[#0b1711]
            [&::-webkit-scrollbar-thumb]:bg-[#47775f]
            [&::-webkit-scrollbar-thumb]:rounded-full
            hover:[&::-webkit-scrollbar-thumb]:bg-[#8ee276]

            scrollbar-width:thin
            scrollbar-color:#47775f #0b1711
          "
        >

          <p className="px-3 mb-3 text-[8px] uppercase tracking-[0.22em] text-white/25 font-bold">
            Navigation
          </p>

          <nav className="space-y-1">

            {navItems.map((item) => {
              const active = isActive(item.path);

              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigate(item.path)}
                  className={`
                    relative
                    w-full
                    flex
                    items-center
                    gap-3
                    px-3
                    py-3
                    rounded-lg
                    text-left
                    transition-all
                    group

                    ${
                      active
                        ? "bg-[#8ee276] text-[#0b1711]"
                        : "text-white/50 hover:text-white hover:bg-white/[0.05]"
                    }
                  `}
                >

                  <span
                    className={`
                      w-[18px]
                      h-[18px]
                      shrink-0
                      transition-transform
                      group-hover:scale-105
                      ${active ? "text-[#0b1711]" : "text-[#8ee276]/70"}
                    `}
                  >
                    {item.icon}
                  </span>

                  <span className="text-[13px] font-semibold tracking-[0.01em]">
                    {item.label}
                  </span>

                  {active && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#0b1711]" />
                  )}

                </button>
              );
            })}

          </nav>


          {/* Console information */}

          <div className="mt-8">

            <p className="px-3 mb-3 text-[8px] uppercase tracking-[0.22em] text-white/25 font-bold">
              Console
            </p>

            <div className="rounded-lg border border-white/[0.07] bg-white/[0.025] p-3">

              <div className="flex items-center justify-between">
                <span className="text-[9px] text-white/35">
                  Environment
                </span>

                <span className="text-[9px] font-semibold text-white/65">
                  Production
                </span>
              </div>

              <div className="my-2.5 h-px bg-white/[0.06]" />

              <div className="flex items-center justify-between">
                <span className="text-[9px] text-white/35">
                  Access
                </span>

                <span className="text-[9px] font-semibold text-[#8ee276]">
                  Administrator
                </span>
              </div>

            </div>
          </div>
        </div>


        {/* ================= PROFILE ================= */}

        <div className="shrink-0 p-4 border-t border-white/[0.07]">

          <div className="rounded-xl bg-white/[0.035] border border-white/[0.07] p-3">

            <div className="flex items-center gap-3">

              <div className="
                w-9
                h-9
                shrink-0
                rounded-lg
                bg-[#8ee276]
                text-[#0b1711]
                flex
                items-center
                justify-center
                text-xs
                font-bold
              ">
                {initial}
              </div>

              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-white">
                  {displayName}
                </p>

                <p className="mt-1 text-[8px] uppercase tracking-[0.14em] text-white/30">
                  Administrator
                </p>
              </div>

            </div>

            <button
              onClick={handleLogout}
              className="
                mt-3
                w-full
                rounded-lg
                border
                border-white/10
                px-3
                py-2
                text-[9px]
                uppercase
                tracking-[0.14em]
                font-semibold
                text-white/40
                hover:border-[#8ee276]/40
                hover:text-[#8ee276]
                transition
              "
            >
              Logout
            </button>

          </div>

        </div>

      </aside>
    </>
  );
}