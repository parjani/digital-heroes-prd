import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AdminReports() {
    const [loading, setLoading] = useState(true);

    const [stats, setStats] = useState({
        totalUsers: 0,
        activeSubscriptions: 0,
        totalCharities: 0,
        totalDraws: 0,
        totalWinners: 0,
        totalPrizeAmount: 0,
        paidAmount: 0,
        pendingAmount: 0,
        totalCharityContributions: 0,
    });

    useEffect(() => {
        fetchReports();
    }, []);

    async function fetchReports() {
        setLoading(true);

        const [
            usersResult,
            subscriptionsResult,
            charitiesResult,
            drawsResult,
            winnersResult,
            contributionsResult,
        ] = await Promise.all([
            supabase
                .from("profiles")
                .select("id", {
                    count: "exact",
                    head: true,
                }),

            supabase
                .from("subscriptions")
                .select("id", {
                    count: "exact",
                    head: true,
                })
                .eq("status", "active"),

            // Actual charities column is `active`
            supabase
                .from("charities")
                .select("id", {
                    count: "exact",
                    head: true,
                })
                .eq("active", true),

            supabase
                .from("draws")
                .select("id", {
                    count: "exact",
                    head: true,
                }),

            supabase
                .from("winners")
                .select(
                    "id, prize_amount, payment_status"
                ),

            supabase
                .from("charity_contributions")
                .select("amount"),
        ]);

        if (usersResult.error) {
            console.error(usersResult.error);
        }

        if (subscriptionsResult.error) {
            console.error(
                subscriptionsResult.error
            );
        }

        if (charitiesResult.error) {
            console.error(charitiesResult.error);
        }

        if (drawsResult.error) {
            console.error(drawsResult.error);
        }

        if (winnersResult.error) {
            console.error(winnersResult.error);
        }

        if (contributionsResult.error) {
            console.error(
                contributionsResult.error
            );
        }

        const winners =
            winnersResult.data || [];

        const totalPrizeAmount = winners.reduce(
            (total, winner) =>
                total +
                Number(winner.prize_amount || 0),
            0
        );

        const paidAmount = winners
            .filter(
                (winner) =>
                    winner.payment_status === "paid"
            )
            .reduce(
                (total, winner) =>
                    total +
                    Number(
                        winner.prize_amount || 0
                    ),
                0
            );

        const pendingAmount = winners
            .filter(
                (winner) =>
                    winner.payment_status !== "paid"
            )
            .reduce(
                (total, winner) =>
                    total +
                    Number(
                        winner.prize_amount || 0
                    ),
                0
            );

        const totalCharityContributions = (
            contributionsResult.data || []
        ).reduce(
            (total, contribution) =>
                total +
                Number(contribution.amount || 0),
            0
        );

        setStats({
            totalUsers:
                usersResult.count || 0,

            activeSubscriptions:
                subscriptionsResult.count || 0,

            totalCharities:
                charitiesResult.count || 0,

            totalDraws:
                drawsResult.count || 0,

            totalWinners:
                winners.length,

            totalPrizeAmount,

            paidAmount,

            pendingAmount,

            totalCharityContributions,
        });

        setLoading(false);
    }

    const payoutRate = useMemo(() => {
        if (!stats.totalPrizeAmount) {
            return 0;
        }

        return Math.round(
            (stats.paidAmount /
                stats.totalPrizeAmount) *
                100
        );
    }, [
        stats.totalPrizeAmount,
        stats.paidAmount,
    ]);

    const subscriptionRate = useMemo(() => {
        if (!stats.totalUsers) {
            return 0;
        }

        return Math.round(
            (stats.activeSubscriptions /
                stats.totalUsers) *
                100
        );
    }, [
        stats.totalUsers,
        stats.activeSubscriptions,
    ]);

    const formatCurrency = (value) =>
        `₹${Number(value || 0).toLocaleString(
            "en-IN"
        )}`;

    return (
        <div className="min-h-screen bg-[#f3f1e8] text-[#101813]">

            {/* =====================================================
                HERO
            ===================================================== */}

            <section className="bg-[#102019] text-white border-b border-[#183126]">

                <div className="max-w-[1500px] mx-auto px-5 sm:px-7 lg:px-10">

                    <div className="py-9 lg:py-11">

                        <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-8">

                            <div className="max-w-3xl">

                                <div className="flex items-center gap-2 mb-4">

                                    <span className="w-2 h-2 rounded-full bg-[#8ee276]" />

                                    <p className="text-[10px] uppercase tracking-[0.22em] font-bold text-[#8ee276]">
                                        Analytics · Platform reports
                                    </p>

                                </div>

                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.055em] leading-[0.95]">
                                    Platform numbers.
                                    <span className="block text-[#8ee276]">
                                        Clearer decisions.
                                    </span>
                                </h1>

                                <p className="mt-6 text-sm sm:text-base text-white/60 leading-7 max-w-2xl">
                                    Monitor members, subscriptions,
                                    draws, winnings and charitable
                                    contribution activity from one
                                    reporting workspace.
                                </p>

                            </div>


                            {/* Refresh */}

                            <button
                                onClick={fetchReports}
                                disabled={loading}
                                className="shrink-0 h-11 px-5 rounded-xl bg-[#8ee276] text-[#103523] text-xs font-bold transition hover:bg-[#a0ed89] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                            >
                                {loading
                                    ? "Refreshing..."
                                    : (
                                        <span className="flex items-center gap-2">
                                            Refresh reports
                                            <span>↻</span>
                                        </span>
                                    )}
                            </button>

                        </div>

                    </div>

                </div>

            </section>


            {/* =====================================================
                MAIN
            ===================================================== */}

            <main className="max-w-[1500px] mx-auto px-5 sm:px-7 lg:px-10 py-8 lg:py-10">

                {loading ? (

                    <LoadingState />

                ) : (

                    <>

                        {/* =================================================
                            KPI GRID
                        ================================================= */}

                        <section>

                            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5">

                                <div>

                                    <div className="flex items-center gap-2">

                                        <span className="w-1.5 h-1.5 rounded-full bg-[#8ee276]" />

                                        <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#47775f]">
                                            Platform overview
                                        </p>

                                    </div>

                                    <h2 className="mt-1 text-2xl font-bold tracking-[-0.04em]">
                                        Key performance metrics
                                    </h2>

                                </div>

                                <span className="text-[10px] uppercase tracking-[0.13em] font-bold text-[#8a918b]">
                                    Live database snapshot
                                </span>

                            </div>


                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

                                <MetricCard
                                    label="Members"
                                    value={
                                        stats.totalUsers
                                    }
                                    description="Registered accounts"
                                    index="01"
                                />

                                <MetricCard
                                    label="Active members"
                                    value={
                                        stats.activeSubscriptions
                                    }
                                    description="Active subscriptions"
                                    index="02"
                                    accent
                                />

                                <MetricCard
                                    label="Charities"
                                    value={
                                        stats.totalCharities
                                    }
                                    description="Active causes"
                                    index="03"
                                />

                                <MetricCard
                                    label="Draws"
                                    value={
                                        stats.totalDraws
                                    }
                                    description="Created draws"
                                    index="04"
                                />

                                <MetricCard
                                    label="Winners"
                                    value={
                                        stats.totalWinners
                                    }
                                    description="Winning records"
                                    index="05"
                                />

                                <MetricCard
                                    label="Prize value"
                                    value={formatCurrency(
                                        stats.totalPrizeAmount
                                    )}
                                    description="Total recorded prizes"
                                    index="06"
                                />

                                <MetricCard
                                    label="Paid winnings"
                                    value={formatCurrency(
                                        stats.paidAmount
                                    )}
                                    description="Completed payouts"
                                    index="07"
                                    accent
                                />

                                <MetricCard
                                    label="Pending winnings"
                                    value={formatCurrency(
                                        stats.pendingAmount
                                    )}
                                    description="Awaiting payout"
                                    index="08"
                                    warning
                                />

                            </div>

                        </section>


                        {/* =================================================
                            FINANCIAL + IMPACT
                        ================================================= */}

                        <section className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6 mt-6">


                            {/* Financial */}

                            <div className="rounded-2xl border border-[#cfd4c8] bg-[#f8f7f1] overflow-hidden">

                                <PanelHeader
                                    eyebrow="Financial overview"
                                    title="Prize and payout flow"
                                    meta="Winnings"
                                />

                                <div className="p-6 sm:p-7">

                                    <div className="grid sm:grid-cols-3 gap-3">

                                        <FinanceCard
                                            label="Total prize"
                                            value={formatCurrency(
                                                stats.totalPrizeAmount
                                            )}
                                        />

                                        <FinanceCard
                                            label="Paid"
                                            value={formatCurrency(
                                                stats.paidAmount
                                            )}
                                            positive
                                        />

                                        <FinanceCard
                                            label="Pending"
                                            value={formatCurrency(
                                                stats.pendingAmount
                                            )}
                                            warning
                                        />

                                    </div>


                                    {/* Progress */}

                                    <div className="mt-7 pt-6 border-t border-[#cfd4c8]">

                                        <div className="flex items-center justify-between mb-3">

                                            <div>

                                                <p className="text-sm font-bold">
                                                    Payout completion
                                                </p>

                                                <p className="mt-1 text-[10px] text-[#8a918b]">
                                                    Paid prize value versus total prize value
                                                </p>

                                            </div>

                                            <span className="text-lg font-bold text-[#47775f]">
                                                {payoutRate}%
                                            </span>

                                        </div>

                                        <div className="h-2 rounded-full bg-[#dfe5da] overflow-hidden">

                                            <div
                                                className="h-full rounded-full bg-[#47775f] transition-all"
                                                style={{
                                                    width: `${Math.min(
                                                        payoutRate,
                                                        100
                                                    )}%`,
                                                }}
                                            />

                                        </div>

                                    </div>

                                </div>

                            </div>


                            {/* Charity impact */}

                            <div className="rounded-2xl bg-[#103523] text-white overflow-hidden">

                                <div className="p-6 sm:p-7">

                                    <div className="flex items-center justify-between">

                                        <div>

                                            <p className="text-[9px] uppercase tracking-[0.18em] font-bold text-[#8ee276]">
                                                Impact
                                            </p>

                                            <h2 className="mt-2 text-xl font-bold tracking-[-0.035em]">
                                                Charity contribution
                                            </h2>

                                        </div>

                                        <span className="w-10 h-10 rounded-xl bg-white/10 text-[#8ee276] flex items-center justify-center">
                                            ↗
                                        </span>

                                    </div>


                                    <div className="mt-10">

                                        <p className="text-4xl sm:text-5xl font-bold tracking-[-0.055em] text-[#8ee276]">
                                            {formatCurrency(
                                                stats.totalCharityContributions
                                            )}
                                        </p>

                                        <p className="mt-3 text-xs text-white/50">
                                            Total recorded charitable
                                            contribution value.
                                        </p>

                                    </div>


                                    <div className="grid grid-cols-2 gap-3 mt-8">

                                        <DarkStat
                                            label="Active causes"
                                            value={
                                                stats.totalCharities
                                            }
                                        />

                                        <DarkStat
                                            label="Winners"
                                            value={
                                                stats.totalWinners
                                            }
                                        />

                                    </div>

                                </div>

                            </div>

                        </section>


                        {/* =================================================
                            ECOSYSTEM
                        ================================================= */}

                        <section className="mt-6 rounded-2xl border border-[#cfd4c8] bg-[#f8f7f1] overflow-hidden">

                            <PanelHeader
                                eyebrow="Platform ecosystem"
                                title="Activity at a glance"
                                meta="Operations"
                            />

                            <div className="grid md:grid-cols-3">

                                <EcosystemCard
                                    number="01"
                                    label="Members"
                                    value={
                                        stats.totalUsers
                                    }
                                    description="Registered users participating in the platform."
                                />

                                <EcosystemCard
                                    number="02"
                                    label="Subscriptions"
                                    value={
                                        stats.activeSubscriptions
                                    }
                                    description="Currently active memberships."
                                    accent
                                />

                                <EcosystemCard
                                    number="03"
                                    label="Draws"
                                    value={
                                        stats.totalDraws
                                    }
                                    description="Draw records created by administrators."
                                />

                            </div>

                        </section>


                        {/* =================================================
                            HEALTH / RATIOS
                        ================================================= */}

                        <section className="grid lg:grid-cols-2 gap-6 mt-6">


                            {/* Membership */}

                            <div className="rounded-2xl border border-[#cfd4c8] bg-[#dfe7dc] p-6 sm:p-7">

                                <p className="text-[9px] uppercase tracking-[0.18em] font-bold text-[#47775f]">
                                    Membership health
                                </p>

                                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mt-4">

                                    <div>

                                        <h2 className="text-2xl font-bold tracking-[-0.04em]">
                                            Active membership rate
                                        </h2>

                                        <p className="mt-2 text-xs text-[#687169]">
                                            Active subscriptions relative
                                            to registered profiles.
                                        </p>

                                    </div>

                                    <p className="text-4xl font-bold tracking-[-0.05em] text-[#47775f]">
                                        {subscriptionRate}%
                                    </p>

                                </div>

                                <div className="mt-6 h-2 rounded-full bg-[#c8d2c4] overflow-hidden">

                                    <div
                                        className="h-full rounded-full bg-[#47775f]"
                                        style={{
                                            width: `${Math.min(
                                                subscriptionRate,
                                                100
                                            )}%`,
                                        }}
                                    />

                                </div>

                            </div>


                            {/* Payout */}

                            <div className="rounded-2xl border border-[#cfd4c8] bg-[#f8f7f1] p-6 sm:p-7">

                                <p className="text-[9px] uppercase tracking-[0.18em] font-bold text-[#47775f]">
                                    Payout status
                                </p>

                                <h2 className="mt-4 text-2xl font-bold tracking-[-0.04em]">
                                    {stats.pendingAmount > 0
                                        ? "Rewards awaiting payout"
                                        : "All recorded winnings paid"}
                                </h2>

                                <div className="flex items-end justify-between gap-5 mt-7">

                                    <div>

                                        <p className="text-3xl font-bold tracking-[-0.05em] text-[#856f36]">
                                            {formatCurrency(
                                                stats.pendingAmount
                                            )}
                                        </p>

                                        <p className="mt-2 text-xs text-[#8a918b]">
                                            Outstanding prize value
                                        </p>

                                    </div>

                                    <div className="text-right">

                                        <p className="text-xs font-bold text-[#47775f]">
                                            {stats.totalWinners} winners
                                        </p>

                                        <p className="mt-1 text-[10px] text-[#8a918b]">
                                            Recorded
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </section>


                        {/* =================================================
                            FINAL IMPACT PANEL
                        ================================================= */}

                        <section className="mt-6 rounded-2xl bg-[#102019] text-white overflow-hidden">

                            <div className="p-7 sm:p-9 lg:p-11">

                                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">

                                    <div className="max-w-3xl">

                                        <div className="flex items-center gap-2 mb-4">

                                            <span className="w-2 h-2 rounded-full bg-[#8ee276]" />

                                            <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#8ee276]">
                                                Digital Heroes · Reporting
                                            </p>

                                        </div>

                                        <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.045em] leading-tight">
                                            Play better.
                                            <span className="block text-[#8ee276]">
                                                Give more. Make an impact.
                                            </span>
                                        </h2>

                                        <p className="mt-5 text-sm text-white/50 leading-6 max-w-xl">
                                            Platform reporting brings together
                                            member activity, subscriptions,
                                            draws, rewards and charitable
                                            contribution data.
                                        </p>

                                    </div>


                                    <div className="grid grid-cols-2 gap-3 sm:min-w-[280px]">

                                        <DarkStat
                                            label="Charity value"
                                            value={formatCurrency(
                                                stats.totalCharityContributions
                                            )}
                                        />

                                        <DarkStat
                                            label="Prize value"
                                            value={formatCurrency(
                                                stats.totalPrizeAmount
                                            )}
                                        />

                                    </div>

                                </div>

                            </div>

                        </section>

                    </>

                )}

            </main>

        </div>
    );
}


