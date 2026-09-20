import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

function Draw() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [draw, setDraw] = useState(null);
    const [entries, setEntries] = useState([]);
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchDraw();
        }
    }, [user]);

    const fetchDraw = async () => {
        try {
            setLoading(true);

            // --------------------------------
            // 1. Get user's latest subscription
            // --------------------------------
            const {
                data: subscriptionData,
                error: subscriptionError,
            } = await supabase
                .from("subscriptions")
                .select(
                    "id, plan, status, current_period_end"
                )
                .eq("user_id", user.id)
                .order("created_at", {
                    ascending: false,
                })
                .limit(1)
                .maybeSingle();

            if (subscriptionError) {
                console.error(
                    "Subscription error:",
                    subscriptionError
                );
            }

            setSubscription(subscriptionData);

            // --------------------------------
            // 2. Get latest published draw
            // --------------------------------
            const {
                data: drawData,
                error: drawError,
            } = await supabase
                .from("draws")
                .select("*")
                .eq("status", "published")
                .order("draw_year", {
                    ascending: false,
                })
                .order("draw_month", {
                    ascending: false,
                })
                .limit(1)
                .maybeSingle();

            if (drawError) {
                console.error(
                    "Draw error:",
                    drawError
                );

                setDraw(null);
                setEntries([]);
                return;
            }

            setDraw(drawData);

            // --------------------------------
            // 3. Get user's entry
            // --------------------------------
            if (drawData) {
                const {
                    data: entryData,
                    error: entryError,
                } = await supabase
                    .from("draw_entries")
                    .select("*")
                    .eq("draw_id", drawData.id)
                    .eq("user_id", user.id);

                if (entryError) {
                    console.error(
                        "Entry error:",
                        entryError
                    );

                    setEntries([]);
                } else {
                    setEntries(entryData || []);
                }
            } else {
                setEntries([]);
            }
        } catch (error) {
            console.error(
                "Draw page error:",
                error
            );

            setDraw(null);
            setEntries([]);
        } finally {
            setLoading(false);
        }
    };

    const formatDrawMonth = (month, year) => {
        if (!month || !year) {
            return "Unknown draw";
        }

        const date = new Date(
            Number(year),
            Number(month) - 1,
            1
        );

        return date.toLocaleDateString("en-IN", {
            month: "long",
            year: "numeric",
        });
    };

    const isSubscriptionActive =
        subscription?.status === "active";

    const winningNumbers =
        Array.isArray(draw?.winning_numbers)
            ? draw.winning_numbers
            : [];

    if (loading) {
        return (
            <div className="min-h-[70vh] bg-[#f3f1e8] flex items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto w-10 h-10 rounded-full border-2 border-[#cfd4c8] border-t-[#47775f] animate-spin" />

                    <p className="mt-4 text-sm text-[#687169]">
                        Loading your draw...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f3f1e8] text-[#101813]">

            <main className="max-w-7xl mx-auto px-5 sm:px-7 lg:px-10 py-8 lg:py-12">

                {/* =====================================================
                    HERO
                ====================================================== */}

                <section className="relative overflow-hidden rounded-[2rem] bg-[#0d2117] text-white">

                    <div className="absolute -top-32 -right-20 w-96 h-96 rounded-full bg-[#8ee276]/10 blur-3xl" />

                    <div className="absolute -bottom-40 left-1/3 w-96 h-96 rounded-full bg-[#47775f]/20 blur-3xl" />

                    <div className="relative px-6 sm:px-8 lg:px-12 py-10 sm:py-12 lg:py-14">

                        <div className="grid lg:grid-cols-12 gap-10 items-end">

                            <div className="lg:col-span-8">

                                <div className="flex items-center gap-2 mb-5">
                                    <span className="w-7 h-[2px] bg-[#8ee276]" />

                                    <span className="text-[9px] uppercase tracking-[0.25em] text-[#8ee276] font-semibold">
                                        Monthly draw
                                    </span>
                                </div>

                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.05em] leading-[0.98]">
                                    Your game.
                                    <br />
                                    <span className="text-[#8ee276]">
                                        Your chance.
                                    </span>
                                </h1>

                                <p className="mt-6 max-w-2xl text-sm sm:text-base text-white/55 leading-relaxed">
                                    Your latest five Stableford scores
                                    form your draw numbers. Check the
                                    latest published result and see how
                                    your entry performed.
                                </p>

                            </div>

                            <div className="lg:col-span-4">

                                <div className="w-full sm:w-[230px] lg:ml-auto rounded-2xl bg-white/[0.07] border border-white/10 p-5 backdrop-blur-sm">

                                    <div className="flex items-center justify-between">

                                        <p className="text-[9px] uppercase tracking-[0.2em] text-white/40">
                                            Draw format
                                        </p>

                                        <span className="w-2 h-2 rounded-full bg-[#8ee276]" />

                                    </div>

                                    <p className="mt-4 text-5xl font-bold">
                                        5
                                    </p>

                                    <p className="mt-2 text-xs text-white/35 leading-relaxed">
                                        Numbers from the 1–45
                                        Stableford range.
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>

                </section>


                {/* =====================================================
                    SUBSCRIPTION WARNING
                ====================================================== */}

                {!isSubscriptionActive && (
                    <section className="mt-6">

                        <div className="rounded-[1.5rem] bg-[#ebe6d7] border border-[#ddd4bf] p-6 sm:p-7">

                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                                <div className="flex items-start gap-4">

                                    <div className="w-11 h-11 shrink-0 rounded-xl bg-[#f3e8cd] text-[#9a6b2f] flex items-center justify-center font-bold">
                                        !
                                    </div>

                                    <div>

                                        <p className="text-[9px] uppercase tracking-[0.2em] text-[#9a6b2f] font-semibold">
                                            Participation required
                                        </p>

                                        <h2 className="mt-2 text-xl sm:text-2xl font-bold tracking-[-0.03em]">
                                            Active subscription required
                                        </h2>

                                        <p className="mt-2 text-sm leading-6 text-[#687169] max-w-xl">
                                            Activate your membership to
                                            participate in the monthly
                                            Digital Heroes draw.
                                        </p>

                                        {subscription?.status && (
                                            <p className="mt-2 text-xs text-[#8a918b]">
                                                Current status:{" "}
                                                <span className="capitalize font-semibold">
                                                    {subscription.status}
                                                </span>
                                            </p>
                                        )}

                                    </div>

                                </div>

                                <button
                                    onClick={() =>
                                        navigate(
                                            "/dashboard/subscription"
                                        )
                                    }
                                    className="shrink-0 group px-6 py-3.5 rounded-xl bg-[#47775f] text-white text-sm font-semibold hover:bg-[#38644f] hover:-translate-y-0.5 transition-all"
                                >
                                    View subscription
                                    <span className="ml-2 inline-block group-hover:translate-x-1 transition-transform">
                                        →
                                    </span>
                                </button>

                            </div>

                        </div>

                    </section>
                )}


                {/* =====================================================
                    NO DRAW
                ====================================================== */}

                {!draw ? (

                    <section className="mt-10">

                        <div className="rounded-[1.75rem] bg-white border border-[#d9ddd4] overflow-hidden">

                            <div className="grid lg:grid-cols-[220px_1fr]">

                                <div className="bg-[#dfe7dc] p-7 sm:p-8">

                                    <p className="text-[9px] uppercase tracking-[0.2em] text-[#687169]">
                                        Draw status
                                    </p>

                                    <div className="mt-5 flex items-center gap-3">

                                        <span className="w-3 h-3 rounded-full bg-[#9a6b2f]" />

                                        <p className="text-2xl font-bold text-[#103523]">
                                            Pending
                                        </p>

                                    </div>

                                </div>

                                <div className="p-7 sm:p-9 lg:p-10">

                                    <div className="flex items-center gap-2">

                                        <span className="w-6 h-[2px] bg-[#47775f]" />

                                        <p className="text-[9px] uppercase tracking-[0.23em] text-[#47775f] font-semibold">
                                            Latest result
                                        </p>

                                    </div>

                                    <h2 className="mt-4 text-2xl sm:text-3xl font-bold tracking-[-0.04em]">
                                        No published draw yet.
                                    </h2>

                                    <p className="mt-3 text-sm leading-6 text-[#687169] max-w-xl">
                                        The latest monthly draw will
                                        appear here once it has been
                                        published.
                                    </p>

                                </div>

                            </div>

                        </div>

                    </section>

                ) : (

                    <>

                        {/* =================================================
                            LATEST DRAW
                        ================================================== */}

                        <section className="mt-10">

                            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-6">

                                <div>

                                    <div className="flex items-center gap-2">

                                        <span className="w-6 h-[2px] bg-[#47775f]" />

                                        <p className="text-[9px] uppercase tracking-[0.23em] text-[#47775f] font-semibold">
                                            Latest result
                                        </p>

                                    </div>

                                    <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-[-0.04em]">
                                        {formatDrawMonth(
                                            draw.draw_month,
                                            draw.draw_year
                                        )}
                                    </h2>

                                </div>

                                <div className="flex items-center gap-2">

                                    <span className="w-2 h-2 rounded-full bg-[#8ee276]" />

                                    <span className="text-[9px] uppercase tracking-[0.18em] text-[#47775f] font-semibold">
                                        {draw.status}
                                    </span>

                                </div>

                            </div>


                            <div className="grid lg:grid-cols-12 gap-5">

                                <div className="lg:col-span-8 rounded-[1.75rem] bg-white border border-[#d9ddd4] p-7 sm:p-9">

                                    <p className="text-[9px] uppercase tracking-[0.2em] text-[#8a918b]">
                                        Digital Heroes monthly draw
                                    </p>

                                    <h3 className="mt-4 text-2xl sm:text-3xl font-bold tracking-[-0.04em]">
                                        Official winning numbers
                                    </h3>

                                    <p className="mt-3 text-sm text-[#687169] leading-6 max-w-xl">
                                        These are the official numbers
                                        from the latest published
                                        monthly draw.
                                    </p>

                                </div>

                                <div className="lg:col-span-4 rounded-[1.75rem] bg-[#dfe7dc] border border-[#cbd6c9] p-7 sm:p-9">

                                    <p className="text-[9px] uppercase tracking-[0.2em] text-[#687169]">
                                        Draw type
                                    </p>

                                    <p className="mt-6 text-2xl font-bold capitalize text-[#103523]">
                                        {draw.draw_type || "Monthly"}
                                    </p>

                                    <p className="mt-2 text-sm text-[#687169]">
                                        Published result
                                    </p>

                                </div>

                            </div>

                        </section>


                        {/* =================================================
                            WINNING NUMBERS
                        ================================================== */}

                        <section className="mt-12">

                            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">

                                <div>

                                    <div className="flex items-center gap-2">

                                        <span className="w-6 h-[2px] bg-[#47775f]" />

                                        <p className="text-[9px] uppercase tracking-[0.23em] text-[#47775f] font-semibold">
                                            Official result
                                        </p>

                                    </div>

                                    <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-[-0.04em]">
                                        Winning numbers
                                    </h2>

                                </div>

                                <p className="text-xs text-[#8a918b]">
                                    5 numbers · 1–45
                                </p>

                            </div>


                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">

                                {winningNumbers.map(
                                    (number, index) => (
                                        <div
                                            key={`${number}-${index}`}
                                            className="group relative overflow-hidden rounded-[1.5rem] bg-[#103523] text-white min-h-[150px] sm:min-h-[175px] flex flex-col justify-between p-5 sm:p-6 hover:-translate-y-1 transition-transform"
                                        >

                                            <div className="absolute -right-10 -top-10 w-28 h-28 rounded-full bg-[#8ee276]/10 blur-2xl" />

                                            <div className="relative flex items-center justify-between">

                                                <span className="text-[9px] uppercase tracking-[0.2em] text-white/35">
                                                    Number
                                                </span>

                                                <span className="text-[9px] text-[#8ee276] font-bold">
                                                    {String(index + 1).padStart(
                                                        2,
                                                        "0"
                                                    )}
                                                </span>

                                            </div>

                                            <span className="relative text-5xl sm:text-6xl font-bold tracking-[-0.07em] text-[#8ee276]">
                                                {number}
                                            </span>

                                        </div>
                                    )
                                )}

                            </div>

                        </section>


                        {/* =================================================
                            USER ENTRY
                        ================================================== */}

                        <section className="mt-14">

                            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-7">

                                <div>

                                    <div className="flex items-center gap-2">

                                        <span className="w-6 h-[2px] bg-[#47775f]" />

                                        <p className="text-[9px] uppercase tracking-[0.23em] text-[#47775f] font-semibold">
                                            Your entry
                                        </p>

                                    </div>

                                    <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-[-0.04em]">
                                        How did your numbers perform?
                                    </h2>

                                </div>

                                {isSubscriptionActive && (
                                    <span className="inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-[#47775f] font-semibold">

                                        <span className="w-2 h-2 rounded-full bg-[#8ee276]" />

                                        Active member

                                    </span>
                                )}

                            </div>


                            {!isSubscriptionActive ? (

                                /* Not subscribed */

                                <div className="rounded-[1.75rem] bg-white border border-[#d9ddd4] p-7 sm:p-9">

                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-7">

                                        <div>

                                            <h3 className="text-xl sm:text-2xl font-bold tracking-[-0.03em]">
                                                Your entry is unavailable.
                                            </h3>

                                            <p className="mt-3 text-sm leading-6 text-[#687169] max-w-xl">
                                                Activate your membership
                                                to participate in the
                                                monthly draw.
                                            </p>

                                        </div>

                                        <button
                                            onClick={() =>
                                                navigate(
                                                    "/dashboard/subscription"
                                                )
                                            }
                                            className="group shrink-0 px-6 py-3.5 rounded-xl bg-[#47775f] text-white text-sm font-semibold hover:bg-[#38644f] hover:-translate-y-0.5 transition-all"
                                        >
                                            Activate membership
                                            <span className="ml-2 inline-block group-hover:translate-x-1 transition-transform">
                                                →
                                            </span>
                                        </button>

                                    </div>

                                </div>

                            ) : entries.length === 0 ? (

                                /* Active but no entry */

                                <div className="rounded-[1.75rem] bg-white border border-[#d9ddd4] overflow-hidden">

                                    <div className="grid lg:grid-cols-[200px_1fr]">

                                        <div className="bg-[#ebe6d7] p-7 sm:p-8">

                                            <p className="text-[9px] uppercase tracking-[0.2em] text-[#8a918b]">
                                                Entry
                                            </p>

                                            <p className="mt-4 text-xl font-bold text-[#9a6b2f]">
                                                Missing
                                            </p>

                                        </div>

                                        <div className="p-7 sm:p-9">

                                            <h3 className="text-xl sm:text-2xl font-bold tracking-[-0.03em]">
                                                No draw entry was generated.
                                            </h3>

                                            <p className="mt-3 text-sm leading-6 text-[#687169] max-w-xl">
                                                Make sure you have five
                                                Stableford scores recorded
                                                for your account.
                                            </p>

                                            <button
                                                onClick={() =>
                                                    navigate(
                                                        "/dashboard/scores"
                                                    )
                                                }
                                                className="group mt-6 px-6 py-3.5 rounded-xl bg-[#103523] text-white text-sm font-semibold hover:bg-[#47775f] transition-all"
                                            >
                                                Manage scores
                                                <span className="ml-2 inline-block group-hover:translate-x-1 transition-transform">
                                                    →
                                                </span>
                                            </button>

                                        </div>

                                    </div>

                                </div>

                            ) : (

                                /* Active + entry exists */

                                <div className="space-y-5">

                                    {entries.map((entry) => {

                                        const entryNumbers =
                                            Array.isArray(entry.numbers)
                                                ? entry.numbers
                                                : [];

                                        const matchCount =
                                            entry.match_count ?? 0;

                                        return (
                                            <div
                                                key={entry.id}
                                                className="rounded-[1.75rem] bg-white border border-[#d9ddd4] overflow-hidden"
                                            >

                                                <div className="grid lg:grid-cols-12">

                                                    {/* Numbers */}

                                                    <div className="lg:col-span-8 p-7 sm:p-9">

                                                        <div className="flex items-start justify-between gap-5">

                                                            <div>

                                                                <p className="text-[9px] uppercase tracking-[0.2em] text-[#8a918b]">
                                                                    Your numbers
                                                                </p>

                                                                <h3 className="mt-2 text-xl sm:text-2xl font-bold tracking-[-0.03em]">
                                                                    Your draw entry
                                                                </h3>

                                                            </div>

                                                            <div className="hidden sm:flex items-center gap-2 text-[9px] uppercase tracking-[0.16em] text-[#47775f] font-semibold">

                                                                <span className="w-2 h-2 rounded-full bg-[#8ee276]" />

                                                                Entry recorded

                                                            </div>

                                                        </div>


                                                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-7">

                                                            {entryNumbers.map(
                                                                (
                                                                    number,
                                                                    index
                                                                ) => {

                                                                    const isMatch =
                                                                        winningNumbers.includes(
                                                                            Number(
                                                                                number
                                                                            )
                                                                        );

                                                                    return (
                                                                        <div
                                                                            key={`${number}-${index}`}
                                                                            className={`
                                                                                relative min-h-[115px]
                                                                                rounded-[1.25rem]
                                                                                flex flex-col
                                                                                justify-between
                                                                                p-4
                                                                                transition-all
                                                                                ${
                                                                                    isMatch
                                                                                        ? "bg-[#103523] text-white"
                                                                                        : "bg-[#eef1eb] text-[#101813]"
                                                                                }
                                                                            `}
                                                                        >

                                                                            <div className="flex items-center justify-between">

                                                                                <span
                                                                                    className={`
                                                                                        text-[9px] uppercase tracking-[0.16em]
                                                                                        ${
                                                                                            isMatch
                                                                                                ? "text-white/35"
                                                                                                : "text-[#8a918b]"
                                                                                        }
                                                                                    `}
                                                                                >
                                                                                    {String(
                                                                                        index +
                                                                                            1
                                                                                    ).padStart(
                                                                                        2,
                                                                                        "0"
                                                                                    )}
                                                                                </span>

                                                                                {isMatch && (
                                                                                    <span className="w-5 h-5 rounded-full bg-[#8ee276] text-[#103523] flex items-center justify-center text-[9px] font-bold">
                                                                                        ✓
                                                                                    </span>
                                                                                )}

                                                                            </div>

                                                                            <span
                                                                                className={`
                                                                                    text-3xl font-bold tracking-[-0.05em]
                                                                                    ${
                                                                                        isMatch
                                                                                            ? "text-[#8ee276]"
                                                                                            : "text-[#103523]"
                                                                                    }
                                                                                `}
                                                                            >
                                                                                {number}
                                                                            </span>

                                                                        </div>
                                                                    );
                                                                }
                                                            )}

                                                        </div>

                                                        <div className="mt-6 flex items-center gap-2 text-xs text-[#8a918b]">

                                                            <span className="w-2 h-2 rounded-full bg-[#47775f]" />

                                                            Matching numbers are highlighted in green.

                                                        </div>

                                                    </div>


                                                    {/* Match count */}

                                                    <div className="lg:col-span-4 bg-[#dfe7dc] border-t lg:border-t-0 lg:border-l border-[#cbd6c9] p-7 sm:p-9 flex flex-col justify-between">

                                                        <div>

                                                            <p className="text-[9px] uppercase tracking-[0.2em] text-[#687169]">
                                                                Your result
                                                            </p>

                                                            <p className="mt-5 text-6xl sm:text-7xl font-bold tracking-[-0.07em] text-[#103523]">
                                                                {matchCount}
                                                                <span className="text-2xl sm:text-3xl text-[#8a918b] tracking-[-0.03em]">
                                                                    /5
                                                                </span>
                                                            </p>

                                                            <p className="mt-2 text-sm text-[#687169]">
                                                                matching numbers
                                                            </p>

                                                        </div>


                                                        <div className="mt-8">

                                                            <div className="h-2 rounded-full bg-[#c6d2c3] overflow-hidden">

                                                                <div
                                                                    className="h-full rounded-full bg-[#47775f] transition-all duration-500"
                                                                    style={{
                                                                        width: `${Math.min(
                                                                            matchCount *
                                                                                20,
                                                                            100
                                                                        )}%`,
                                                                    }}
                                                                />

                                                            </div>

                                                            <p className="mt-4 text-xs leading-5 text-[#687169]">
                                                                Each matching number
                                                                is highlighted in
                                                                your entry.
                                                            </p>

                                                        </div>

                                                    </div>

                                                </div>

                                            </div>
                                        );
                                    })}

                                </div>

                            )}

                        </section>


                        {/* =================================================
                            HOW IT WORKS
                        ================================================== */}

                        <section className="mt-14 mb-6">

                            <div className="rounded-[1.75rem] bg-[#0d2117] text-white overflow-hidden">

                                <div className="grid lg:grid-cols-12">

                                    <div className="lg:col-span-5 p-7 sm:p-9 lg:p-10">

                                        <div className="flex items-center gap-2">

                                            <span className="w-6 h-[2px] bg-[#8ee276]" />

                                            <p className="text-[9px] uppercase tracking-[0.22em] text-[#8ee276] font-semibold">
                                                The draw
                                            </p>

                                        </div>

                                        <h2 className="mt-4 text-2xl sm:text-3xl font-bold tracking-[-0.04em]">
                                            Performance becomes
                                            opportunity.
                                        </h2>

                                        <p className="mt-4 text-sm text-white/45 leading-6">
                                            Your golf performance connects
                                            directly to your monthly draw
                                            participation.
                                        </p>

                                    </div>


                                    <div className="lg:col-span-7 grid sm:grid-cols-3 border-t lg:border-t-0 lg:border-l border-white/10">

                                        <DrawStep
                                            number="01"
                                            title="Play"
                                            text="Record your Stableford scores."
                                        />

                                        <DrawStep
                                            number="02"
                                            title="Enter"
                                            text="Your latest five scores form your numbers."
                                        />

                                        <DrawStep
                                            number="03"
                                            title="Match"
                                            text="Compare your numbers with the published draw."
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


/* =========================================================
   DRAW STEP
========================================================= */

function DrawStep({
    number,
    title,
    text,
}) {
    return (
        <div className="p-6 sm:p-7 border-b sm:border-b-0 sm:border-r last:border-0 border-white/10">

            <span className="text-[9px] uppercase tracking-[0.18em] text-[#8ee276] font-semibold">
                {number}
            </span>

            <h3 className="mt-7 text-lg font-bold">
                {title}
            </h3>

            <p className="mt-3 text-xs leading-5 text-white/40">
                {text}
            </p>

        </div>
    );
}

export default Draw;