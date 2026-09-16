import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function UserHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navigation = [
    {
      label: "Dashboard",
      path: "/dashboard",
    },
    {
      label: "Scores",
      path: "/dashboard/scores",
    },
    {
      label: "Charity",
      path: "/dashboard/charity",
    },
    {
      label: "Subscription",
      path: "/dashboard/subscription",
    },
    {
      label: "Draw",
      path: "/dashboard/draw",
    },
    {
      label: "Winnings",
      path: "/dashboard/winnings",
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 px-4 pt-4">
      <nav className="max-w-7xl mx-auto">

        <div className="bg-[#f6f4ed]/95 backdrop-blur-md border border-[#c8d0c6] rounded-[28px] shadow-sm">

          {/* Main Header */}
          <div className="px-4 py-3">

            <div className="flex items-center justify-between">

              {/* Logo */}
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2 px-2 sm:px-4"
              >
                <div className="w-9 h-9 rounded-full bg-[#47745f] flex items-center justify-center text-[#f1f0e8] font-bold text-sm">
                  DH
                </div>

                <div className="text-left leading-none">
                  <div className="text-lg font-bold tracking-tight text-[#101813]">
                    digital.
                  </div>

                  <div className="text-[9px] uppercase tracking-[0.2em] text-[#47745f]">
                    Heroes
                  </div>
                </div>
              </button>


              {/* Desktop Navigation */}
              <div className="hidden xl:flex items-center gap-1">

                {navigation.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`px-4 py-2.5 rounded-full text-sm transition ${
                      isActive(item.path)
                        ? "bg-[#cbd9c8] text-[#101813] font-medium"
                        : "text-[#4e5751] hover:bg-[#e2e5dc]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}

              </div>


              {/* User Area */}
              <div className="flex items-center gap-2">

                {/* User Name */}
                <div className="hidden lg:flex items-center gap-3 px-3">

                  <div className="text-right">
                    <p className="text-xs font-semibold text-[#101813]">
                      {profile?.full_name || "Digital Hero"}
                    </p>

                    <p className="text-[9px] uppercase tracking-[0.15em] text-[#7a837c]">
                      Member
                    </p>
                  </div>

                  <div className="w-9 h-9 rounded-full bg-[#dfe5da] border border-[#c8d0c6] flex items-center justify-center text-sm font-semibold text-[#47745f]">
                    {(profile?.full_name || "D")
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                </div>


                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="hidden sm:block px-5 py-2.5 rounded-full border border-[#c8d0c6] text-sm text-[#3e4842] hover:bg-[#e2e5dc] transition"
                >
                  Logout
                </button>


                {/* Mobile Menu Button */}
                <button
                  onClick={() => setMobileOpen(!mobileOpen)}
                  className="xl:hidden w-10 h-10 rounded-full bg-[#47745f] text-white flex items-center justify-center text-lg"
                  aria-label="Toggle menu"
                >
                  {mobileOpen ? "×" : "☰"}
                </button>

              </div>

            </div>

          </div>


          {/* Mobile Navigation */}
          {mobileOpen && (
            <div className="xl:hidden border-t border-[#c8d0c6] px-4 py-4">

              <div className="grid grid-cols-2 gap-2">

                {navigation.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setMobileOpen(false);
                    }}
                    className={`px-4 py-3 rounded-2xl text-left text-sm transition ${
                      isActive(item.path)
                        ? "bg-[#cbd9c8] text-[#101813] font-medium"
                        : "bg-[#eef0e9] text-[#4e5751] hover:bg-[#e2e5dc]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}

              </div>


              {/* Mobile User */}
              <div className="mt-4 pt-4 border-t border-[#c8d0c6] flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div className="w-9 h-9 rounded-full bg-[#dfe5da] border border-[#c8d0c6] flex items-center justify-center text-sm font-semibold text-[#47745f]">
                    {(profile?.full_name || "D")
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#101813]">
                      {profile?.full_name || "Digital Hero"}
                    </p>

                    <p className="text-[9px] uppercase tracking-[0.15em] text-[#7a837c]">
                      Member
                    </p>
                  </div>

                </div>


                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-full border border-[#c8d0c6] text-xs text-[#3e4842] hover:bg-[#e2e5dc] transition"
                >
                  Logout
                </button>

              </div>

            </div>
          )}

        </div>

      </nav>
    </header>
  );
}