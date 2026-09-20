import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function UserHeader() {
  const location = useLocation();
  const { profile, user } = useAuth();

  const getPageInfo = () => {
    switch (location.pathname) {
      case "/dashboard":
        return {
          eyebrow: "Overview",
          title: "Dashboard",
          description: "Your performance at a glance",
        };

      case "/dashboard/scores":
        return {
          eyebrow: "Performance",
          title: "My Scores",
          description: "Track your latest golf performance",
        };

      case "/dashboard/charity":
        return {
          eyebrow: "Impact",
          title: "My Charity",
          description: "See the cause you're supporting",
        };

      case "/dashboard/subscription":
        return {
          eyebrow: "Membership",
          title: "Subscription",
          description: "Manage your Digital Heroes membership",
        };

      case "/dashboard/draw":
        return {
          eyebrow: "Opportunity",
          title: "Monthly Draw",
          description: "Your chance to win while giving back",
        };

      case "/dashboard/winnings":
        return {
          eyebrow: "Rewards",
          title: "My Winnings",
          description: "View your draw history and rewards",
        };

      default:
        return {
          eyebrow: "Digital Heroes",
          title: "Dashboard",
          description: "Performance with purpose",
        };
    }
  };

  const page = getPageInfo();

  const displayName =
    profile?.full_name ||
    user?.email?.split("@")[0] ||
    "Digital Hero";

  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 w-full bg-[#0d2117] text-white border-b border-white/10">

      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 right-10 w-80 h-80 rounded-full bg-[#8ee276]/10 blur-3xl" />

        <div className="absolute top-0 right-1/3 w-64 h-64 rounded-full bg-[#47775f]/10 blur-3xl" />
      </div>

      <div className="relative min-h-[75px] px-5 sm:px-7 lg:px-10 flex items-center justify-between">

        {/* ================= LEFT ================= */}

        <div className="min-w-0">

          {/* <div className="flex items-center gap-2 mb-2">

            <span className="w-7 h-[2px] bg-[#8ee276]" />

            <span className="text-[9px] uppercase tracking-[0.25em] text-[#8ee276] font-semibold">
              {page.eyebrow}
            </span>

          </div> */}

          <h1 className="text-lg sm:text-xl lg:text-xl tracking-[-0.04em] text-white">
            {page.title}
          </h1>

          <p className="hidden sm:block mt-1.5 text-xs text-white/45">
            {page.description}
          </p>

        </div>


        {/* ================= RIGHT ================= */}

        <div className="flex items-center gap-3 sm:gap-5">

          {/* Membership */}

          <div className="hidden md:flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/[0.06] border border-white/10">

            <span className="relative flex w-2 h-2">
              <span className="absolute inset-0 rounded-full bg-[#8ee276] animate-ping opacity-50" />
              <span className="relative w-2 h-2 rounded-full bg-[#8ee276]" />
            </span>

            <span className="text-[9px] uppercase tracking-[0.15em] font-semibold text-white/60">
              Active Member
            </span>

          </div>


          {/* Notification */}

          <button
            type="button"
            aria-label="Notifications"
            className="
              relative
              w-11 h-11
              rounded-full
              bg-white/[0.06]
              border border-white/10
              flex items-center justify-center
              text-white/70
              hover:bg-[#8ee276]
              hover:text-[#103523]
              hover:border-[#8ee276]
              transition-all
            "
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>

            <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#8ee276]" />
          </button>


          {/* Divider */}

          <div className="hidden sm:block h-9 w-px bg-white/10" />


          {/* Profile */}

          <div className="flex items-center gap-3">

            <div className="relative">

              <div className="
                w-11 h-11
                rounded-full
                bg-[#8ee276]
                text-[#103523]
                flex items-center justify-center
                text-sm
                font-bold
              ">
                {initial}
              </div>

              <span className="
                absolute
                right-0
                bottom-0
                w-3
                h-3
                rounded-full
                bg-[#8ee276]
                border-2
                border-[#0d2117]"
              />

            </div>


            <div className="hidden sm:block">

              <p className="max-w-[160px] truncate text-sm font-semibold text-white">
                {displayName}
              </p>

              <p className="mt-1 text-[9px] uppercase tracking-[0.15em] text-white/35">
                Digital Hero
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* Lime accent */}
      <div className="h-[2px] bg-[#8ee276]" />

    </header>
  );
}