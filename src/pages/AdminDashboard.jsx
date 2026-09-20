import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    users: 0,
    activeSubscriptions: 0,
    charities: 0,
    publishedDraws: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    setLoading(true);

    try {
      const [
        usersResult,
        subscriptionsResult,
        charitiesResult,
        drawsResult,
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true }),

        supabase
          .from("subscriptions")
          .select("*", { count: "exact", head: true })
          .eq("status", "active"),

        supabase
          .from("charities")
          .select("*", { count: "exact", head: true })
          .eq("active", true),

        supabase
          .from("draws")
          .select("*", { count: "exact", head: true })
          .eq("status", "published"),
      ]);

      if (usersResult.error) throw usersResult.error;
      if (subscriptionsResult.error) throw subscriptionsResult.error;
      if (charitiesResult.error) throw charitiesResult.error;
      if (drawsResult.error) throw drawsResult.error;

      setStats({
        users: usersResult.count || 0,
        activeSubscriptions: subscriptionsResult.count || 0,
        charities: charitiesResult.count || 0,
        publishedDraws: drawsResult.count || 0,
      });
    } catch (error) {
      console.error("Failed to load admin stats:", error);
    } finally {
      setLoading(false);
    }
  }

  const adminName = profile?.full_name?.split(" ")[0] || "Admin";

  const subscriptionRate =
    stats.users > 0
      ? Math.round((stats.activeSubscriptions / stats.users) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-[#f3f1e8] text-[#17231c]">

      {/* =====================================================
          TOP FOREST HEADER
      ====================================================== */}
      <section className="relative overflow-hidden bg-[#102019] text-white">

        {/* subtle decorative shapes */}
        <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full bg-[#8ee276]/10 blur-3xl" />
        <div className="absolute bottom-[-100px] left-[35%] h-64 w-64 rounded-full bg-[#47775f]/20 blur-3xl" />

        <div className="relative px-5 py-7 sm:px-7 lg:px-10 lg:py-9">
          <div className="mx-auto max-w-[1500px]">

            <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">

              <div>
                <div className="mb-4 flex items-center gap-3">
                  <span className="h-[2px] w-8 bg-[#8ee276]" />

                  <span className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[#8ee276]">
                    Admin / Control Center
                  </span>
                </div>

                <h1 className="text-3xl font-semibold tracking-[-0.045em] sm:text-4xl lg:text-5xl">
                  Platform overview
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-white/55">
                  Good to see you, {adminName}. Monitor members, memberships,
                  charities and draw activity from one place.
                </p>
              </div>

              {/* status */}
              <div className="flex items-center gap-4 self-start border border-white/10 bg-white/[0.06] px-5 py-4 lg:self-auto">

                <div className="relative flex h-3 w-3">
                  <span className="absolute inset-0 animate-ping rounded-full bg-[#8ee276] opacity-40" />
                  <span className="relative h-3 w-3 rounded-full bg-[#8ee276]" />
                </div>

                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-white/35">
                    System status
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#8ee276]">
                    All systems operational
                  </p>
                </div>

              </div>

            </div>

          </div>
        </div>

        {/* green line */}
        <div className="h-[3px] bg-[#8ee276]" />
      </section>


      {/* =====================================================
          MAIN
      ====================================================== */}
      <main className="px-5 py-6 sm:px-7 lg:px-10 lg:py-8">

        <div className="mx-auto max-w-[1500px]">

          {/* =================================================
              STAT STRIP
          ================================================== */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <StatCard
              number="01"
              label="Total members"
              value={stats.users}
              description="Registered accounts"
              loading={loading}
              icon={<UsersIcon />}
            />

            <StatCard
              number="02"
              label="Active memberships"
              value={stats.activeSubscriptions}
              description={`${subscriptionRate}% of total members`}
              loading={loading}
              accent
              icon={<SubscriptionIcon />}
            />

            <StatCard
              number="03"
              label="Active charities"
              value={stats.charities}
              description="Currently supported causes"
              loading={loading}
              icon={<CharityIcon />}
            />

            <StatCard
              number="04"
              label="Published draws"
              value={stats.publishedDraws}
              description="Available draw cycles"
              loading={loading}
              icon={<DrawIcon />}
            />

          </section>


          {/* =================================================
              ACTIVITY + SYSTEM
          ================================================== */}
          <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_0.8fr]">

            {/* -----------------------------------------------
                ACTIVITY
            ------------------------------------------------ */}
            <div className="overflow-hidden rounded-2xl bg-[#dfe7dc]">

              <div className="flex items-center justify-between border-b border-[#bfcabe] px-5 py-5 sm:px-7">

                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#47775f]">
                    Platform activity
                  </p>

                  <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[#173023]">
                    Current snapshot
                  </h2>
                </div>

                <span className="hidden rounded-full bg-[#173023] px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.15em] text-[#8ee276] sm:block">
                  Live data
                </span>

              </div>


              <div className="p-5 sm:p-7">

                {/* activity rows */}
                <ActivityRow
                  number="01"
                  label="Registered members"
                  value={stats.users}
                  percentage={100}
                  accent
                />

                <ActivityRow
                  number="02"
                  label="Active memberships"
                  value={stats.activeSubscriptions}
                  percentage={subscriptionRate}
                />

                <ActivityRow
                  number="03"
                  label="Supported charities"
                  value={stats.charities}
                  percentage={
                    stats.charities > 0
                      ? Math.min(stats.charities * 10, 100)
                      : 0
                  }
                />

                <ActivityRow
                  number="04"
                  label="Published draws"
                  value={stats.publishedDraws}
                  percentage={
                    stats.publishedDraws > 0
                      ? Math.min(stats.publishedDraws * 10, 100)
                      : 0
                  }
                  last
                />

              </div>


              {/* lower impact panel */}
              <div className="border-t border-[#bfcabe] bg-[#cfdacb] px-5 py-5 sm:px-7">

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">

                  <ImpactStat
                    label="Members"
                    value={stats.users}
                  />

                  <ImpactStat
                    label="Active members"
                    value={stats.activeSubscriptions}
                  />

                  <ImpactStat
                    label="Causes supported"
                    value={stats.charities}
                  />

                </div>

              </div>

            </div>


            {/* -----------------------------------------------
                SYSTEM / QUICK ACCESS
            ------------------------------------------------ */}
            <div className="space-y-6">

              {/* System health */}
              <div className="rounded-2xl bg-[#183126] text-white">

                <div className="border-b border-white/10 px-5 py-5">

                  <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#8ee276]">
                    System health
                  </p>

                  <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em]">
                    Everything is running
                  </h2>

                </div>

                <div className="p-5">

                  <SystemRow
                    label="Database"
                    value="Operational"
                  />

                  <SystemRow
                    label="Authentication"
                    value="Operational"
                  />

                  <SystemRow
                    label="Storage"
                    value="Operational"
                  />

                  <SystemRow
                    label="Edge functions"
                    value="Operational"
                    last
                  />

                </div>

              </div>


              {/* Quick actions */}
              <div className="rounded-2xl bg-white p-5 shadow-[0_12px_35px_rgba(16,32,25,0.05)]">

                <div className="mb-4">

                  <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#47775f]">
                    Quick access
                  </p>

                  <h2 className="mt-1 text-lg font-semibold tracking-[-0.03em]">
                    Manage platform
                  </h2>

                </div>

                <QuickAction
                  number="01"
                  title="Users"
                  description="Members and accounts"
                  onClick={() => navigate("/admin/users")}
                />

                <QuickAction
                  number="02"
                  title="Draws"
                  description="Create and publish"
                  onClick={() => navigate("/admin/draws")}
                />

                <QuickAction
                  number="03"
                  title="Charities"
                  description="Manage causes"
                  onClick={() => navigate("/admin/charities")}
                />

                <QuickAction
                  number="04"
                  title="Winners"
                  description="Review rewards"
                  onClick={() => navigate("/admin/winners")}
                  last
                />

              </div>

            </div>

          </section>


          {/* =================================================
              MANAGEMENT AREA
          ================================================== */}
          <section className="mt-8">

            <div className="mb-4 flex items-end justify-between">

              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#47775f]">
                  Management
                </p>

                <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-[#173023]">
                  Platform modules
                </h2>
              </div>

              <span className="hidden text-xs text-[#7b857d] sm:block">
                Select a module to continue
              </span>

            </div>


            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

              <ManagementCard
                number="01"
                title="Users"
                description="Manage member accounts, roles and activity."
                value={stats.users}
                valueLabel="members"
                onClick={() => navigate("/admin/users")}
                icon={<UsersIcon />}
              />

              <ManagementCard
                number="02"
                title="Draws"
                description="Create, simulate and publish monthly draws."
                value={stats.publishedDraws}
                valueLabel="published"
                onClick={() => navigate("/admin/draws")}
                icon={<DrawIcon />}
              />

              <ManagementCard
                number="03"
                title="Charities"
                description="Manage supported causes and contribution settings."
                value={stats.charities}
                valueLabel="active"
                onClick={() => navigate("/admin/charities")}
                icon={<CharityIcon />}
              />

              <ManagementCard
                number="04"
                title="Winners"
                description="Review winners, proofs and reward status."
                value="→"
                valueLabel="review"
                onClick={() => navigate("/admin/winners")}
                icon={<TrophyIcon />}
              />

            </div>

          </section>


          {/* =================================================
              BOTTOM GREEN STATEMENT
          ================================================== */}
          <section className="mt-8 overflow-hidden rounded-2xl bg-[#103523] text-white">

            <div className="relative px-6 py-8 sm:px-8 lg:flex lg:items-center lg:justify-between">

              <div className="absolute -right-10 -top-20 h-56 w-56 rounded-full bg-[#8ee276]/10 blur-3xl" />

              <div className="relative">

                <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#8ee276]">
                  Digital Heroes / Administration
                </p>

                <h3 className="mt-3 max-w-2xl text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
                  Keep the platform moving.
                </h3>

                <p className="mt-2 max-w-xl text-sm leading-6 text-white/45">
                  Monitor activity, maintain the member experience and keep
                  every draw and charity cycle running smoothly.
                </p>

              </div>

              <div className="relative mt-6 flex items-center gap-3 lg:mt-0">

                <span className="h-2.5 w-2.5 rounded-full bg-[#8ee276]" />

                <span className="text-xs font-medium text-white/60">
                  System operational
                </span>

              </div>

            </div>

          </section>


          {/* footer */}
          <div className="flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">

            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#879087]">
              Digital Heroes Admin Console
            </p>

            <div className="flex gap-5 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#9aa39b]">
              <span>Production</span>
              <span>Secure</span>
              <span>Operational</span>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}


/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  number,
  label,
  value,
  description,
  loading,
  accent = false,
  icon,
}) {
  return (
    <div
      className={`group rounded-2xl border p-5 transition-all duration-300 sm:p-6 ${
        accent
          ? "border-[#8ee276]/30 bg-[#183126]"
          : "border-[#d3d9d0] bg-white"
      }`}
    >

      <div className="flex items-start justify-between">

        <span
          className={`text-[9px] font-bold uppercase tracking-[0.2em] ${
            accent ? "text-[#8ee276]" : "text-[#7d887f]"
          }`}
        >
          {number}
        </span>

        <div
          className={`transition-transform duration-300 group-hover:scale-110 ${
            accent ? "text-[#8ee276]" : "text-[#47775f]"
          }`}
        >
          {icon}
        </div>

      </div>

      <p
        className={`mt-7 text-[10px] font-semibold uppercase tracking-[0.15em] ${
          accent ? "text-white/45" : "text-[#7b857d]"
        }`}
      >
        {label}
      </p>

      <p
        className={`mt-1 font-mono text-4xl font-medium tracking-[-0.06em] ${
          accent ? "text-white" : "text-[#173023]"
        }`}
      >
        {loading ? "—" : value}
      </p>

      <p
        className={`mt-2 text-xs ${
          accent ? "text-white/35" : "text-[#8a938c]"
        }`}
      >
        {description}
      </p>

    </div>
  );
}


/* ============================================================
   ACTIVITY ROW
============================================================ */

function ActivityRow({
  number,
  label,
  value,
  percentage,
  accent = false,
  last = false,
}) {
  return (
    <div
      className={`py-5 ${
        !last ? "border-b border-[#bdc8bd]" : ""
      }`}
    >

      <div className="flex items-center gap-4">

        <span className="w-6 font-mono text-[9px] text-[#829087]">
          {number}
        </span>

        <div className="min-w-0 flex-1">

          <div className="flex items-center justify-between gap-4">

            <span className="text-sm font-medium text-[#294034]">
              {label}
            </span>

            <span className="font-mono text-sm font-semibold text-[#173023]">
              {value}
            </span>

          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#c4d0c4]">

            <div
              className={`h-full rounded-full transition-all duration-700 ${
                accent ? "bg-[#47775f]" : "bg-[#6e947d]"
              }`}
              style={{
                width: `${Math.min(Math.max(percentage, 3), 100)}%`,
              }}
            />

          </div>

        </div>

        <span className="hidden w-10 text-right font-mono text-[9px] text-[#7c887f] sm:block">
          {percentage}%
        </span>

      </div>

    </div>
  );
}


/* ============================================================
   IMPACT STAT
============================================================ */

function ImpactStat({ label, value }) {
  return (
    <div>

      <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-[#607366]">
        {label}
      </p>

      <p className="mt-1 font-mono text-2xl font-medium tracking-[-0.04em] text-[#173023]">
        {value}
      </p>

    </div>
  );
}


/* ============================================================
   SYSTEM ROW
============================================================ */

function SystemRow({ label, value, last = false }) {
  return (
    <div
      className={`flex items-center justify-between py-3.5 ${
        !last ? "border-b border-white/[0.08]" : ""
      }`}
    >

      <div className="flex items-center gap-3">

        <span className="h-2 w-2 rounded-full bg-[#8ee276]" />

        <span className="text-sm text-white/70">
          {label}
        </span>

      </div>

      <span className="text-[9px] font-semibold uppercase tracking-[0.13em] text-[#8ee276]">
        {value}
      </span>

    </div>
  );
}


/* ============================================================
   QUICK ACTION
============================================================ */

function QuickAction({
  number,
  title,
  description,
  onClick,
  last = false,
}) {
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center gap-4 py-3.5 text-left ${
        !last ? "border-b border-[#e1e5df]" : ""
      }`}
    >

      <span className="font-mono text-[9px] text-[#a0aaa2]">
        {number}
      </span>

      <div className="min-w-0 flex-1">

        <p className="text-sm font-semibold text-[#294034] transition-colors group-hover:text-[#47775f]">
          {title}
        </p>

        <p className="mt-0.5 text-[10px] text-[#929b94]">
          {description}
        </p>

      </div>

      <span className="text-[#a1aaa3] transition-all group-hover:translate-x-1 group-hover:text-[#47775f]">
        →
      </span>

    </button>
  );
}


/* ============================================================
   MANAGEMENT CARD
============================================================ */

function ManagementCard({
  number,
  title,
  description,
  value,
  valueLabel,
  onClick,
  icon,
}) {
  return (
    <button
      onClick={onClick}
      className="group rounded-2xl border border-[#d3d9d0] bg-white p-5 text-left shadow-[0_8px_30px_rgba(16,32,25,0.035)] transition-all duration-300 hover:-translate-y-1 hover:border-[#9fb0a2] hover:shadow-[0_14px_35px_rgba(16,32,25,0.08)] sm:p-6"
    >

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-3">

          <span className="font-mono text-[9px] text-[#9ba59d]">
            {number}
          </span>

          <span className="h-1 w-1 rounded-full bg-[#8ee276]" />

        </div>

        <div className="text-[#47775f] transition-all duration-300 group-hover:scale-110 group-hover:text-[#315f48]">
          {icon}
        </div>

      </div>


      <h3 className="mt-8 text-xl font-semibold tracking-[-0.035em] text-[#173023]">
        {title}
      </h3>

      <p className="mt-2 min-h-[42px] text-xs leading-5 text-[#7d877f]">
        {description}
      </p>


      <div className="mt-7 flex items-end justify-between border-t border-[#e1e5df] pt-4">

        <div>

          <p className="font-mono text-2xl font-medium tracking-[-0.05em] text-[#173023]">
            {value}
          </p>

          <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.16em] text-[#9aa39c]">
            {valueLabel}
          </p>

        </div>

        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#edf2ea] text-[#47775f] transition-all group-hover:bg-[#8ee276] group-hover:text-[#173023]">
          →
        </span>

      </div>

    </button>
  );
}


/* ============================================================
   ICONS
============================================================ */

function UsersIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="7" r="3" />
      <path d="M3 21v-2a6 6 0 0 1 12 0v2" />
      <path d="M16 4a3 3 0 0 1 0 6" />
      <path d="M21 21v-2a6 6 0 0 0-3-5.2" />
    </svg>
  );
}

function SubscriptionIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10h18" />
      <path d="M7 15h4" />
    </svg>
  );
}

function CharityIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.8 8.6c0 5.4-8.8 10.4-8.8 10.4S3.2 14 3.2 8.6A4.6 4.6 0 0 1 12 6.2a4.6 4.6 0 0 1 8.8 2.4Z" />
    </svg>
  );
}

function DrawIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12h8" />
      <path d="M12 8v8" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 4h8v4a4 4 0 0 1-8 0V4Z" />
      <path d="M12 12v5" />
      <path d="M8 21h8" />
      <path d="M9 17h6" />
      <path d="M8 6H4v2a4 4 0 0 0 4 4" />
      <path d="M16 6h4v2a4 4 0 0 1-4 4" />
    </svg>
  );
}