import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [subscriptionFilter, setSubscriptionFilter] = useState("all");

    useEffect(() => {
        fetchUsers();
    }, []);

    async function fetchUsers() {
        setLoading(true);

        const { data: profiles, error } = await supabase
            .from("profiles")
            .select(`
                id,
                full_name,
                email,
                role,
                charity_percentage,
                charity_id,
                created_at
            `)
            .order("created_at", {
                ascending: false,
            });

        if (error) {
            console.error(error);
            alert(error.message);
            setLoading(false);
            return;
        }

        const { data: subscriptions, error: subscriptionError } =
            await supabase
                .from("subscriptions")
                .select(
                    "user_id, plan, status, current_period_end"
                );

        if (subscriptionError) {
            console.error(subscriptionError);
        }

        const { data: charities, error: charityError } =
            await supabase
                .from("charities")
                .select("id, name");

        if (charityError) {
            console.error(charityError);
        }

        const subscriptionMap = {};

        (subscriptions || []).forEach((subscription) => {
            subscriptionMap[subscription.user_id] = subscription;
        });

        const charityMap = {};

        (charities || []).forEach((charity) => {
            charityMap[charity.id] = charity.name;
        });

        const formattedUsers = (profiles || []).map((profile) => ({
            ...profile,
            subscription:
                subscriptionMap[profile.id] || null,
            charityName:
                charityMap[profile.charity_id] ||
                "Not selected",
        }));

        setUsers(formattedUsers);
        setLoading(false);
    }

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const searchValue = search.toLowerCase().trim();

            const matchesSearch =
                !searchValue ||
                user.full_name
                    ?.toLowerCase()
                    .includes(searchValue) ||
                user.email
                    ?.toLowerCase()
                    .includes(searchValue) ||
                user.charityName
                    ?.toLowerCase()
                    .includes(searchValue);

            const matchesRole =
                roleFilter === "all" ||
                user.role === roleFilter;

            const matchesSubscription =
                subscriptionFilter === "all" ||
                (subscriptionFilter === "active" &&
                    user.subscription?.status === "active") ||
                (subscriptionFilter === "inactive" &&
                    (!user.subscription ||
                        user.subscription.status !== "active"));

            return (
                matchesSearch &&
                matchesRole &&
                matchesSubscription
            );
        });
    }, [
        users,
        search,
        roleFilter,
        subscriptionFilter,
    ]);

    const activeUsers = users.filter(
        (user) => user.subscription?.status === "active"
    ).length;

    const adminUsers = users.filter(
        (user) => user.role === "admin"
    ).length;

    const usersWithCharity = users.filter(
        (user) => user.charity_id
    ).length;

    const averageContribution =
        users.length > 0
            ? Math.round(
                  users.reduce(
                      (total, user) =>
                          total +
                          Number(user.charity_percentage || 0),
                      0
                  ) / users.length
              )
            : 0;

    return (
        <div className="min-h-screen bg-[#f3f1e8] text-[#17231c]">

            {/* =================================================
                HEADER
            ================================================== */}
            <section className="bg-[#102019] text-white">

                <div className="px-5 py-7 sm:px-7 lg:px-10 lg:py-9">

                    <div className="mx-auto max-w-[1500px]">

                        <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">

                            <div>

                                <div className="mb-4 flex items-center gap-3">

                                    <span className="h-[2px] w-8 bg-[#8ee276]" />

                                    <span className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[#8ee276]">
                                        Admin / Members
                                    </span>

                                </div>

                                <h1 className="text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
                                    Member directory
                                </h1>

                                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">
                                    View member accounts, membership activity,
                                    charity preferences and contribution settings.
                                </p>

                            </div>

                            <div className="flex items-center gap-3">

                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#8ee276] text-sm font-bold text-[#173023]">
                                    {loading ? "—" : users.length}
                                </div>

                                <div>
                                    <p className="text-[9px] uppercase tracking-[0.18em] text-white/35">
                                        Registered
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-white/80">
                                        Platform members
                                    </p>
                                </div>

                            </div>

                        </div>

                    </div>

                </div>

                <div className="h-[3px] bg-[#8ee276]" />

            </section>


            {/* =================================================
                STAT STRIP
            ================================================== */}
            <section className="border-b border-[#cfd6cc] bg-[#dfe7dc]">

                <div className="mx-auto grid max-w-[1500px] grid-cols-2 divide-x divide-[#c4cec2] lg:grid-cols-4">

                    <OverviewStat
                        label="Total members"
                        value={loading ? "—" : users.length}
                        code="01"
                    />

                    <OverviewStat
                        label="Active memberships"
                        value={loading ? "—" : activeUsers}
                        code="02"
                        accent
                    />

                    <OverviewStat
                        label="Admins"
                        value={loading ? "—" : adminUsers}
                        code="03"
                    />

                    <OverviewStat
                        label="Charity participation"
                        value={
                            loading
                                ? "—"
                                : `${users.length
                                      ? Math.round(
                                            (usersWithCharity /
                                                users.length) *
                                                100
                                        )
                                      : 0}%`
                        }
                        code="04"
                    />

                </div>

            </section>


            {/* =================================================
                MAIN CONTENT
            ================================================== */}
            <main className="px-5 py-6 sm:px-7 lg:px-10 lg:py-8">

                <div className="mx-auto max-w-[1500px]">

                    {/* =================================================
                        DIRECTORY TOOLBAR
                    ================================================== */}
                    <section className="rounded-2xl border border-[#d1d8cf] bg-white shadow-[0_8px_30px_rgba(16,32,25,0.04)]">

                        <div className="border-b border-[#e0e5df] p-5 sm:p-6">

                            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

                                <div>

                                    <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#47775f]">
                                        Member directory
                                    </p>

                                    <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em]">
                                        All registered users
                                    </h2>

                                </div>

                                <div className="flex flex-wrap items-center gap-2">

                                    <FilterPill
                                        active={
                                            roleFilter === "all"
                                        }
                                        onClick={() =>
                                            setRoleFilter("all")
                                        }
                                    >
                                        All roles
                                    </FilterPill>

                                    <FilterPill
                                        active={
                                            roleFilter === "user"
                                        }
                                        onClick={() =>
                                            setRoleFilter("user")
                                        }
                                    >
                                        Members
                                    </FilterPill>

                                    <FilterPill
                                        active={
                                            roleFilter === "admin"
                                        }
                                        onClick={() =>
                                            setRoleFilter("admin")
                                        }
                                    >
                                        Admins
                                    </FilterPill>

                                </div>

                            </div>


                            {/* Search + subscription filters */}
                            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]">

                                <div className="relative">

                                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#89948b]">
                                        <SearchIcon />
                                    </span>

                                    <input
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        placeholder="Search by name, email or charity..."
                                        className="h-12 w-full rounded-xl border border-[#d6ddd5] bg-[#f8f9f6] pl-11 pr-4 text-sm outline-none transition focus:border-[#47775f] focus:ring-2 focus:ring-[#8ee276]/20"
                                    />

                                </div>

                                <select
                                    value={subscriptionFilter}
                                    onChange={(e) =>
                                        setSubscriptionFilter(
                                            e.target.value
                                        )
                                    }
                                    className="h-12 rounded-xl border border-[#d6ddd5] bg-[#f8f9f6] px-4 text-sm text-[#405046] outline-none focus:border-[#47775f]"
                                >
                                    <option value="all">
                                        All subscriptions
                                    </option>

                                    <option value="active">
                                        Active only
                                    </option>

                                    <option value="inactive">
                                        No active subscription
                                    </option>
                                </select>

                            </div>

                        </div>


                        {/* Results count */}
                        <div className="flex flex-col gap-2 border-b border-[#e0e5df] bg-[#fafbf8] px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">

                            <p className="text-xs text-[#78847b]">
                                Showing{" "}
                                <span className="font-semibold text-[#294034]">
                                    {filteredUsers.length}
                                </span>{" "}
                                of{" "}
                                <span className="font-semibold text-[#294034]">
                                    {users.length}
                                </span>{" "}
                                members
                            </p>

                            {(search ||
                                roleFilter !== "all" ||
                                subscriptionFilter !== "all") && (
                                <button
                                    onClick={() => {
                                        setSearch("");
                                        setRoleFilter("all");
                                        setSubscriptionFilter("all");
                                    }}
                                    className="text-left text-[10px] font-semibold uppercase tracking-[0.13em] text-[#47775f] hover:text-[#173023]"
                                >
                                    Clear filters
                                </button>
                            )}

                        </div>


                        {/* =================================================
                            USERS
                        ================================================== */}
                        {loading ? (

                            <LoadingState />

                        ) : filteredUsers.length === 0 ? (

                            <EmptyState
                                hasFilters={
                                    search ||
                                    roleFilter !== "all" ||
                                    subscriptionFilter !== "all"
                                }
                                onClear={() => {
                                    setSearch("");
                                    setRoleFilter("all");
                                    setSubscriptionFilter("all");
                                }}
                            />

                        ) : (

                            <div>

                                {/* Desktop table */}
                                <div className="hidden overflow-x-auto lg:block">

                                    <table className="w-full min-w-[1050px] text-left">

                                        <thead>

                                            <tr className="border-b border-[#dce2da] bg-[#edf1eb]">

                                                <TableHeading>
                                                    Member
                                                </TableHeading>

                                                <TableHeading>
                                                    Access
                                                </TableHeading>

                                                <TableHeading>
                                                    Membership
                                                </TableHeading>

                                                <TableHeading>
                                                    Impact
                                                </TableHeading>

                                                <TableHeading>
                                                    Joined
                                                </TableHeading>

                                                <TableHeading>
                                                    Status
                                                </TableHeading>

                                            </tr>

                                        </thead>

                                        <tbody>

                                            {filteredUsers.map(
                                                (user, index) => (
                                                    <UserTableRow
                                                        key={user.id}
                                                        user={user}
                                                        index={index}
                                                    />
                                                )
                                            )}

                                        </tbody>

                                    </table>

                                </div>


                                {/* Mobile/tablet cards */}
                                <div className="divide-y divide-[#e0e5df] lg:hidden">

                                    {filteredUsers.map(
                                        (user, index) => (
                                            <UserMobileCard
                                                key={user.id}
                                                user={user}
                                                index={index}
                                            />
                                        )
                                    )}

                                </div>

                            </div>

                        )}

                    </section>


                    {/* =================================================
                        BOTTOM INSIGHT
                    ================================================== */}
                    <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">

                        <InsightCard
                            label="Active membership rate"
                            value={`${subscriptionRate(users)}%`}
                            description="Members with an active subscription."
                        />

                        <InsightCard
                            label="Charity participation"
                            value={
                                users.length
                                    ? `${Math.round(
                                          (usersWithCharity /
                                              users.length) *
                                              100
                                      )}%`
                                    : "0%"
                            }
                            description="Members who have selected a cause."
                        />

                        <InsightCard
                            label="Average contribution"
                            value={`${averageContribution}%`}
                            description="Average charity allocation across members."
                            accent
                        />

                    </section>


                    {/* Bottom statement */}
                    <section className="mt-8 overflow-hidden rounded-2xl bg-[#103523] text-white">

                        <div className="relative px-6 py-8 sm:px-8">

                            <div className="absolute -right-10 -top-20 h-56 w-56 rounded-full bg-[#8ee276]/10 blur-3xl" />

                            <div className="relative max-w-3xl">

                                <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#8ee276]">
                                    Members / Platform
                                </p>

                                <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
                                    Every member has a place in the impact.
                                </h3>

                                <p className="mt-3 text-sm leading-6 text-white/45">
                                    Use the member directory to understand
                                    participation, membership activity and
                                    charity preferences across the platform.
                                </p>

                            </div>

                        </div>

                    </section>

                </div>

            </main>

        </div>
    );
}


