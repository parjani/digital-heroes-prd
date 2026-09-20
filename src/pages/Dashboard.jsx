import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [dashboardProfile, setDashboardProfile] = useState(profile || null);
    const [charity, setCharity] = useState(null);
    const [scores, setScores] = useState([]);
    const [subscription, setSubscription] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /*
     * =========================================================
     * FETCH DASHBOARD DATA
     * =========================================================
     */

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        fetchDashboardData();
    }, [user, location.state?.refreshDashboard]);

    const fetchDashboardData = async () => {
        if (!user) return;

        try {
            setLoading(true);
            setError("");

            /*
             * 1. PROFILE
             */
            const {
                data: profileData,
                error: profileError,
            } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            if (profileError) {
                console.error("Profile error:", profileError);
                setError("Unable to load your profile.");
            }

            if (profileData) {
                setDashboardProfile(profileData);
            }

            /*
             * 2. SCORES
             */
            const {
                data: scoreData,
                error: scoreError,
            } = await supabase
                .from("scores")
                .select("*")
                .eq("user_id", user.id)
                .order("score_date", {
                    ascending: false,
                })
                .limit(5);

            if (scoreError) {
                console.error("Score error:", scoreError);
                setScores([]);
            } else {
                setScores(scoreData || []);
            }

            /*
             * 3. SUBSCRIPTION
             */
            const {
                data: subscriptionData,
                error: subscriptionError,
            } = await supabase
                .from("subscriptions")
                .select("*")
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

                setSubscription(null);
            } else {
                setSubscription(subscriptionData);
            }

            /*
             * 4. CHARITY
             */
            if (profileData?.charity_id) {
                const {
                    data: charityData,
                    error: charityError,
                } = await supabase
                    .from("charities")
                    .select("*")
                    .eq("id", profileData.charity_id)
                    .single();

                if (charityError) {
                    console.error(
                        "Charity error:",
                        charityError
                    );

                    setCharity(null);
                } else {
                    setCharity(charityData);
                }
            } else {
                setCharity(null);
            }

        } catch (error) {
            console.error("Dashboard error:", error);
            setError("Unable to load dashboard data.");
        } finally {
            setLoading(false);
        }
    };


    /*
     * =========================================================
     * LOADING
     * =========================================================
     */

    if (loading) {
        return (
         
                <div className="min-h-[70vh] flex items-center justify-center">

                    <div className="text-center">

                        <div className="relative mx-auto w-14 h-14">

                            <div className="absolute inset-0 rounded-full border-2 border-[#dfe7dc]" />

                            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#47775f] animate-spin" />

                            <div className="absolute inset-2 rounded-full bg-[#0d2117] flex items-center justify-center text-[#8ee276] text-[10px] font-bold">
                                DH
                            </div>

                        </div>

                        <p className="mt-5 text-[9px] uppercase tracking-[0.25em] text-[#47775f] font-semibold">
                            Digital Heroes
                        </p>

                        <p className="mt-2 text-sm text-[#687169]">
                            Preparing your dashboard...
                        </p>

                    </div>

                </div>
           
        );
    }


    const firstName =
        dashboardProfile?.full_name?.split(" ")[0] ||
        "Hero";

    const subscriptionActive =
        subscription?.status === "active";


    return (
    

            <div className="relative overflow-hidden">

                {/* =====================================================
                    GLOBAL BACKGROUND DECORATION
                ===================================================== */}

                <div className="pointer-events-none absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#dfe7dc]/40 blur-3xl" />

                <div className="pointer-events-none absolute top-[700px] -left-40 w-[400px] h-[400px] rounded-full bg-[#dfe7dc]/30 blur-3xl" />


                <main className="relative max-w-[1500px] mx-auto px-5 sm:px-7 lg:px-10 py-8 lg:py-12">


                    {/* =================================================
                        ERROR
                    ================================================= */}

                    {error && (
                        <div className="mb-8 rounded-2xl border border-red-200 bg-[#f8e9e5] px-5 py-4 text-sm text-red-700 animate-[fadeIn_.4s_ease-out]">
                            {error}
                        </div>
                    )}


                    {/* =================================================
                        WELCOME HERO
                    ================================================= */}

                    <section
                        className="
                            relative
                            overflow-hidden
                            rounded-[2rem]
                            bg-[#0d2117]
                            text-white
                            p-7 sm:p-9 lg:p-12
                            shadow-[0_20px_60px_rgba(13,33,23,0.12)]
                            animate-[fadeUp_.6s_ease-out]
                        "
                    >

                        {/* Glow */}

                        <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full bg-[#8ee276]/10 blur-3xl" />

                        <div className="absolute right-10 bottom-[-100px] w-72 h-72 rounded-full bg-[#47775f]/20 blur-3xl" />


                        {/* Decorative rings */}

                        <div className="absolute right-[-70px] top-[-70px] w-64 h-64 rounded-full border border-[#8ee276]/10" />

                        <div className="absolute right-[-20px] top-[-20px] w-40 h-40 rounded-full border border-[#8ee276]/10" />


                        <div className="relative z-10 grid lg:grid-cols-12 gap-10 items-end">

                            {/* LEFT */}

                            <div className="lg:col-span-8">

                                <div className="flex items-center gap-2 mb-5">

                                    <span className="w-8 h-[2px] bg-[#8ee276]" />

                                    <span className="text-[9px] uppercase tracking-[0.25em] text-[#8ee276] font-semibold">
                                        Member dashboard
                                    </span>

                                </div>


                                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.06em] leading-[0.95]">

                                    Welcome back,

                                    <br />

                                    <span className="text-[#8ee276]">
                                        {firstName}.
                                    </span>

                                </h2>


                                <p className="mt-6 max-w-2xl text-sm sm:text-base text-white/50 leading-relaxed">
                                    Your game can do more than improve your
                                    score. Track your performance, support your
                                    charity, and take part in the monthly draw.
                                </p>

                            </div>


                            {/* RIGHT STATS */}

                            <div className="lg:col-span-4">

                                <div className="grid grid-cols-2 gap-3">

                                    <MiniHeroStat
                                        value={scores.length}
                                        label="Recent scores"
                                    />

                                    <MiniHeroStat
                                        value={`${dashboardProfile?.charity_percentage || 10}%`}
                                        label="To charity"
                                    />

                                </div>

                            </div>

                        </div>

                    </section>


                    {/* =================================================
                        QUICK OVERVIEW
                    ================================================= */}

                    <section className="mt-8">

                        <div className="flex items-end justify-between mb-5">

                            <div>
                                <p className="text-[9px] uppercase tracking-[0.25em] text-[#47775f] font-semibold">
                                    Overview
                                </p>

                                <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-[-0.04em]">
                                    Your membership
                                </h2>
                            </div>

                            <span className="hidden sm:block text-[10px] text-[#8a918b]">
                                Updated just now
                            </span>

                        </div>


                        <div className="grid md:grid-cols-3 gap-4">


                            {/* SUBSCRIPTION */}

                            <DashboardCard
                                number="01"
                                label="Subscription"
                                value={
                                    subscription?.status ||
                                    "Not Active"
                                }
                                description={
                                    subscription?.plan
                                        ? `${subscription.plan} plan`
                                        : "Choose a membership plan"
                                }
                                active={subscriptionActive}
                                action="Manage subscription"
                                onClick={() =>
                                    navigate(
                                        "/dashboard/subscription"
                                    )
                                }
                            />


                            {/* CHARITY */}

                            <DashboardCard
                                number="02"
                                label="Charity contribution"
                                value={`${dashboardProfile?.charity_percentage || 10}%`}
                                description="of your winnings"
                                action="Manage charity"
                                onClick={() =>
                                    navigate(
                                        "/dashboard/charity"
                                    )
                                }
                            />


                            {/* DRAW */}

                            <DashboardCard
                                number="03"
                                label="Monthly draw"
                                value="01×"
                                description="draw every month"
                                action="View draw"
                                onClick={() =>
                                    navigate(
                                        "/dashboard/draw"
                                    )
                                }
                                secondaryAction="Winnings"
                                secondaryOnClick={() =>
                                    navigate(
                                        "/dashboard/winnings"
                                    )
                                }
                            />

                        </div>

                    </section>


                    {/* =================================================
                        PERFORMANCE
                    ================================================= */}

                    <section className="mt-14">

                        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">

                            <div>

                                <p className="text-[9px] uppercase tracking-[0.25em] text-[#47775f] font-semibold">
                                    Performance
                                </p>

                                <h2 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-[-0.05em]">
                                    Your Stableford scores
                                </h2>

                            </div>


                            <button
                                onClick={() =>
                                    navigate(
                                        "/dashboard/scores"
                                    )
                                }
                                className="group flex items-center gap-2 text-sm font-semibold text-[#47775f] hover:text-[#38644f] transition"
                            >
                                Manage scores

                                <span className="group-hover:translate-x-1 transition-transform">
                                    →
                                </span>
                            </button>

                        </div>


                        {scores.length === 0 ? (

                            <div className="
                                rounded-[1.75rem]
                                border border-[#cfd4c8]
                                bg-[#e7ebe3]
                                p-8 sm:p-10
                                animate-[fadeUp_.7s_ease-out]
                            ">

                                <div className="w-12 h-12 rounded-2xl bg-[#0d2117] text-[#8ee276] flex items-center justify-center font-bold">
                                    +
                                </div>

                                <h3 className="mt-6 text-xl font-semibold">
                                    Start tracking your game
                                </h3>

                                <p className="mt-2 text-sm text-[#687169] max-w-md">
                                    Add your first Stableford score and start
                                    building your performance history.
                                </p>

                                <button
                                    onClick={() =>
                                        navigate(
                                            "/dashboard/scores"
                                        )
                                    }
                                    className="
                                        mt-6
                                        group
                                        inline-flex
                                        items-center
                                        gap-3
                                        px-6
                                        py-3.5
                                        rounded-full
                                        bg-[#0d2117]
                                        text-[#8ee276]
                                        text-sm
                                        font-semibold
                                        hover:bg-[#103523]
                                        hover:-translate-y-0.5
                                        transition-all
                                    "
                                >
                                    Add first score

                                    <span className="group-hover:translate-x-1 transition-transform">
                                        →
                                    </span>
                                </button>

                            </div>

                        ) : (

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">

                                {scores.map((score, index) => (

                                    <ScoreCard
                                        key={score.id}
                                        score={score}
                                        index={index}
                                    />

                                ))}

                            </div>

                        )}

                    </section>


                    {/* =================================================
                        IMPACT
                    ================================================= */}

                    <section className="mt-14">

                        <div className="
                            relative
                            overflow-hidden
                            rounded-[2rem]
                            bg-[#dfe7dc]
                            border border-[#cfd8cb]
                            p-7 sm:p-9 lg:p-12
                        ">

                            {/* Decorative glow */}

                            <div className="absolute -right-20 -bottom-24 w-80 h-80 rounded-full bg-[#8ee276]/30 blur-3xl" />


                            <div className="relative z-10 grid lg:grid-cols-12 gap-10 items-center">


                                {/* LEFT */}

                                <div className="lg:col-span-5">

                                    <div className="flex items-center gap-2">

                                        <span className="w-7 h-[2px] bg-[#47775f]" />

                                        <span className="text-[9px] uppercase tracking-[0.25em] text-[#47775f] font-semibold">
                                            Your impact
                                        </span>

                                    </div>


                                    <h2 className="mt-5 text-4xl sm:text-5xl font-semibold tracking-[-0.055em] leading-[0.95]">

                                        Give your
                                        <br />

                                        <span className="text-[#47775f]">
                                            game a purpose.
                                        </span>

                                    </h2>


                                    <p className="mt-6 text-[#687169] leading-relaxed max-w-lg">
                                        {charity?.description ||
                                            "Choose a charity and turn your participation into meaningful impact."}
                                    </p>


                                    <button
                                        onClick={() =>
                                            navigate(
                                                "/dashboard/charity"
                                            )
                                        }
                                        className="
                                            group
                                            mt-7
                                            inline-flex
                                            items-center
                                            gap-3
                                            px-6
                                            py-3.5
                                            rounded-full
                                            bg-[#0d2117]
                                            text-[#8ee276]
                                            text-sm
                                            font-semibold
                                            hover:-translate-y-0.5
                                            hover:shadow-[0_12px_30px_rgba(13,33,23,0.15)]
                                            transition-all
                                        "
                                    >
                                        {charity
                                            ? "View charity"
                                            : "Choose charity"}

                                        <span className="group-hover:translate-x-1 transition-transform">
                                            →
                                        </span>
                                    </button>

                                </div>


                                {/* RIGHT */}

                                <div className="lg:col-span-7">

                                    <div className="
                                        rounded-[1.5rem]
                                        bg-[#f8f7f1]
                                        border border-[#cfd4c8]
                                        overflow-hidden
                                        shadow-[0_15px_40px_rgba(13,33,23,0.06)]
                                    ">

                                        {/* Charity */}

                                        <div className="p-7 sm:p-8 border-b border-[#cfd4c8]">

                                            <div className="flex items-center justify-between gap-4">

                                                <div>

                                                    <p className="text-[9px] uppercase tracking-[0.2em] text-[#8a918b]">
                                                        Selected charity
                                                    </p>

                                                    <h3 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-[-0.04em]">
                                                        {charity?.name ||
                                                            "No charity selected"}
                                                    </h3>

                                                </div>

                                                <div className="w-12 h-12 rounded-2xl bg-[#dfe7dc] text-[#47775f] flex items-center justify-center text-lg">
                                                    ✦
                                                </div>

                                            </div>

                                        </div>


                                        {/* Metrics */}

                                        <div className="grid grid-cols-2">

                                            <ImpactMetric
                                                value={`${dashboardProfile?.charity_percentage || 10}%`}
                                                label="Contribution from winnings"
                                            />

                                            <ImpactMetric
                                                value={scores.length}
                                                label="Scores connected to your game"
                                                accent
                                            />

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </section>


                    {/* =================================================
                        BOTTOM CTA
                    ================================================= */}

                    <section className="mt-14">

                        <div className="
                            rounded-[2rem]
                            bg-[#0d2117]
                            p-7 sm:p-9
                            flex flex-col md:flex-row
                            md:items-center
                            md:justify-between
                            gap-6
                        ">

                            <div>

                                <p className="text-[9px] uppercase tracking-[0.25em] text-[#8ee276] font-semibold">
                                    Keep playing
                                </p>

                                <h3 className="mt-2 text-2xl sm:text-3xl font-semibold text-white tracking-[-0.04em]">
                                    Every round can make an impact.
                                </h3>

                            </div>


                            <button
                                onClick={() =>
                                    navigate(
                                        "/dashboard/scores"
                                    )
                                }
                                className="
                                    group
                                    shrink-0
                                    inline-flex
                                    items-center
                                    justify-center
                                    gap-3
                                    px-6
                                    py-3.5
                                    rounded-full
                                    bg-[#8ee276]
                                    text-[#103523]
                                    font-semibold
                                    text-sm
                                    hover:bg-[#a0ed89]
                                    hover:-translate-y-0.5
                                    transition-all
                                "
                            >
                                Add a score

                                <span className="group-hover:translate-x-1 transition-transform">
                                    →
                                </span>
                            </button>

                        </div>

                    </section>

                </main>

            </div>

       
    );
}


/* =========================================================
   MINI HERO STAT
========================================================= */

function MiniHeroStat({ value, label }) {
    return (
        <div className="
            rounded-2xl
            bg-white/[0.06]
            border border-white/10
            p-5
            backdrop-blur-sm
            transition-all
            duration-300
            hover:bg-white/[0.09]
            hover:-translate-y-1
        ">

            <p className="text-3xl font-semibold text-[#8ee276] tracking-[-0.04em]">
                {value}
            </p>

            <p className="mt-2 text-[9px] uppercase tracking-[0.14em] text-white/35">
                {label}
            </p>

        </div>
    );
}


/* =========================================================
   DASHBOARD CARD
========================================================= */

function DashboardCard({
    number,
    label,
    value,
    description,
    action,
    onClick,
    active,
    secondaryAction,
    secondaryOnClick,
}) {
    return (
        <div className="
            group
            relative
            overflow-hidden
            rounded-[1.5rem]
            bg-[#f8f7f1]
            border border-[#cfd4c8]
            p-6
            sm:p-7
            transition-all
            duration-300
            hover:-translate-y-1
            hover:border-[#aeb9ad]
            hover:shadow-[0_18px_40px_rgba(13,33,23,0.08)]
        ">

            {/* Hover glow */}

            <div className="
                absolute
                -right-16
                -top-16
                w-36
                h-36
                rounded-full
                bg-[#8ee276]/0
                group-hover:bg-[#8ee276]/20
                blur-3xl
                transition-all
                duration-500
            " />


            <div className="relative z-10">

                <div className="flex items-center justify-between">

                    <span className="w-8 h-8 rounded-full bg-[#dfe7dc] text-[#47775f] flex items-center justify-center text-[9px] font-semibold">
                        {number}
                    </span>

                    {active && (
                        <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.12em] text-[#47775f] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#8ee276]" />
                            Active
                        </span>
                    )}

                </div>


                <p className="mt-7 text-[9px] uppercase tracking-[0.18em] text-[#8a918b]">
                    {label}
                </p>


                <p className="mt-3 text-3xl sm:text-4xl font-semibold tracking-[-0.05em] capitalize">
                    {value}
                </p>


                <p className="mt-2 text-xs text-[#687169]">
                    {description}
                </p>


                <div className="mt-6 flex items-center gap-4">

                    <button
                        onClick={onClick}
                        className="group/link text-xs font-semibold text-[#47775f]"
                    >
                        {action}

                        <span className="ml-1 inline-block group-hover/link:translate-x-1 transition-transform">
                            →
                        </span>
                    </button>


                    {secondaryAction && (
                        <button
                            onClick={secondaryOnClick}
                            className="text-xs font-semibold text-[#8a918b] hover:text-[#47775f] transition"
                        >
                            {secondaryAction}
                        </button>
                    )}

                </div>

            </div>

        </div>
    );
}


/* =========================================================
   SCORE CARD
========================================================= */

function ScoreCard({ score, index }) {
    return (
        <div
            className={`
                group
                relative
                overflow-hidden
                rounded-[1.5rem]
                border
                p-5 sm:p-6
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-[0_18px_40px_rgba(13,33,23,0.08)]
                animate-[fadeUp_.5s_ease-out]
                ${
                    index === 0
                        ? "bg-[#0d2117] border-[#0d2117] text-white"
                        : "bg-[#f8f7f1] border-[#cfd4c8] text-[#101813]"
                }
            `}
            style={{
                animationDelay: `${index * 80}ms`,
            }}
        >

            <div className="flex items-center justify-between">

                <p
                    className={`text-[9px] uppercase tracking-[0.15em] ${
                        index === 0
                            ? "text-white/40"
                            : "text-[#8a918b]"
                    }`}
                >
                    Score {index + 1}
                </p>

                {index === 0 && (
                    <span className="text-[9px] uppercase tracking-[0.12em] text-[#8ee276]">
                        Latest
                    </span>
                )}

            </div>


            <p
                className={`
                    mt-5
                    text-5xl
                    font-semibold
                    tracking-[-0.06em]
                    ${
                        index === 0
                            ? "text-[#8ee276]"
                            : "text-[#101813]"
                    }
                `}
            >
                {score.score}
            </p>


            <p
                className={`mt-2 text-[10px] ${
                    index === 0
                        ? "text-white/40"
                        : "text-[#8a918b]"
                }`}
            >
                {new Date(
                    score.score_date
                ).toLocaleDateString()}
            </p>


            <p
                className={`mt-1 text-[10px] ${
                    index === 0
                        ? "text-white/50"
                        : "text-[#687169]"
                }`}
            >
                Stableford
            </p>


            {/* Bottom line */}

            <div
                className={`
                    absolute
                    bottom-0
                    left-5
                    right-5
                    h-[2px]
                    ${
                        index === 0
                            ? "bg-[#8ee276]"
                            : "bg-[#dfe7dc] group-hover:bg-[#8ee276]"
                    }
                    transition-colors
                `}
            />

        </div>
    );
}


/* =========================================================
   IMPACT METRIC
========================================================= */

function ImpactMetric({
    value,
    label,
    accent,
}) {
    return (
        <div className="p-7 sm:p-8 border-r last:border-r-0 border-[#cfd4c8]">

            <p
                className={`
                    text-4xl sm:text-5xl
                    font-semibold
                    tracking-[-0.06em]
                    ${
                        accent
                            ? "text-[#47775f]"
                            : "text-[#101813]"
                    }
                `}
            >
                {value}
            </p>

            <p className="mt-3 text-xs text-[#687169] leading-relaxed">
                {label}
            </p>

        </div>
    );
}


export default Dashboard;