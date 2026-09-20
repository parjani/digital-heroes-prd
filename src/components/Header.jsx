import { useNavigate, useLocation } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="absolute top-0 left-0 right-0 z-50 px-4 pt-5 md:px-6 md:pt-6">
      <nav className="max-w-7xl mx-auto">

        <div className="flex items-center justify-between">

          {/* =====================================================
              LOGO
          ===================================================== */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 group"
          >

            {/* DH Logo */}
            <div className="relative w-11 h-11 rounded-full bg-[#8ee276] text-[#103523] flex items-center justify-center font-black italic tracking-[-0.08em] text-sm shadow-[0_8px_25px_rgba(142,226,118,0.15)] group-hover:scale-105 transition-transform">
              DH
            </div>

            {/* Brand */}
            <div className="hidden sm:block text-left leading-none">

              <div className="text-lg font-bold tracking-[-0.03em] text-white">
                digital.
              </div>

              <div className="mt-1 text-[9px] uppercase tracking-[0.24em] text-[#8ee276] font-semibold">
                Heroes
              </div>

            </div>

          </button>


          {/* =====================================================
              DESKTOP NAVIGATION
          ===================================================== */}
          <div className="hidden md:flex items-center gap-1">

            <NavItem
              label="Home"
              active={isActive("/")}
              onClick={() => navigate("/")}
            />

            <NavItem
              label="How it works"
              active={isActive("/how-it-works")}
              onClick={() => navigate("/how-it-works")}
            />

            <NavItem
              label="Charities"
              active={isActive("/charities")}
              onClick={() => navigate("/charities")}
            />

          </div>


          {/* =====================================================
              RIGHT ACTIONS
          ===================================================== */}
          <div className="flex items-center gap-2">

            {/* Login */}
            <button
              onClick={() => navigate("/login")}
              className="hidden sm:block px-5 py-2.5 rounded-full text-sm font-medium text-white/75 hover:text-white hover:bg-white/10 transition-all"
            >
              Login
            </button>


            {/* Join */}
            <button
              onClick={() => navigate("/signup")}
              className="group px-5 sm:px-6 py-3 rounded-full bg-[#8ee276] text-[#103523] text-sm font-bold shadow-[0_8px_25px_rgba(142,226,118,0.16)] hover:bg-[#a0ed89] hover:-translate-y-0.5 transition-all"
            >
              Join Digital Heroes

              <span className="ml-1.5 inline-block group-hover:translate-x-1 transition-transform">
                →
              </span>
            </button>

          </div>

        </div>

      </nav>
    </header>
  );
}


/* =========================================================
   NAV ITEM
========================================================= */

function NavItem({
  label,
  active,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={`relative px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
        active
          ? "text-white bg-white/10"
          : "text-white/65 hover:text-white hover:bg-white/10"
      }`}
    >

      {label}

      {/* Active indicator */}
      {active && (
        <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#8ee276]" />
      )}

    </button>
  );
}