/* =============================================================
   METRIC CARD
============================================================= */

function MetricCard({
    label,
    value,
    description,
    index,
    accent = false,
    warning = false,
}) {
    return (
        <div className="rounded-2xl border border-[#cfd4c8] bg-[#f8f7f1] p-5 sm:p-6 hover:border-[#9eae9f] hover:shadow-[0_8px_25px_rgba(16,24,19,0.05)] transition">

            <div className="flex items-center justify-between">

                <span className="text-[9px] uppercase tracking-[0.15em] font-bold text-[#a0a59f]">
                    {index}
                </span>

                <span
                    className={`w-2 h-2 rounded-full ${
                        accent
                            ? "bg-[#8ee276]"
                            : warning
                            ? "bg-[#856f36]"
                            : "bg-[#47775f]"
                    }`}
                />

            </div>

            <p
                className={`mt-7 text-2xl sm:text-3xl font-bold tracking-[-0.045em] ${
                    accent
                        ? "text-[#47775f]"
                        : warning
                        ? "text-[#856f36]"
                        : "text-[#101813]"
                }`}
            >
                {value}
            </p>

            <p className="mt-2 text-xs font-bold">
                {label}
            </p>

            <p className="mt-1 text-[10px] leading-5 text-[#8a918b]">
                {description}
            </p>

        </div>
    );
}


