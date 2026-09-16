import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { profile, logout } = useAuth();

  const navItems = [
    { label: "Overview", path: "/admin" },
    { label: "Users", path: "/admin/users" },
    { label: "Draws", path: "/admin/draws" },
    { label: "Charities", path: "/admin/charities" },
    { label: "Winners", path: "/admin/winners" },
    { label: "Reports", path: "/admin/reports" },
  ];

  const isActive = (path) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }

    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#cfd4c8] bg-[#f8f7f1]/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => navigate("/admin")}
            className="shrink-0 text-left"
          >
            <div className="text-xl font-semibold tracking-[-0.04em] text-[#101813]">
              digital.
              <span className="text-[#47775f]">HEROES</span>
            </div>

            <div className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#687169]">
              Admin console
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] transition ${
                  isActive(item.path)
                    ? "text-[#47775f]"
                    : "text-[#687169] hover:text-[#101813]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Admin Profile / Logout */}
          <div className="hidden items-center gap-3 lg:flex">
            <div className="flex items-center gap-2 border-l border-[#cfd4c8] pl-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dfe5da] text-sm font-semibold text-[#38644f]">
                {profile?.full_name?.charAt(0)?.toUpperCase() || "A"}
              </div>

              <div className="hidden xl:block">
                <p className="max-w-[120px] truncate text-xs font-semibold text-[#101813]">
                  {profile?.full_name || "Administrator"}
                </p>

                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#8a918b]">
                  Admin
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="border border-[#cfd4c8] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#687169] transition hover:border-[#101813] hover:text-[#101813]"
            >
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-10 w-10 items-center justify-center border border-[#cfd4c8] lg:hidden"
            aria-label="Toggle admin menu"
          >
            <div className="space-y-1.5">
              <span
                className={`block h-px w-5 bg-[#101813] transition ${
                  menuOpen ? "translate-y-2 rotate-45" : ""
                }`}
              />
              <span
                className={`block h-px w-5 bg-[#101813] transition ${
                  menuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block h-px w-5 bg-[#101813] transition ${
                  menuOpen ? "-translate-y-2 -rotate-45" : ""
                }`}
              />
            </div>
          </button>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <div className="border-t border-[#cfd4c8] py-4 lg:hidden">
            <nav className="flex flex-col">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMenuOpen(false);
                  }}
                  className={`border-b border-[#e7ebe3] px-1 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.14em] transition ${
                    isActive(item.path)
                      ? "text-[#47775f]"
                      : "text-[#687169]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Mobile Admin Info */}
            <div className="mt-4 flex items-center justify-between border-t border-[#cfd4c8] pt-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dfe5da] text-sm font-semibold text-[#38644f]">
                  {profile?.full_name?.charAt(0)?.toUpperCase() || "A"}
                </div>

                <div>
                  <p className="text-xs font-semibold text-[#101813]">
                    {profile?.full_name || "Administrator"}
                  </p>

                  <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#8a918b]">
                    Admin
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="border border-[#cfd4c8] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#687169]"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}