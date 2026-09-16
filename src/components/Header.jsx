import { useNavigate, useLocation } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 px-4 pt-4">
      <nav className="max-w-7xl mx-auto">
        <div className="bg-[#f6f4ed]/95 backdrop-blur-md border border-[#c8d0c6] rounded-full px-3 py-3 shadow-sm">
          <div className="flex items-center justify-between">

            {/* Logo */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 px-4"
            >
              <div className="w-9 h-9 rounded-full bg-[#47745f] flex items-center justify-center text-[#f1f0e8] font-bold">
                DH
              </div>

              <div className="text-left leading-none">
                <div className="text-lg font-bold tracking-tight">
                  digital.
                </div>

                <div className="text-[9px] uppercase tracking-[0.2em] text-[#47745f]">
                  Heroes
                </div>
              </div>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">

              <button
                onClick={() => navigate("/")}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition ${
                  isActive("/")
                    ? "bg-[#cbd9c8] text-[#101813]"
                    : "text-[#4e5751] hover:bg-[#e2e5dc]"
                }`}
              >
                Home
              </button>

              <button
                onClick={() => navigate("/how-it-works")}
                className={`px-5 py-2.5 rounded-full text-sm transition ${
                  isActive("/how-it-works")
                    ? "bg-[#cbd9c8] text-[#101813] font-medium"
                    : "text-[#4e5751] hover:bg-[#e2e5dc]"
                }`}
              >
                How it works
              </button>

              <button
                onClick={() => navigate("/charities")}
                className={`px-5 py-2.5 rounded-full text-sm transition ${
                  isActive("/charities")
                    ? "bg-[#cbd9c8] text-[#101813] font-medium"
                    : "text-[#4e5751] hover:bg-[#e2e5dc]"
                }`}
              >
                Charities
              </button>

            </div>

            {/* Right */}
            <div className="flex items-center gap-2">

              <button
                onClick={() => navigate("/login")}
                className="hidden sm:block px-5 py-2.5 rounded-full text-sm text-[#3e4842] hover:bg-[#e2e5dc] transition"
              >
                Login
              </button>

              <button
                onClick={() => navigate("/signup")}
                className="px-5 sm:px-7 py-3 rounded-full bg-[#47745f] text-white text-sm font-semibold hover:bg-[#3c654f] transition shadow-sm"
              >
                Join Digital Heroes →
              </button>

            </div>

          </div>
        </div>
      </nav>
    </header>
  );
}