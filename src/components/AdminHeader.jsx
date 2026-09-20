import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminHeader() {
  const location = useLocation();
  const { profile, user } = useAuth();

  const getPageInfo = () => {
    switch (location.pathname) {
      case "/admin":
        return {
          eyebrow: "Control Center",
          title: "Overview",
          description: "Monitor the Digital Heroes platform",
        };

      case "/admin/users":
        return {
          eyebrow: "Management",
          title: "Users",
          description: "Manage members and account activity",
        };

      case "/admin/draws":
        return {
          eyebrow: "Operations",
          title: "Draws",
          description: "Create, simulate and publish monthly draws",
        };

      case "/admin/charities":
        return {
          eyebrow: "Impact",
          title: "Charities",
          description: "Manage supported causes and contributions",
        };

      case "/admin/winners":
        return {
          eyebrow: "Rewards",
          title: "Winners",
          description: "Review winners and reward verification",
        };

      case "/admin/reports":
        return {
          eyebrow: "Analytics",
          title: "Reports",
          description: "Review platform performance and impact",
        };

      default:
        return {
          eyebrow: "Admin Console",
          title: "Overview",
          description: "Digital Heroes administration",
        };
    }
  };

  const page = getPageInfo();

  const displayName =
    profile?.full_name ||
    user?.email?.split("@")[0] ||
    "Administrator";

  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header
      className="
        sticky
        top-[68px]
        lg:top-0
        z-40
        w-full
        bg-[#0b1711]
        text-white
        border-b
        border-white/10
      "
    >

      {/* Background */}

      <div className="absolute inset-0 overflow-hidden pointer-events-none">

        <div className="
          absolute
          -top-24
          right-5
          sm:right-10
          w-56
          sm:w-72
          h-56
          sm:h-72
          rounded-full
          bg-[#47775f]/15
          blur-3xl
        " />

        <div className="
          absolute
          top-0
          right-1/3
          w-40
          sm:w-52
          h-40
          sm:h-52
          rounded-full
          bg-[#8ee276]/[0.04]
          blur-3xl"
        />

      </div>


      {/* Main */}

      <div className="
        relative
        min-h-[82px]
        sm:min-h-[88px]
        px-4
        sm:px-6
        lg:px-8
        xl:px-10
        py-4
        flex
        items-center
        justify-between
        gap-4
      ">

        {/* LEFT */}

        <div className="min-w-0 flex-1">

          {/* <div className="flex items-center gap-2 mb-1.5">

            <span className="w-4 sm:w-5 h-[2px] bg-[#8ee276] shrink-0" />

            <span className="
              truncate
              text-[7px]
              sm:text-[8px]
              uppercase
              tracking-[0.2em]
              sm:tracking-[0.22em]
              text-[#8ee276]
              font-bold
            ">
              {page.eyebrow}
            </span>

          </div> */}

          <h1 className="
            text-base
            sm:text-lg
            lg:text-xl
            tracking-[-0.035em]
            text-white
            truncate
          ">
            {page.title}
          </h1>

          <p className="
            hidden
            sm:block
            mt-1
            text-[11px]
            lg:text-xs
            text-white/40
            truncate
          ">
            {page.description}
          </p>

        </div>


        {/* RIGHT */}

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">

          {/* System */}

          <div className="
            hidden
            md:flex
            items-center
            gap-2
            px-3
            py-2
            rounded-lg
            bg-white/[0.045]
            border
            border-white/10
          ">

            <span className="relative flex w-2 h-2 shrink-0">
              <span className="absolute inset-0 rounded-full bg-[#8ee276] animate-ping opacity-40" />
              <span className="relative w-2 h-2 rounded-full bg-[#8ee276]" />
            </span>

            <div className="leading-none">

              <p className="text-[7px] uppercase tracking-[0.15em] font-bold text-white/30">
                System
              </p>

              <p className="mt-1 text-[8px] font-semibold text-[#8ee276]">
                Operational
              </p>

            </div>

          </div>


          {/* Admin Console */}

          <div className="
            hidden
            xl:flex
            items-center
            gap-2
            px-3
            py-2
            rounded-lg
            bg-[#8ee276]/[0.06]
            border
            border-[#8ee276]/15
          ">

            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[#8ee276]"
            >
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M8 9h8" />
              <path d="M8 13h5" />
              <path d="M8 17h3" />
            </svg>

            <span className="
              text-[8px]
              uppercase
              tracking-[0.14em]
              font-semibold
              text-white/55
            ">
              Admin Console
            </span>

          </div>


          {/* Notification */}

          <button
            type="button"
            aria-label="Admin notifications"
            className="
              relative
              w-9
              h-9
              sm:w-10
              sm:h-10
              rounded-lg
              bg-white/[0.045]
              border
              border-white/10
              flex
              items-center
              justify-center
              text-white/55
              hover:bg-[#8ee276]
              hover:text-[#0b1711]
              hover:border-[#8ee276]
              transition-all
            "
          >

            <svg
              width="16"
              height="16"
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

            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#8ee276]" />

          </button>


          {/* Divider */}

          <div className="hidden sm:block h-8 w-px bg-white/10" />


          {/* Profile */}

          <div className="flex items-center gap-2 sm:gap-2.5">

            <div className="relative shrink-0">

              <div className="
                w-9
                h-9
                sm:w-10
                sm:h-10
                rounded-lg
                bg-[#8ee276]
                text-[#0b1711]
                flex
                items-center
                justify-center
                text-xs
                sm:text-sm
                font-bold
              ">
                {initial}
              </div>

              <span className="
                absolute
                right-0
                bottom-0
                w-2
                h-2
                sm:w-2.5
                sm:h-2.5
                rounded-full
                bg-[#8ee276]
                border-2
                border-[#0b1711]"
              />

            </div>

            <div className="hidden sm:block">

              <p className="
                max-w-[120px]
                lg:max-w-[150px]
                truncate
                text-xs
                font-semibold
                text-white
              ">
                {displayName}
              </p>

              <p className="
                mt-1
                text-[8px]
                uppercase
                tracking-[0.14em]
                text-[#8ee276]/60
                font-semibold
              ">
                Administrator
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* Accent */}

      <div className="h-[2px] bg-gradient-to-r from-[#8ee276] via-[#47775f] to-transparent" />

    </header>
  );
}