/* ============================================================
   TABLE ROW
============================================================ */

function UserTableRow({ user, index }) {
    const initials = getInitials(user.full_name);

    const isActive =
        user.subscription?.status === "active";

    return (
        <tr className="group border-b border-[#e0e5df] transition hover:bg-[#f5f7f3]">

            {/* Member */}
            <td className="px-6 py-5">

                <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#dfe9df] text-xs font-bold text-[#315b46]">
                        {initials}
                    </div>

                    <div className="min-w-0">

                        <p className="truncate text-sm font-semibold text-[#23372b]">
                            {user.full_name ||
                                "Unnamed user"}
                        </p>

                        <p className="mt-1 max-w-[230px] truncate text-xs text-[#8a958c]">
                            {user.email}
                        </p>

                    </div>

                </div>

            </td>


            {/* Role */}
            <td className="px-6 py-5">

                <RoleBadge role={user.role} />

            </td>


            {/* Membership */}
            <td className="px-6 py-5">

                {user.subscription ? (
                    <div>

                        <StatusBadge
                            active={isActive}
                            text={
                                user.subscription.status
                            }
                        />

                        <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.1em] text-[#8b958d]">
                            {user.subscription.plan}
                        </p>

                    </div>
                ) : (
                    <span className="text-xs text-[#8b958d]">
                        No subscription
                    </span>
                )}

            </td>


            {/* Impact */}
            <td className="px-6 py-5">

                <div className="max-w-[180px]">

                    <p className="truncate text-sm font-medium text-[#33483b]">
                        {user.charityName}
                    </p>

                    <div className="mt-2 flex items-center gap-2">

                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#dce4da]">
                            <div
                                className="h-full rounded-full bg-[#6c9278]"
                                style={{
                                    width: `${Math.min(
                                        Number(
                                            user.charity_percentage ||
                                                0
                                        ),
                                        100
                                    )}%`,
                                }}
                            />
                        </div>

                        <span className="font-mono text-[9px] text-[#718077]">
                            {user.charity_percentage || 0}%
                        </span>

                    </div>

                </div>

            </td>


            {/* Joined */}
            <td className="px-6 py-5">

                <p className="text-xs text-[#68756d]">
                    {formatDate(user.created_at)}
                </p>

            </td>


            {/* Status */}
            <td className="px-6 py-5">

                <div className="flex items-center gap-2">

                    <span
                        className={`h-2 w-2 rounded-full ${
                            isActive
                                ? "bg-[#73c85c]"
                                : "bg-[#b6beb7]"
                        }`}
                    />

                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#718077]">
                        {isActive
                            ? "Active"
                            : "Inactive"}
                    </span>

                </div>

            </td>

        </tr>
    );
}


