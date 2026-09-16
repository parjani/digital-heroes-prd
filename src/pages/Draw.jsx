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

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f7f3ea] text-[#101813] flex items-center justify-center">
                <p className="text-[#5d625d]">
                    Loading draw...
                </p>
            </div>
        );
    }

    return (
    <div className="min-h-screen bg-[#f3f1e8] text-[#101813]">

   

        <main>

            {/* Hero */}
            <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16 md:py-24 border-b border-[#cfd4c8]">

                <div className="grid lg:grid-cols-[1fr_300px] gap-12 lg:gap-20 items-end">

                    <div className="max-w-4xl">

                        <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#47775f]">
                            § 01 · Monthly draw
                        </p>

                        <h1 className="mt-6 text-5xl md:text-7xl font-semibold tracking-[-0.05em] leading-[0.92]">
                            Your game.
                            <span className="block text-[#47775f]">
                                Your chance.
                            </span>
                        </h1>

                        <p className="mt-8 text-[#687169] text-base md:text-lg leading-7 max-w-2xl">
                            Your latest five Stableford scores form your
                            draw numbers. Check the latest published result
                            and see how your entry performed.
                        </p>

                    </div>

                    <div className="border-l border-[#cfd4c8] pl-6">

                        <p className="text-xs uppercase tracking-[0.16em] text-[#8a918b]">
                            Draw format
                        </p>

                        <p className="mt-3 text-5xl font-semibold tracking-[-0.04em] text-[#47775f]">
                            5
                        </p>

                        <p className="mt-3 text-sm leading-6 text-[#687169]">
                            Five numbers are drawn from the
                            1–45 Stableford range each month.
                        </p>

                    </div>

                </div>

            </section>

            {/* Subscription warning */}
            {!isSubscriptionActive && (
                <section className="border-b border-[#cfd4c8] bg-[#ebe6d7]">

                    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-7">

                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

                            <div>

                                <p className="text-xs uppercase tracking-[0.18em] font-semibold text-[#9a6b2f]">
                                    Participation required
                                </p>

                                <h2 className="mt-2 text-xl font-semibold">
                                    Active subscription required
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-[#687169] max-w-xl">
                                    You need an active subscription to
                                    participate in the monthly draw.
                                </p>

                                {subscription?.status && (
                                    <p className="text-xs text-[#8a918b] mt-2">
                                        Current status:{" "}
                                        <span className="capitalize">
                                            {subscription.status}
                                        </span>
                                    </p>
                                )}

                            </div>

                            <button
                                onClick={() =>
                                    navigate("/dashboard/subscription")
                                }
                                className="shrink-0 px-6 py-3 bg-[#47775f] text-white text-sm font-semibold hover:bg-[#38644f] transition"
                            >
                                View subscription →
                            </button>

                        </div>

                    </div>

                </section>
            )}

            <section className="max-w-7xl mx-auto px-6 lg:px-10 py-14 md:py-20">

                {!draw ? (

                    /* No published draw */
                    <div className="border border-[#cfd4c8] bg-[#f8f7f1]">

                        <div className="grid md:grid-cols-[180px_1fr]">

                            <div className="border-b md:border-b-0 md:border-r border-[#cfd4c8] p-7">

                                <p className="text-xs uppercase tracking-[0.18em] text-[#8a918b]">
                                    Status
                                </p>

                                <p className="mt-3 text-2xl font-semibold text-[#47775f]">
                                    Pending
                                </p>

                            </div>

                            <div className="p-8 md:p-10">

                                <p className="text-xs uppercase tracking-[0.18em] font-semibold text-[#47775f]">
                                    § 02 · Latest result
                                </p>

                                <h2 className="mt-4 text-3xl md:text-4xl font-semibold tracking-[-0.03em]">
                                    No published draw yet.
                                </h2>

                                <p className="mt-4 text-[#687169] leading-7 max-w-xl">
                                    The latest monthly draw will appear
                                    here once it has been published.
                                </p>

                            </div>

                        </div>

                    </div>

                ) : (

                    <>

                        {/* Draw information */}
                        <section>

                            <div className="mb-8">

                                <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#47775f]">
                                    § 02 · Latest result
                                </p>

                                <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-[-0.03em]">
                                    {formatDrawMonth(
                                        draw.draw_month,
                                        draw.draw_year
                                    )}
                                </h2>

                            </div>

                            <div className="grid md:grid-cols-[1fr_220px] gap-px bg-[#cfd4c8] border border-[#cfd4c8]">

                                <div className="bg-[#f8f7f1] p-7 md:p-9">

                                    <p className="text-xs uppercase tracking-[0.16em] text-[#8a918b]">
                                        Monthly Digital Heroes Draw
                                    </p>

                                    <p className="mt-5 text-sm text-[#687169] leading-6 max-w-xl">
                                        Official winning numbers for the
                                        latest published monthly draw.
                                    </p>

                                </div>

                                <div className="bg-[#dfe5da] p-7 md:p-9 flex flex-col justify-between">

                                    <p className="text-xs uppercase tracking-[0.16em] text-[#8a918b]">
                                        Draw status
                                    </p>

                                    <p className="mt-8 text-xl font-semibold capitalize text-[#47775f]">
                                        {draw.status}
                                    </p>

                                </div>

                            </div>

                        </section>

                        {/* Winning numbers */}
                        <section className="mt-12">

                            <div className="mb-7">

                                <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#47775f]">
                                    § 03 · Official result
                                </p>

                                <h2 className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight">
                                    Winning numbers
                                </h2>

                            </div>

                            <div className="grid grid-cols-5 gap-px bg-[#cfd4c8] border border-[#cfd4c8] max-w-3xl">

                                {(draw.winning_numbers || []).map(
                                    (number, index) => (
                                        <div
                                            key={`${number}-${index}`}
                                            className="bg-[#47775f] min-h-[100px] md:min-h-[130px] flex flex-col items-center justify-center text-white"
                                        >
                                            <span className="text-[10px] uppercase tracking-[0.16em] opacity-70">
                                                {String(index + 1).padStart(2, "0")}
                                            </span>

                                            <span className="mt-2 text-4xl md:text-5xl font-semibold tracking-[-0.04em]">
                                                {number}
                                            </span>
                                        </div>
                                    )
                                )}

                            </div>

                        </section>

                        {/* User entry */}
                        <section className="mt-16">

                            <div className="mb-8">

                                <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#47775f]">
                                    § 04 · Your entry
                                </p>

                                <h2 className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight">
                                    How did your numbers perform?
                                </h2>

                            </div>

                            {!isSubscriptionActive ? (

                                /* Not subscribed */
                                <div className="border border-[#cfd4c8] bg-[#f8f7f1]">

                                    <div className="p-8 md:p-10">

                                        <p className="text-[#687169] leading-7 max-w-xl">
                                            Your draw entry is unavailable
                                            because your subscription is
                                            not active.
                                        </p>

                                        <button
                                            onClick={() =>
                                                navigate(
                                                    "/dashboard/subscription"
                                                )
                                            }
                                            className="mt-7 px-6 py-3 bg-[#47775f] text-white text-sm font-semibold hover:bg-[#38644f] transition"
                                        >
                                            Activate subscription →
                                        </button>

                                    </div>

                                </div>

                            ) : entries.length === 0 ? (

                                /* Active but no entry */
                                <div className="border border-[#cfd4c8] bg-[#f8f7f1]">

                                    <div className="grid md:grid-cols-[180px_1fr]">

                                        <div className="border-b md:border-b-0 md:border-r border-[#cfd4c8] p-7">

                                            <p className="text-xs uppercase tracking-[0.16em] text-[#8a918b]">
                                                Entry
                                            </p>

                                            <p className="mt-3 text-xl font-semibold text-[#9a6b2f]">
                                                Missing
                                            </p>

                                        </div>

                                        <div className="p-8 md:p-10">

                                            <h3 className="text-2xl font-semibold">
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
                                                className="mt-7 px-6 py-3 bg-[#47775f] text-white text-sm font-semibold hover:bg-[#38644f] transition"
                                            >
                                                Manage scores →
                                            </button>

                                        </div>

                                    </div>

                                </div>

                            ) : (

                                /* Active + entry exists */
                                <div className="space-y-6">

                                    {entries.map((entry) => (

                                        <div
                                            key={entry.id}
                                            className="border border-[#cfd4c8] bg-[#f8f7f1]"
                                        >

                                            <div className="grid lg:grid-cols-[1fr_220px]">

                                                {/* Numbers */}
                                                <div className="p-7 md:p-9">

                                                    <div className="flex items-center justify-between gap-5">

                                                        <div>

                                                            <p className="text-xs uppercase tracking-[0.16em] text-[#8a918b]">
                                                                Your numbers
                                                            </p>

                                                            <p className="mt-2 text-sm text-[#687169]">
                                                                Matching numbers are highlighted.
                                                            </p>

                                                        </div>

                                                        <span className="hidden sm:block text-xs uppercase tracking-[0.14em] text-[#47775f]">
                                                            Entry
                                                        </span>

                                                    </div>

                                                    <div className="grid grid-cols-5 gap-px bg-[#cfd4c8] border border-[#cfd4c8] mt-7 max-w-xl">

                                                        {(
                                                            entry.numbers || []
                                                        ).map(
                                                            (
                                                                number,
                                                                index
                                                            ) => {

                                                                const isMatch =
                                                                    (
                                                                        draw.winning_numbers ||
                                                                        []
                                                                    ).includes(
                                                                        Number(
                                                                            number
                                                                        )
                                                                    );

                                                                return (
                                                                    <div
                                                                        key={`${number}-${index}`}
                                                                        className={`min-h-[82px] flex flex-col items-center justify-center ${
                                                                            isMatch
                                                                                ? "bg-[#47775f] text-white"
                                                                                : "bg-[#e7ebe3] text-[#101813]"
                                                                        }`}
                                                                    >

                                                                        <span className="text-[10px] uppercase tracking-[0.14em] opacity-60">
                                                                            {String(index + 1).padStart(2, "0")}
                                                                        </span>

                                                                        <span className="mt-1 text-2xl font-semibold">
                                                                            {number}
                                                                        </span>

                                                                    </div>
                                                                );
                                                            }
                                                        )}

                                                    </div>

                                                </div>

                                                {/* Match count */}
                                                <div className="border-t lg:border-t-0 lg:border-l border-[#cfd4c8] bg-[#dfe5da] p-7 md:p-9 flex flex-col justify-between">

                                                    <div>

                                                        <p className="text-xs uppercase tracking-[0.16em] text-[#8a918b]">
                                                            Matches
                                                        </p>

                                                        <p className="mt-4 text-5xl md:text-6xl font-semibold tracking-[-0.05em] text-[#47775f]">
                                                            {entry.match_count ?? 0}
                                                            <span className="text-2xl text-[#8a918b]">
                                                                /5
                                                            </span>
                                                        </p>

                                                    </div>

                                                    <p className="mt-8 text-sm leading-6 text-[#687169]">
                                                        Your matching numbers
                                                        are highlighted in
                                                        green.
                                                    </p>

                                                </div>

                                            </div>

                                        </div>

                                    ))}

                                </div>

                            )}

                        </section>

                    </>
                )}

            </section>

        </main>

 

    </div>
)
}
export default Draw