/* =============================================================
   PANEL HEADER
============================================================= */

function PanelHeader({
    eyebrow,
    title,
    meta,
}) {
    return (
        <div className="px-6 sm:px-7 py-5 border-b border-[#cfd4c8] bg-[#f3f1e8]">

            <div className="flex items-center justify-between gap-4">

                <div>

                    <div className="flex items-center gap-2">

                        <span className="w-1.5 h-1.5 rounded-full bg-[#8ee276]" />

                        <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#47775f]">
                            {eyebrow}
                        </p>

                    </div>

                    <h2 className="mt-1 text-xl font-bold tracking-[-0.035em]">
                        {title}
                    </h2>

                </div>

                <span className="hidden sm:block px-3 py-1.5 rounded-full bg-[#dfe7dc] text-[#47775f] text-[9px] uppercase tracking-[0.12em] font-bold">
                    {meta}
                </span>

            </div>

        </div>
    );
}


/* =============================================================
   FINANCE CARD
============================================================= */

function FinanceCard({
    label,
    value,
    positive = false,
    warning = false,
}) {
    return (
        <div className="rounded-xl border border-[#cfd4c8] bg-[#f3f1e8] p-5">

            <p className="text-[9px] uppercase tracking-[0.14em] font-bold text-[#8a918b]">
                {label}
            </p>

            <p
                className={`mt-3 text-xl sm:text-2xl font-bold tracking-[-0.04em] ${
                    positive
                        ? "text-[#47775f]"
                        : warning
                        ? "text-[#856f36]"
                        : "text-[#101813]"
                }`}
            >
                {value}
            </p>

        </div>
    );
}


