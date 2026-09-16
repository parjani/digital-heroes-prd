import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

function Subscription() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [subscription, setSubscription] = useState(null);
    const [plan, setPlan] = useState("monthly");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const plans = [
        {
            id: "monthly",
            name: "Monthly",
            price: 499,
            description: "Flexible monthly membership",
        },
        {
            id: "yearly",
            name: "Yearly",
            price: 4999,
            description: "Best value for long-term members",
        },
    ];

    useEffect(() => {
        if (user) {
            fetchSubscription();
        }
    }, [user]);

    const fetchSubscription = async () => {
        const { data, error } = await supabase
            .from("subscriptions")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) {
            console.error(error);
            setError("Unable to load subscription.");
        } else {
            setSubscription(data);
            if (data?.plan) {
                setPlan(data.plan);
            }
        }

        setLoading(false);
    };

    const handleDemoSubscription = async () => {
        setError("");
        setMessage("");

        if (!user) {
            setError("You must be logged in.");
            return;
        }

        setSaving(true);

        try {
            // Check whether the user already has an active subscription
            const { data: existingSubscription, error: checkError } =
                await supabase
                    .from("subscriptions")
                    .select("*")
                    .eq("user_id", user.id)
                    .eq("status", "active")
                    .maybeSingle();

            if (checkError) {
                throw checkError;
            }

            if (existingSubscription) {
                setSubscription(existingSubscription);
                setPlan(existingSubscription.plan);

                setMessage(
                    "You already have an active subscription."
                );

                return;
            }

            const selectedPlan = plans.find(
                (item) => item.id === plan
            );

            if (!selectedPlan) {
                throw new Error(
                    "Please select a valid subscription plan."
                );
            }

            const now = new Date();

            const endDate = new Date(now);

            if (plan === "monthly") {
                endDate.setMonth(
                    endDate.getMonth() + 1
                );
            } else {
                endDate.setFullYear(
                    endDate.getFullYear() + 1
                );
            }

            const { data, error } = await supabase
                .from("subscriptions")
                .insert({
                    user_id: user.id,
                    plan: plan,
                    amount: selectedPlan.price,
                    currency: "INR",
                    status: "active",

                    start_date:
                        now.toISOString(),

                    renewal_date:
                        endDate.toISOString(),

                    current_period_start:
                        now.toISOString(),

                    current_period_end:
                        endDate.toISOString(),

                    cancel_at_period_end:
                        false,
                })
                .select()
                .single();

            if (error) {
                throw error;
            }

            setSubscription(data);
            setPlan(data.plan);

            setMessage(
                `${selectedPlan.name} subscription activated successfully.`
            );
        } catch (error) {
            console.error(
                "Subscription activation error:",
                error
            );

            setError(
                error.message ||
                "Unable to activate subscription."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = async () => {
        if (!subscription?.id) {
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to cancel your subscription?"
        );

        if (!confirmed) {
            return;
        }

        setSaving(true);
        setError("");
        setMessage("");

        try {
            const { data, error } = await supabase
                .from("subscriptions")
                .update({
                    status: "cancelled",
                    cancelled_at:
                        new Date().toISOString(),
                    cancel_at_period_end: true,
                    updated_at:
                        new Date().toISOString(),
                })
                .eq("id", subscription.id)
                .eq("user_id", user.id)
                .select()
                .single();

            if (error) {
                throw error;
            }

            setSubscription(data);

            setMessage(
                "Your subscription has been cancelled."
            );
        } catch (error) {
            console.error(
                "Subscription cancellation error:",
                error
            );

            setError(
                error.message ||
                "Unable to cancel subscription."
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f7f3ea] text-[#101813] flex items-center justify-center">
                Loading subscription...
            </div>
        );
    }

    const isActive = subscription?.status === "active";

    return (
    <div className="min-h-screen bg-[#f3f1e8] text-[#101813]">

    

        <main className="max-w-7xl mx-auto px-6 lg:px-10 py-12 md:py-16">

            {/* Header */}
            <section className="border-b border-[#cfd4c8] pb-12">

                <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#47775f]">
                    § 01 · Membership
                </p>

                <div className="mt-5 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">

                    <div className="max-w-3xl">

                        <h1 className="text-4xl md:text-6xl font-semibold tracking-[-0.04em] leading-[0.95]">
                            Your place in the
                            <span className="block text-[#47775f]">
                                monthly draw.
                            </span>
                        </h1>

                        <p className="mt-6 text-[#687169] text-base md:text-lg leading-7 max-w-2xl">
                            Stay subscribed to participate in monthly draws,
                            track your performance and turn your winnings into
                            meaningful charitable impact.
                        </p>

                    </div>

                    <div className="border-l border-[#cfd4c8] pl-6 min-w-[190px]">

                        <p className="text-xs uppercase tracking-[0.16em] text-[#8a918b]">
                            Entry
                        </p>

                        <p className="mt-2 text-3xl font-semibold tracking-tight">
                            ₹499
                        </p>

                        <p className="mt-1 text-sm text-[#687169]">
                            monthly
                        </p>

                    </div>

                </div>

            </section>

            {/* Current subscription */}
            {subscription && (
                <section className="py-12 border-b border-[#cfd4c8]">

                    <div className="flex flex-col lg:flex-row lg:items-stretch gap-px bg-[#cfd4c8] border border-[#cfd4c8]">

                        {/* Status */}
                        <div className="flex-1 bg-[#dfe5da] p-7 md:p-9">

                            <p className="text-xs uppercase tracking-[0.16em] text-[#687169]">
                                Current membership
                            </p>

                            <div className="mt-7 flex items-end gap-4">

                                <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
                                    {subscription?.status === "active"
                                        ? "Active"
                                        : subscription?.status === "cancelled"
                                            ? "Cancelled"
                                            : "No Active Subscription"}
                                </h2>

                                <span
                                    className={`mb-1 w-2.5 h-2.5 ${
                                        subscription?.status === "active"
                                            ? "bg-[#47775f]"
                                            : "bg-[#a86b45]"
                                    }`}
                                />

                            </div>

                            {subscription?.plan && (
                                <p className="mt-4 text-sm text-[#687169] capitalize">
                                    {subscription.plan} membership
                                </p>
                            )}

                        </div>

                        {/* Period */}
                        <div className="lg:w-[340px] bg-[#f8f7f1] p-7 md:p-9">

                            <p className="text-xs uppercase tracking-[0.16em] text-[#8a918b]">
                                Current period
                            </p>

                            {subscription?.current_period_end ? (
                                <>
                                    <p className="mt-7 text-2xl font-semibold">
                                        {new Date(
                                            subscription.current_period_end
                                        ).toLocaleDateString("en-IN")}
                                    </p>

                                    <p className="mt-2 text-sm text-[#687169]">
                                        Renewal / period end
                                    </p>
                                </>
                            ) : (
                                <p className="mt-7 text-sm text-[#687169]">
                                    No period information available.
                                </p>
                            )}

                        </div>

                    </div>

                    {isActive && (
                        <div className="mt-7 flex justify-end">

                            <button
                                onClick={handleCancel}
                                disabled={saving}
                                className="px-5 py-3 border border-[#c9a99d] text-[#9a5945] text-sm font-semibold hover:bg-[#f4e8e3] disabled:opacity-50 transition"
                            >
                                Cancel subscription
                            </button>

                        </div>
                    )}

                </section>
            )}

            {/* Plans */}
            {!isActive && (
                <section className="py-12 border-b border-[#cfd4c8]">

                    <div className="mb-8">

                        <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#47775f]">
                            § 02 · Choose a plan
                        </p>

                        <h2 className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight">
                            Pick your membership.
                        </h2>

                        <p className="mt-3 text-[#687169] max-w-2xl">
                            Choose the membership period that works for you.
                            Both plans include access to the monthly draw,
                            score tracking and charity participation.
                        </p>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#cfd4c8] border border-[#cfd4c8]">

                        {plans.map((item, index) => {
                            const isSelected = plan === item.id;

                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setPlan(item.id)}
                                    className={`text-left p-7 md:p-9 min-h-[330px] transition ${
                                        isSelected
                                            ? "bg-[#dfe5da]"
                                            : "bg-[#f8f7f1] hover:bg-[#e7ebe3]"
                                    }`}
                                >

                                    <div className="flex items-start justify-between">

                                        <div>
                                            <p className="text-xs uppercase tracking-[0.16em] text-[#47775f] font-semibold">
                                                0{index + 1} · {item.name}
                                            </p>
                                        </div>

                                        <span
                                            className={`w-5 h-5 border flex items-center justify-center ${
                                                isSelected
                                                    ? "border-[#47775f] bg-[#47775f]"
                                                    : "border-[#aeb5ac]"
                                            }`}
                                        >
                                            {isSelected && (
                                                <span className="w-2 h-2 bg-[#f8f7f1]" />
                                            )}
                                        </span>

                                    </div>

                                    <div className="mt-14">

                                        <div className="flex items-end gap-2">

                                            <span className="text-4xl md:text-5xl font-semibold tracking-[-0.04em]">
                                                ₹{item.price.toLocaleString()}
                                            </span>

                                            <span className="text-sm text-[#687169] mb-2">
                                                / {item.id === "monthly" ? "month" : "year"}
                                            </span>

                                        </div>

                                        <p className="mt-4 text-sm text-[#687169]">
                                            {item.description}
                                        </p>

                                    </div>

                                    <div className="mt-8 pt-5 border-t border-[#cfd4c8] grid grid-cols-1 gap-2 text-sm text-[#687169]">

                                        <span>✓ Monthly draw participation</span>
                                        <span>✓ Charity contribution</span>
                                        <span>✓ Stableford score tracking</span>

                                    </div>

                                </button>
                            );
                        })}

                    </div>

                </section>
            )}

            {/* Activate */}
            {!isActive && (
                <section className="py-12 border-b border-[#cfd4c8]">

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">

                        <div>

                            <p className="text-xs uppercase tracking-[0.16em] text-[#8a918b]">
                                § 03 · Activate
                            </p>

                            <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                                Ready to join the draw?
                            </h2>

                            <p className="mt-2 text-sm text-[#687169]">
                                Selected plan:{" "}
                                <span className="font-semibold text-[#101813] capitalize">
                                    {plan}
                                </span>
                            </p>

                        </div>

                        <div className="text-left md:text-right">

                            <button
                                onClick={handleDemoSubscription}
                                disabled={saving}
                                className="px-7 py-3.5 bg-[#47775f] text-white text-sm font-semibold hover:bg-[#38644f] disabled:opacity-50 transition"
                            >
                                {saving
                                    ? "Activating..."
                                    : `Activate ${plan} subscription →`}
                            </button>

                            <p className="text-xs text-[#8a918b] mt-3">
                                Demo mode · Stripe payment will be connected later.
                            </p>

                        </div>

                    </div>

                </section>
            )}

            {/* Messages */}
            {error && (
                <div className="mt-8 border border-red-200 bg-[#f8e9e5] px-5 py-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            {message && (
                <div className="mt-8 border border-[#b8cbbd] bg-[#e4eee6] px-5 py-4 text-sm text-[#38644f]">
                    {message}
                </div>
            )}

            {/* Membership benefits */}
            <section className="pt-12">

                <div className="grid md:grid-cols-3 gap-px bg-[#cfd4c8] border border-[#cfd4c8]">

                    <div className="bg-[#f8f7f1] p-7">
                        <p className="text-xs uppercase tracking-[0.16em] text-[#47775f]">
                            01
                        </p>
                        <h3 className="mt-6 text-xl font-semibold">
                            Play
                        </h3>
                        <p className="mt-3 text-sm leading-6 text-[#687169]">
                            Track your latest Stableford scores and use your
                            performance for draw participation.
                        </p>
                    </div>

                    <div className="bg-[#f8f7f1] p-7">
                        <p className="text-xs uppercase tracking-[0.16em] text-[#47775f]">
                            02
                        </p>
                        <h3 className="mt-6 text-xl font-semibold">
                            Participate
                        </h3>
                        <p className="mt-3 text-sm leading-6 text-[#687169]">
                            Active members can participate in the monthly
                            Digital Heroes draw.
                        </p>
                    </div>

                    <div className="bg-[#f8f7f1] p-7">
                        <p className="text-xs uppercase tracking-[0.16em] text-[#47775f]">
                            03
                        </p>
                        <h3 className="mt-6 text-xl font-semibold">
                            Give back
                        </h3>
                        <p className="mt-3 text-sm leading-6 text-[#687169]">
                            Direct a chosen percentage of your winnings towards
                            a charity you care about.
                        </p>
                    </div>

                </div>

            </section>

        </main>

       

    </div>
);
}

export default Subscription;