/* ============================================================
   MOBILE USER CARD
============================================================ */

function UserMobileCard({ user, index }) {
    const initials = getInitials(user.full_name);

    const isActive =
        user.subscription?.status === "active";

    return (
        <div className="p-5">

            <div className="flex items-start justify-between gap-4">

                <div className="flex min-w-0 items-center gap-3">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#dfe9df] text-xs font-bold text-[#315b46]">
                        {initials}
                    </div>

                    <div className="min-w-0">

                        <p className="truncate text-sm font-semibold text-[#23372b]">
                            {user.full_name ||
                                "Unnamed user"}
                        </p>

                        <p className="mt-1 truncate text-xs text-[#8a958c]">
                            {user.email}
                        </p>

                    </div>

                </div>

                <span className="font-mono text-[9px] text-[#a0aaa3]">
                    {String(index + 1).padStart(2, "0")}
                </span>

            </div>


            <div className="mt-5 grid grid-cols-2 gap-3">

                <InfoBox
                    label="Role"
                    value={user.role}
                />

                <InfoBox
                    label="Membership"
                    value={
                        user.subscription?.status ||
                        "None"
                    }
                    green={isActive}
                />

                <InfoBox
                    label="Charity"
                    value={user.charityName}
                />

                <InfoBox
                    label="Contribution"
                    value={`${user.charity_percentage || 0}%`}
                />

            </div>


            <div className="mt-4 flex items-center justify-between border-t border-[#e4e8e2] pt-4">

                <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#9aa39c]">
                    Joined
                </span>

                <span className="text-xs text-[#68756d]">
                    {formatDate(user.created_at)}
                </span>

            </div>

        </div>
    );
}