/* =============================================================
   DARK STAT
============================================================= */

function DarkStat({
    label,
    value,
}) {
    return (
        <div className="rounded-xl border border-white/10 bg-white/[0.05] p-4">

            <p className="text-lg sm:text-xl font-bold tracking-[-0.04em] text-[#8ee276]">
                {value}
            </p>

            <p className="mt-1 text-[9px] uppercase tracking-[0.12em] font-bold text-white/40">
                {label}
            </p>

        </div>
    );
}


/* =============================================================
   ECOSYSTEM CARD
============================================================= */

function EcosystemCard({
    number,
    label,
    value,
    description,
    accent = false,
}) {
    return (
        <div className="p-6 sm:p-7 border-b md:border-b-0 md:border-r last:border-0 border-[#cfd4c8]">

            <div className="flex items-center justify-between">

                <span className="text-[9px] uppercase tracking-[0.15em] font-bold text-[#a0a59f]">
                    {number}
                </span>

                <span
                    className={`w-2 h-2 rounded-full ${
                        accent
                            ? "bg-[#8ee276]"
                            : "bg-[#47775f]"
                    }`}
                />

            </div>

            <p className="mt-7 text-3xl font-bold tracking-[-0.05em]">
                {value}
            </p>

            <p className="mt-2 text-sm font-bold">
                {label}
            </p>

            <p className="mt-2 text-xs leading-5 text-[#8a918b] max-w-xs">
                {description}
            </p>

        </div>
    );
}


/* =============================================================
   LOADING
============================================================= */

function LoadingState() {
    return (
        <div className="rounded-2xl border border-[#cfd4c8] bg-[#f8f7f1] py-24 text-center">

            <div className="mx-auto w-8 h-8 rounded-full border-2 border-[#cfd4c8] border-t-[#47775f] animate-spin" />

            <p className="mt-5 text-[10px] uppercase tracking-[0.18em] font-bold text-[#8a918b]">
                Loading platform reports
            </p>

        </div>
    );
}