import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
    const { user, profile, logout } = useAuth();
    const navigate = useNavigate();

    const [charity, setCharity] = useState(null);
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [subscription, setSubscription] = useState(null);

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch user's scores
            const { data: scoreData, error: scoreError } = await supabase
                .from("scores")
                .select("*")
                .eq("user_id", user.id)
                .order("score_date", { ascending: false })
                .limit(5);

            if (scoreError) {
                console.error("Score error:", scoreError);
            } else {
                setScores(scoreData || []);
            }

            const { data: subscriptionData, error: subscriptionError } =
                await supabase
                    .from("subscriptions")
                    .select("*")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .maybeSingle();

            if (subscriptionError) {
                console.error("Subscription error:", subscriptionError);
            } else {
                setSubscription(subscriptionData);
            }

            // Fetch user's selected charity
            if (profile?.charity_id) {
                const { data: charityData, error: charityError } = await supabase
                    .from("charities")
                    .select("*")
                    .eq("id", profile.charity_id)
                    .single();

                if (charityError) {
                    console.error("Charity error:", charityError);
                } else {
                    setCharity(charityData);
                }
            }
        } catch (error) {
            console.error("Dashboard error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f7f3ea] flex items-center justify-center text-[#101813]">
                <p className="text-[#5d625d]">Loading dashboard...</p>
            </div>
        );
    }

   return (
    <div className="min-h-screen bg-[#f3f1e8] text-[#101813]">

       

        {/* MAIN */}
        <main className="max-w-7xl mx-auto px-6 lg:px-10 py-12 md:py-16">


            {/* HEADER */}
            <section className="border-b border-[#cfd4c8] pb-12">

                <div className="grid lg:grid-cols-12 gap-10">

                    <div className="lg:col-span-2">

                        <p className="text-xs uppercase tracking-[0.25em] text-[#47775f]">
                            § 01 · Dashboard
                        </p>

                    </div>

                    <div className="lg:col-span-8 lg:col-start-4">

                        <p className="text-sm uppercase tracking-[0.2em] text-[#8a918b]">
                            Your impact dashboard
                        </p>

                        <h1 className="mt-4 text-5xl md:text-6xl font-semibold tracking-[-0.045em] leading-[0.95]">
                            Welcome back,
                            <br />
                            <span className="text-[#47775f]">
                                {profile?.full_name?.split(" ")[0] || "Hero"}.
                            </span>
                        </h1>

                        <p className="mt-7 max-w-2xl text-lg text-[#687169] leading-relaxed">
                            Your game can do more than improve your score.
                            Track your performance, support your charity,
                            and take part in the monthly draw.
                        </p>

                    </div>

                </div>

            </section>


            {/* OVERVIEW */}
            <section className="border-b border-[#cfd4c8]">

                <div className="py-12">

                    <div className="flex items-end justify-between mb-8">

                        <div>
                            <p className="text-xs uppercase tracking-[0.25em] text-[#8a918b]">
                                § 02 · Overview
                            </p>

                            <h2 className="text-2xl md:text-3xl font-semibold mt-3">
                                Your membership
                            </h2>
                        </div>

                    </div>


                    <div className="grid md:grid-cols-3 border-t border-[#cfd4c8]">

                        {/* SUBSCRIPTION */}
                        <div className="py-8 md:pr-8 md:border-r border-[#cfd4c8]">

                            <p className="text-xs uppercase tracking-[0.18em] text-[#8a918b]">
                                Subscription
                            </p>

                            <div className="mt-5 flex items-baseline gap-3">

                                <p className="text-4xl font-semibold capitalize">
                                    {subscription?.status || "Not Active"}
                                </p>

                                <span
                                    className={
                                        subscription?.status === "active"
                                            ? "text-sm text-[#47775f]"
                                            : "text-sm text-[#9a6f32]"
                                    }
                                >
                                    ●
                                </span>

                            </div>

                            {subscription?.plan && (
                                <p className="mt-2 text-sm text-[#687169] capitalize">
                                    {subscription.plan} plan
                                </p>
                            )}

                            <button
                                onClick={() =>
                                    navigate("/dashboard/subscription")
                                }
                                className="mt-6 text-sm font-medium text-[#47775f] hover:text-[#38644f] transition"
                            >
                                Manage subscription →
                            </button>

                        </div>


                        {/* CHARITY */}
                        <div className="py-8 md:px-8 md:border-r border-[#cfd4c8]">

                            <p className="text-xs uppercase tracking-[0.18em] text-[#8a918b]">
                                Charity contribution
                            </p>

                            <p className="mt-5 text-4xl font-semibold">
                                {profile?.charity_percentage || 10}%
                            </p>

                            <p className="mt-2 text-sm text-[#687169]">
                                of your winnings
                            </p>

                            <button
                                onClick={() =>
                                    navigate("/dashboard/charity")
                                }
                                className="mt-6 text-sm font-medium text-[#47775f] hover:text-[#38644f] transition"
                            >
                                Manage charity →
                            </button>

                        </div>


                        {/* DRAW */}
                        <div className="py-8 md:pl-8">

                            <p className="text-xs uppercase tracking-[0.18em] text-[#8a918b]">
                                Monthly draw
                            </p>

                            <p className="mt-5 text-4xl font-semibold">
                                01×
                            </p>

                            <p className="mt-2 text-sm text-[#687169]">
                                draw every month
                            </p>

                            <div className="mt-6 flex gap-5">

                                <button
                                    onClick={() =>
                                        navigate("/dashboard/draw")
                                    }
                                    className="text-sm font-medium text-[#47775f] hover:text-[#38644f] transition"
                                >
                                    View draw →
                                </button>

                                <button
                                    onClick={() =>
                                        navigate("/dashboard/winnings")
                                    }
                                    className="text-sm font-medium text-[#47775f] hover:text-[#38644f] transition"
                                >
                                    Winnings →
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {/* PERFORMANCE */}
            <section className="border-b border-[#cfd4c8]">

                <div className="py-12">

                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-8">

                        <div>

                            <p className="text-xs uppercase tracking-[0.25em] text-[#47775f]">
                                § 03 · Performance
                            </p>

                            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mt-3">
                                Your Stableford scores
                            </h2>

                        </div>

                        <button
                            onClick={() =>
                                navigate("/dashboard/scores")
                            }
                            className="text-sm font-medium text-[#47775f] hover:text-[#38644f] transition"
                        >
                            Manage scores →
                        </button>

                    </div>


                    {scores.length === 0 ? (

                        <div className="border border-[#cfd4c8] bg-[#e7ebe3] p-10">

                            <p className="text-[#687169]">
                                You haven't added any scores yet.
                            </p>

                            <button
                                onClick={() =>
                                    navigate("/dashboard/scores")
                                }
                                className="mt-6 px-6 py-3 bg-[#47775f] text-white font-semibold hover:bg-[#38644f] transition"
                            >
                                Add your first score →
                            </button>

                        </div>

                    ) : (

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 border-t border-l border-[#cfd4c8]">

                            {scores.map((score, index) => (

                                <div
                                    key={score.id}
                                    className={`p-6 bg-[#f8f7f1] border-r border-b border-[#cfd4c8] ${
                                        index === 0
                                            ? "bg-[#dfe5da]"
                                            : ""
                                    }`}
                                >

                                    <p className="text-xs uppercase tracking-[0.15em] text-[#8a918b]">
                                        Score {index + 1}
                                    </p>

                                    <p className="mt-5 text-5xl font-semibold tracking-tight">
                                        {score.score}
                                    </p>

                                    <p className="mt-2 text-xs text-[#8a918b]">
                                        {new Date(
                                            score.score_date
                                        ).toLocaleDateString()}
                                    </p>

                                    <p className="mt-1 text-xs text-[#687169]">
                                        Stableford
                                    </p>

                                </div>

                            ))}

                        </div>

                    )}

                </div>

            </section>


            {/* CHARITY / IMPACT */}
            <section>

                <div className="py-12">

                    <div className="grid lg:grid-cols-12 gap-12 items-center">

                        <div className="lg:col-span-5">

                            <p className="text-xs uppercase tracking-[0.25em] text-[#47775f]">
                                § 04 · Your impact
                            </p>

                            <h2 className="mt-5 text-4xl md:text-5xl font-semibold tracking-[-0.04em] leading-tight">
                                Give your
                                <br />
                                game a purpose.
                            </h2>

                            <p className="mt-6 text-[#687169] leading-relaxed max-w-lg">
                                {charity?.description ||
                                    "Choose a charity and turn your participation into meaningful impact."}
                            </p>

                            <button
                                onClick={() =>
                                    navigate("/dashboard/charity")
                                }
                                className="mt-8 px-6 py-3 bg-[#47775f] text-white font-semibold hover:bg-[#38644f] transition"
                            >
                                {charity
                                    ? "View charity →"
                                    : "Choose charity →"}
                            </button>

                        </div>


                        <div className="lg:col-span-7">

                            <div className="border border-[#cfd4c8] bg-[#dfe5da]">

                                <div className="p-8 md:p-10 border-b border-[#cfd4c8]">

                                    <p className="text-xs uppercase tracking-[0.2em] text-[#687169]">
                                        Selected charity
                                    </p>

                                    <h3 className="mt-4 text-3xl md:text-4xl font-semibold">
                                        {charity?.name || "No charity selected"}
                                    </h3>

                                </div>

                                <div className="grid grid-cols-2">

                                    <div className="p-8 border-r border-[#cfd4c8]">

                                        <p className="text-4xl md:text-5xl font-semibold">
                                            {profile?.charity_percentage || 10}%
                                        </p>

                                        <p className="mt-3 text-sm text-[#687169]">
                                            contribution from winnings
                                        </p>

                                    </div>

                                    <div className="p-8">

                                        <p className="text-4xl md:text-5xl font-semibold text-[#47775f]">
                                            5
                                        </p>

                                        <p className="mt-3 text-sm text-[#687169]">
                                            latest scores connected to your game
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </section>

        </main>


       

    </div>
);
}

export default Dashboard;