/* ============================================================
   OVERVIEW STAT
============================================================ */

function OverviewStat({
    label,
    value,
    code,
    accent = false,
}) {
    return (
        <div className="px-5 py-5 sm:px-7">

            <div className="flex items-center gap-2">

                <span className="font-mono text-[8px] text-[#8c988f]">
                    {code}
                </span>

                <span
                    className={`h-1.5 w-1.5 rounded-full ${
                        accent
                            ? "bg-[#47775f]"
                            : "bg-[#aab5ac]"
                    }`}
                />

            </div>

            <p className="mt-4 text-[9px] font-bold uppercase tracking-[0.17em] text-[#6d7a71]">
                {label}
            </p>

            <p
                className={`mt-1 font-mono text-2xl font-medium tracking-[-0.04em] ${
                    accent
                        ? "text-[#315f48]"
                        : "text-[#263a2e]"
                }`}
            >
                {value}
            </p>

        </div>
    );
}


/* ============================================================
   TABLE HEADING
============================================================ */

function TableHeading({ children }) {
    return (
        <th className="px-6 py-3.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#68766d]">
            {children}
        </th>
    );
}


/* ============================================================
   FILTER PILL
============================================================ */

function FilterPill({
    children,
    active,
    onClick,
}) {
    return (
        <button
            onClick={onClick}
            className={`rounded-full px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] transition ${
                active
                    ? "bg-[#173b2a] text-[#8ee276]"
                    : "bg-[#edf1eb] text-[#748078] hover:bg-[#dfe7dc] hover:text-[#31563f]"
            }`}
        >
            {children}
        </button>
    );
}


