import { useEffect, useState } from "react";
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

            supabase
                .from("charities")
                .select("id", {
                    count: "exact",
                    head: true,
                })
                .eq("is_active", true),

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

    const cards = [
        {
            title: "Total Users",
            value: stats.totalUsers,
            description: "Registered accounts",
        },
        {
            title: "Active Subscriptions",
            value: stats.activeSubscriptions,
            description: "Currently active",
        },
        {
            title: "Active Charities",
            value: stats.totalCharities,
            description: "Available to users",
        },
        {
            title: "Total Draws",
            value: stats.totalDraws,
            description: "Created draws",
        },
        {
            title: "Total Winners",
            value: stats.totalWinners,
            description: "Winning records",
        },
        {
            title: "Charity Contributions",
            value: `₹${stats.totalCharityContributions.toLocaleString()}`,
            description: "Recorded contribution value",
        },
        {
            title: "Paid Winnings",
            value: `₹${stats.paidAmount.toLocaleString()}`,
            description: "Successfully paid",
        },
        {
            title: "Pending Winnings",
            value: `₹${stats.pendingAmount.toLocaleString()}`,
            description: "Awaiting payout",
        },
    ];

   return (
    <div className="min-h-screen bg-[#f3f1e8] text-[#101813]">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20">

            {/* Hero */}
            <section className="border-b border-[#cfd4c8] pb-14">
                <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
                    <div className="max-w-3xl">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#47775f]">
                            § 01 · Platform reporting
                        </p>

                        <h1 className="mt-5 text-4xl font-semibold leading-[0.95] tracking-[-0.045em] sm:text-5xl lg:text-6xl">
                            Reports, numbers.
                            <br />
                            <span className="text-[#47775f]">
                                Real impact.
                            </span>
                        </h1>

                        <p className="mt-6 max-w-2xl text-sm leading-7 text-[#687169] sm:text-base">
                            Monitor platform activity, subscription health,
                            winnings and the charitable impact created through
                            Digital Heroes.
                        </p>
                    </div>

                    <button
                        onClick={fetchReports}
                        disabled={loading}
                        className="w-fit border border-[#47775f] bg-[#47775f] px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#f8f7f1] transition hover:bg-[#38644f] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Refreshing..." : "Refresh Reports →"}
                    </button>
                </div>
            </section>

            {loading ? (
                <div className="py-20">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a918b]">
                        Loading platform data...
                    </p>
                </div>
            ) : (
                <>
                    {/* Key Metrics */}
                    <section className="py-14">
                        <div className="mb-8">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#47775f]">
                                § 02 · Key metrics
                            </p>

                            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
                                Platform at a glance.
                            </h2>
                        </div>

                        <div className="grid gap-px border border-[#cfd4c8] bg-[#cfd4c8] sm:grid-cols-2 lg:grid-cols-4">
                            {cards.map((card, index) => (
                                <div
                                    key={card.title}
                                    className="bg-[#f8f7f1] p-6 sm:p-7"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a918b]">
                                            {String(index + 1).padStart(2, "0")}
                                        </p>

                                        <span className="h-2 w-2 rounded-full bg-[#47775f]" />
                                    </div>

                                    <p className="mt-10 text-3xl font-semibold tracking-[-0.04em] text-[#101813] sm:text-4xl">
                                        {card.value}
                                    </p>

                                    <p className="mt-3 text-sm font-medium text-[#101813]">
                                        {card.title}
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-[#8a918b]">
                                        {card.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Financial Overview */}
                    <section className="border-t border-[#cfd4c8] py-14">
                        <div className="mb-8">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#47775f]">
                                § 03 · Financial overview
                            </p>

                            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
                                Prize flow & payout status.
                            </h2>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-2">

                            {/* Prize Summary */}
                            <div className="border border-[#cfd4c8] bg-[#f8f7f1] p-7 sm:p-9">
                                <div className="flex items-start justify-between gap-6">
                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8a918b]">
                                            Prize summary
                                        </p>

                                        <h3 className="mt-3 text-xl font-semibold tracking-[-0.02em]">
                                            Winnings overview
                                        </h3>
                                    </div>

                                    <span className="text-2xl text-[#47775f]">
                                        ↗
                                    </span>
                                </div>

                                <div className="mt-10 border-t border-[#cfd4c8]">
                                    <div className="flex items-center justify-between border-b border-[#cfd4c8] py-5">
                                        <span className="text-sm text-[#687169]">
                                            Total prize value
                                        </span>

                                        <span className="text-lg font-semibold">
                                            ₹{stats.totalPrizeAmount.toLocaleString()}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between border-b border-[#cfd4c8] py-5">
                                        <span className="text-sm text-[#687169]">
                                            Paid winnings
                                        </span>

                                        <span className="text-lg font-semibold text-[#47775f]">
                                            ₹{stats.paidAmount.toLocaleString()}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between py-5">
                                        <span className="text-sm text-[#687169]">
                                            Pending winnings
                                        </span>

                                        <span className="text-lg font-semibold text-[#8a6d32]">
                                            ₹{stats.pendingAmount.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Charity Impact */}
                            <div className="border border-[#cfd4c8] bg-[#dfe5da] p-7 sm:p-9">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#38644f]">
                                    Charity impact
                                </p>

                                <h3 className="mt-3 max-w-md text-2xl font-semibold leading-tight tracking-[-0.03em]">
                                    Every contribution becomes part of
                                    something bigger.
                                </h3>

                                <p className="mt-5 max-w-lg text-sm leading-6 text-[#687169]">
                                    Total recorded charitable contribution
                                    value across the platform.
                                </p>

                                <div className="mt-12">
                                    <p className="text-4xl font-semibold tracking-[-0.05em] text-[#38644f] sm:text-5xl">
                                        ₹
                                        {stats.totalCharityContributions.toLocaleString()}
                                    </p>

                                    <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#687169]">
                                        Recorded contribution value
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Activity Breakdown */}
                    <section className="border-t border-[#cfd4c8] py-14">
                        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">

                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#47775f]">
                                    § 04 · Platform activity
                                </p>

                                <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl">
                                    A clearer view of the
                                    <br />
                                    platform ecosystem.
                                </h2>
                            </div>

                            <div className="grid gap-px border border-[#cfd4c8] bg-[#cfd4c8] sm:grid-cols-3">
                                <div className="bg-[#f8f7f1] p-6">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a918b]">
                                        Members
                                    </p>

                                    <p className="mt-6 text-3xl font-semibold tracking-[-0.04em]">
                                        {stats.totalUsers}
                                    </p>

                                    <p className="mt-2 text-xs text-[#8a918b]">
                                        Registered users
                                    </p>
                                </div>

                                <div className="bg-[#f8f7f1] p-6">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a918b]">
                                        Subscribers
                                    </p>

                                    <p className="mt-6 text-3xl font-semibold tracking-[-0.04em]">
                                        {stats.activeSubscriptions}
                                    </p>

                                    <p className="mt-2 text-xs text-[#8a918b]">
                                        Active subscriptions
                                    </p>
                                </div>

                                <div className="bg-[#f8f7f1] p-6">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a918b]">
                                        Draws
                                    </p>

                                    <p className="mt-6 text-3xl font-semibold tracking-[-0.04em]">
                                        {stats.totalDraws}
                                    </p>

                                    <p className="mt-2 text-xs text-[#8a918b]">
                                        Created draws
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Impact Statement */}
                    <section className="border-t border-[#cfd4c8] pt-14">
                        <div className="border border-[#cfd4c8] bg-[#101813] p-8 text-[#f3f1e8] sm:p-12 lg:p-14">
                            <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
                                <div className="max-w-3xl">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9bb5a4]">
                                        § 05 · Digital Heroes impact
                                    </p>

                                    <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl lg:text-5xl">
                                        Play better.
                                        <br />
                                        Give more.
                                        <br />
                                        Make an impact.
                                    </h2>

                                    <p className="mt-6 max-w-xl text-sm leading-7 text-[#aeb8b0]">
                                        These reports bring together the
                                        platform's members, draws, winnings
                                        and recorded charitable contributions
                                        in one place.
                                    </p>
                                </div>

                                <div className="border-l border-[#3b463f] pl-6">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9bb5a4]">
                                        Total charity value
                                    </p>

                                    <p className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
                                        ₹
                                        {stats.totalCharityContributions.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                </>
            )}
        </div>
    </div>
);
}