/* ============================================================
   ROLE BADGE
============================================================ */

function RoleBadge({ role }) {
    const isAdmin = role === "admin";

    return (
        <span
            className={`inline-flex rounded-full px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] ${
                isAdmin
                    ? "bg-[#dcebdd] text-[#315f48]"
                    : "bg-[#eef0ec] text-[#718078]"
            }`}
        >
            {role || "user"}
        </span>
    );
}


/* ============================================================
   STATUS BADGE
============================================================ */

function StatusBadge({ active, text }) {
    return (
        <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.1em] ${
                active
                    ? "bg-[#dcebdd] text-[#315f48]"
                    : "bg-[#eee9e6] text-[#8b6d66]"
            }`}
        >
            <span
                className={`h-1.5 w-1.5 rounded-full ${
                    active
                        ? "bg-[#6fbe5b]"
                        : "bg-[#b69c94]"
                }`}
            />

            {text}
        </span>
    );
}


/* ============================================================
   INFO BOX
============================================================ */

function InfoBox({
    label,
    value,
    green = false,
}) {
    return (
        <div className="rounded-xl bg-[#f5f7f3] p-3">

            <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-[#929d95]">
                {label}
            </p>

            <p
                className={`mt-1 truncate text-xs font-semibold capitalize ${
                    green
                        ? "text-[#47775f]"
                        : "text-[#405047]"
                }`}
            >
                {value || "—"}
            </p>

        </div>
    );
}


/* ============================================================
   INSIGHT CARD
============================================================ */

function InsightCard({
    label,
    value,
    description,
    accent = false,
}) {
    return (
        <div
            className={`rounded-2xl border p-5 ${
                accent
                    ? "border-[#b8ccb9] bg-[#dfe9df]"
                    : "border-[#d5dbd3] bg-white"
            }`}
        >

            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#748078]">
                {label}
            </p>

            <p className="mt-2 font-mono text-3xl font-medium tracking-[-0.05em] text-[#31563f]">
                {value}
            </p>

            <p className="mt-2 text-xs leading-5 text-[#89938c]">
                {description}
            </p>

        </div>
    );
}


/* ============================================================
   LOADING
============================================================ */

function LoadingState() {
    return (
        <div className="flex flex-col items-center justify-center px-6 py-20">

            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#d5ddd4] border-t-[#47775f]" />

            <p className="mt-4 text-sm text-[#7b877f]">
                Loading member directory...
            </p>

        </div>
    );
}


/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyState({
    hasFilters,
    onClear,
}) {
    return (
        <div className="px-6 py-20 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e6ece4] text-[#47775f]">
                <UsersIcon />
            </div>

            <p className="mt-5 text-[9px] font-bold uppercase tracking-[0.2em] text-[#89948c]">
                {hasFilters
                    ? "No matching members"
                    : "Directory empty"}
            </p>

            <h3 className="mt-2 text-xl font-semibold text-[#26392d]">
                {hasFilters
                    ? "Nothing matched your filters."
                    : "No users found"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#8a948d]">
                {hasFilters
                    ? "Try changing your search or filter settings."
                    : "Registered members will appear here."}
            </p>

            {hasFilters && (
                <button
                    onClick={onClear}
                    className="mt-5 rounded-full bg-[#173b2a] px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8ee276]"
                >
                    Clear filters
                </button>
            )}

        </div>
    );
}


/* ============================================================
   HELPERS
============================================================ */

function getInitials(name) {
    if (!name) return "DH";

    const parts = name
        .trim()
        .split(" ")
        .filter(Boolean);

    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }

    return (
        parts[0][0] +
        parts[parts.length - 1][0]
    ).toUpperCase();
}

function formatDate(date) {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
}

function subscriptionRate(users) {
    if (!users.length) return 0;

    const active = users.filter(
        (user) =>
            user.subscription?.status === "active"
    ).length;

    return Math.round(
        (active / users.length) * 100
    );
}


/* ============================================================
   ICONS
============================================================ */

function SearchIcon() {
    return (
        <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
        </svg>
    );
}

function UsersIcon() {
    return (
        <svg
            width="19"
            height="19"
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
            width="19"
            height="19"
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
            width="19"
            height="19"
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
            width="19"
            height="19"
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
            width="19"
            height="19"
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