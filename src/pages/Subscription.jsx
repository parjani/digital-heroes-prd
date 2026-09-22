import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

function Subscription() {
    const { user } = useAuth();

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
            period: "month",
            description: "Flexible membership with monthly billing.",
        },
        {
            id: "yearly",
            name: "Yearly",
            price: 4999,
            period: "year",
            description: "Long-term membership with one annual payment.",
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

    const handleActivateSubscription = async () => {
    if (!user) {
        setError("You must be logged in.");
        return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
        // 1. Check if user already has an active subscription
        const {
            data: existingSubscription,
            error: checkError,
        } = await supabase
            .from("subscriptions")
            .select("id, status")
            .eq("user_id", user.id)
            .eq("status", "active")
            .maybeSingle();

        if (checkError) {
            throw checkError;
        }

        if (existingSubscription) {
            setError("You already have an active subscription.");
            setSaving(false);
            return;
        }

        // 2. Validate selected plan
        const selectedPlan = plans.find(
            (item) => item.id === plan
        );

        if (!selectedPlan) {
            throw new Error(
                "Please select a valid subscription plan."
            );
        }

        // 3. Load Razorpay Checkout script
        if (!window.Razorpay) {
            await new Promise((resolve, reject) => {
                const script = document.createElement("script");

                script.src =
                    "https://checkout.razorpay.com/v1/checkout.js";

                script.onload = resolve;

                script.onerror = () => {
                    reject(
                        new Error(
                            "Unable to load Razorpay Checkout."
                        )
                    );
                };

                document.body.appendChild(script);
            });
        }

        // 4. Create Razorpay Order through Supabase Edge Function
        const {
            data: orderData,
            error: functionError,
        } = await supabase.functions.invoke(
            "create-razorpay-order",
            {
                body: {
                    plan,
                    userId: user.id,
                },
            }
        );

        if (functionError) {
            throw new Error(
                functionError.message ||
                "Unable to create Razorpay order."
            );
        }

        if (!orderData?.orderId) {
            throw new Error(
                orderData?.error ||
                "Unable to create Razorpay order."
            );
        }

        // 5. Razorpay Checkout configuration
        const options = {
            key: orderData.keyId,

            amount: orderData.amount,

            currency: orderData.currency || "INR",

            name: "Digital Heroes",

            description:
                selectedPlan.name +
                " Digital Heroes Membership",

            order_id: orderData.orderId,

            prefill: {
                name:
                    user.user_metadata?.full_name ||
                    "",
                email: user.email || "",
            },

            notes: {
                plan,
                user_id: user.id,
            },

            theme: {
                color: "#47775f",
            },

            handler: async function (response) {
                console.log(
                    "Razorpay payment successful:",
                    response
                );

                /*
                 * Razorpay returns:
                 *
                 * response.razorpay_payment_id
                 * response.razorpay_order_id
                 * response.razorpay_signature
                 *
                 * We will verify these on the server
                 * in the next step.
                 */

                try {
                    setMessage(
                        "Payment received. Verifying payment..."
                    );

                    const {
                        data: verifyData,
                        error: verifyError,
                    } = await supabase.functions.invoke(
                        "verify-razorpay-payment",
                        {
                            body: {
                                razorpay_payment_id:
                                    response.razorpay_payment_id,

                                razorpay_order_id:
                                    response.razorpay_order_id,

                                razorpay_signature:
                                    response.razorpay_signature,

                                userId: user.id,

                                plan,
                            },
                        }
                    );

                    if (verifyError) {
                        throw new Error(
                            verifyError.message ||
                            "Payment verification failed."
                        );
                    }

                    if (!verifyData?.success) {
                        throw new Error(
                            verifyData?.error ||
                            "Payment verification failed."
                        );
                    }

                    setMessage(
                        "Payment successful! Your membership is now active."
                    );

                    // Refresh subscription information
                    await fetchSubscription();

                } catch (verifyErr) {
                    console.error(
                        "Payment verification error:",
                        verifyErr
                    );

                    setError(
                        verifyErr?.message ||
                        "Payment was received but verification failed."
                    );

                    setMessage("");
                } finally {
                    setSaving(false);
                }
            },

            modal: {
                ondismiss: function () {
                    console.log(
                        "Razorpay Checkout closed."
                    );

                    setSaving(false);
                },
            },
        };

        // 6. Open Razorpay Checkout
        const razorpay = new window.Razorpay(options);

        razorpay.on(
            "payment.failed",
            function (response) {
                console.error(
                    "Razorpay payment failed:",
                    response
                );

                setError(
                    response?.error?.description ||
                    "Payment failed. Please try again."
                );

                setSaving(false);
            }
        );

        razorpay.open();

    } catch (err) {
        console.error(
            "Subscription payment error:",
            err
        );

        setError(
            err?.message ||
            "Unable to start payment."
        );

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
                    cancelled_at: new Date().toISOString(),
                    cancel_at_period_end: true,
                    updated_at: new Date().toISOString(),
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
        } catch (err) {
            console.error(
                "Subscription cancellation error:",
                err
            );

            setError(
                err?.message ||
                "Unable to cancel subscription."
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[70vh] bg-[#f3f1e8] flex items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto w-10 h-10 rounded-full border-2 border-[#cfd4c8] border-t-[#47775f] animate-spin" />

                    <p className="mt-4 text-sm text-[#687169]">
                        Loading membership...
                    </p>
                </div>
            </div>
        );
    }

    const isActive = subscription?.status === "active";

    const selectedPlan = plans.find(
        (item) => item.id === plan
    );

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
                                        Membership
                                    </span>
                                </div>

                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.05em] leading-[0.98]">
                                    Your place in the
                                    <br />
                                    <span className="text-[#8ee276]">
                                        monthly draw.
                                    </span>
                                </h1>

                                <p className="mt-6 max-w-2xl text-sm sm:text-base text-white/55 leading-relaxed">
                                    Stay subscribed to participate in monthly
                                    draws, track your performance and turn
                                    your winnings into meaningful impact.
                                </p>

                            </div>

                            <div className="lg:col-span-4 lg:flex lg:justify-end">

                                <div className="w-full sm:w-[230px] rounded-2xl bg-white/[0.07] border border-white/10 p-5 backdrop-blur-sm">

                                    <div className="flex items-center justify-between">

                                        <p className="text-[9px] uppercase tracking-[0.2em] text-white/40">
                                            From
                                        </p>

                                        <span className="w-2 h-2 rounded-full bg-[#8ee276]" />

                                    </div>

                                    <p className="mt-4 text-4xl font-bold">
                                        ₹499
                                    </p>

                                    <p className="mt-2 text-xs text-white/35">
                                        monthly membership
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>

                </section>


                {/* =====================================================
                    CURRENT SUBSCRIPTION
                ====================================================== */}

                {subscription && (
                    <section className="mt-10">

                        <div className="flex items-center gap-2 mb-6">

                            <span className="w-6 h-[2px] bg-[#47775f]" />

                            <p className="text-[9px] uppercase tracking-[0.23em] text-[#47775f] font-semibold">
                                Current membership
                            </p>

                        </div>

                        <div className="grid lg:grid-cols-12 gap-5">

                            {/* Status */}

                            <div className="lg:col-span-7 rounded-[1.75rem] bg-[#103523] text-white p-7 sm:p-9">

                                <div className="flex items-start justify-between gap-6">

                                    <div>

                                        <p className="text-[9px] uppercase tracking-[0.2em] text-white/35">
                                            Membership status
                                        </p>

                                        <div className="mt-5 flex items-center gap-3">

                                            <span
                                                className={`w-3 h-3 rounded-full ${
                                                    subscription.status === "active"
                                                        ? "bg-[#8ee276]"
                                                        : "bg-[#c27b5d]"
                                                }`}
                                            />

                                            <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.04em] capitalize">
                                                {subscription.status}
                                            </h2>

                                        </div>

                                        {subscription.plan && (
                                            <p className="mt-4 text-sm text-white/45 capitalize">
                                                {subscription.plan} membership
                                            </p>
                                        )}

                                    </div>

                                    <div className="w-11 h-11 rounded-xl bg-[#8ee276] text-[#103523] flex items-center justify-center font-bold">
                                        ✓
                                    </div>

                                </div>

                                <div className="mt-10 pt-6 border-t border-white/10 grid grid-cols-2 gap-6">

                                    <div>

                                        <p className="text-[9px] uppercase tracking-[0.16em] text-white/30">
                                            Amount
                                        </p>

                                        <p className="mt-2 text-lg font-semibold">
                                            ₹{subscription.amount?.toLocaleString("en-IN")}
                                        </p>

                                    </div>

                                    <div>

                                        <p className="text-[9px] uppercase tracking-[0.16em] text-white/30">
                                            Currency
                                        </p>

                                        <p className="mt-2 text-lg font-semibold">
                                            {subscription.currency || "INR"}
                                        </p>

                                    </div>

                                </div>

                            </div>


                            {/* Period */}

                            <div className="lg:col-span-5 rounded-[1.75rem] bg-white border border-[#d9ddd4] p-7 sm:p-9">

                                <p className="text-[9px] uppercase tracking-[0.2em] text-[#8a918b]">
                                    Current period
                                </p>

                                {subscription.current_period_end ? (
                                    <>
                                        <p className="mt-6 text-3xl sm:text-4xl font-bold tracking-[-0.04em] text-[#103523]">
                                            {new Date(
                                                subscription.current_period_end
                                            ).toLocaleDateString("en-IN", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </p>

                                        <p className="mt-3 text-sm text-[#687169]">
                                            Renewal / membership period end
                                        </p>
                                    </>
                                ) : (
                                    <p className="mt-6 text-sm text-[#687169]">
                                        No period information available.
                                    </p>
                                )}

                                {isActive && (
                                    <button
                                        onClick={handleCancel}
                                        disabled={saving}
                                        className="mt-8 w-full px-5 py-3.5 rounded-xl border border-[#d8bbb0] text-[#9a5945] text-sm font-semibold hover:bg-[#f7ebe7] disabled:opacity-50 transition-all"
                                    >
                                        {saving
                                            ? "Processing..."
                                            : "Cancel subscription"}
                                    </button>
                                )}

                            </div>

                        </div>

                    </section>
                )}


                {/* =====================================================
                    PLANS
                ====================================================== */}

                {!isActive && (
                    <section className="mt-12">

                        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-7">

                            <div>

                                <div className="flex items-center gap-2">

                                    <span className="w-6 h-[2px] bg-[#47775f]" />

                                    <p className="text-[9px] uppercase tracking-[0.23em] text-[#47775f] font-semibold">
                                        Choose a plan
                                    </p>

                                </div>

                                <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-[-0.04em]">
                                    Pick your membership.
                                </h2>

                                <p className="mt-3 max-w-2xl text-sm text-[#687169] leading-relaxed">
                                    Both plans include access to the monthly
                                    draw, score tracking and charity
                                    participation.
                                </p>

                            </div>

                            <div className="hidden sm:block text-xs text-[#8a918b]">
                                Secure payment · Razorpay
                            </div>

                        </div>


                        <div className="grid md:grid-cols-2 gap-5">

                            {plans.map((item, index) => {

                                const isSelected =
                                    plan === item.id;

                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setPlan(item.id)}
                                        className={`
                                            group relative text-left rounded-[1.75rem]
                                            border p-7 sm:p-8 min-h-[360px]
                                            transition-all duration-300
                                            hover:-translate-y-1
                                            ${
                                                isSelected
                                                    ? "bg-[#103523] border-[#103523] text-white shadow-[0_20px_50px_rgba(13,33,23,0.14)]"
                                                    : "bg-white border-[#d9ddd4] hover:border-[#b9c4b8] hover:shadow-[0_18px_45px_rgba(16,24,19,0.06)]"
                                            }
                                        `}
                                    >

                                        {/* Top */}

                                        <div className="flex items-start justify-between">

                                            <div>

                                                <span
                                                    className={`
                                                        inline-flex items-center justify-center
                                                        w-9 h-9 rounded-xl text-[10px] font-bold
                                                        ${
                                                            isSelected
                                                                ? "bg-[#8ee276] text-[#103523]"
                                                                : "bg-[#eef1eb] text-[#47775f]"
                                                        }
                                                    `}
                                                >
                                                    0{index + 1}
                                                </span>

                                                <p
                                                    className={`
                                                        mt-5 text-[9px] uppercase tracking-[0.2em] font-semibold
                                                        ${
                                                            isSelected
                                                                ? "text-[#8ee276]"
                                                                : "text-[#47775f]"
                                                        }
                                                    `}
                                                >
                                                    {item.name} membership
                                                </p>

                                            </div>

                                            <span
                                                className={`
                                                    w-7 h-7 rounded-full border flex items-center justify-center
                                                    ${
                                                        isSelected
                                                            ? "border-[#8ee276] bg-[#8ee276]"
                                                            : "border-[#c9d0c6]"
                                                    }
                                                `}
                                            >
                                                {isSelected && (
                                                    <span className="text-[#103523] text-xs font-bold">
                                                        ✓
                                                    </span>
                                                )}
                                            </span>

                                        </div>


                                        {/* Price */}

                                        <div className="mt-12">

                                            <div className="flex items-end gap-2">

                                                <span className="text-5xl sm:text-6xl font-bold tracking-[-0.06em]">
                                                    ₹{item.price.toLocaleString("en-IN")}
                                                </span>

                                                <span
                                                    className={`
                                                        mb-2 text-sm
                                                        ${
                                                            isSelected
                                                                ? "text-white/40"
                                                                : "text-[#687169]"
                                                        }
                                                    `}
                                                >
                                                    / {item.period}
                                                </span>

                                            </div>

                                            <p
                                                className={`
                                                    mt-4 text-sm
                                                    ${
                                                        isSelected
                                                            ? "text-white/45"
                                                            : "text-[#687169]"
                                                    }
                                                `}
                                            >
                                                {item.description}
                                            </p>

                                        </div>


                                        {/* Benefits */}

                                        <div
                                            className={`
                                                absolute left-7 right-7 bottom-7
                                                pt-5 border-t
                                                ${
                                                    isSelected
                                                        ? "border-white/10"
                                                        : "border-[#e1e4de]"
                                                }
                                            `}
                                        >

                                            <div className="grid gap-2">

                                                <Benefit
                                                    text="Monthly draw participation"
                                                    selected={isSelected}
                                                />

                                                <Benefit
                                                    text="Charity contribution"
                                                    selected={isSelected}
                                                />

                                                <Benefit
                                                    text="Stableford score tracking"
                                                    selected={isSelected}
                                                />

                                            </div>

                                        </div>

                                    </button>
                                );
                            })}

                        </div>

                    </section>
                )}


                {/* =====================================================
                    ACTIVATE
                ====================================================== */}

                {!isActive && (
                    <section className="mt-8">

                        <div className="relative overflow-hidden rounded-[1.75rem] bg-[#0d2117] text-white">

                            <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-[#8ee276]/10 blur-3xl" />

                            <div className="relative p-6 sm:p-8">

                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-7">

                                    <div>

                                        <div className="flex items-center gap-2">

                                            <span className="w-6 h-[2px] bg-[#8ee276]" />

                                            <p className="text-[9px] uppercase tracking-[0.22em] text-[#8ee276] font-semibold">
                                                Ready to activate
                                            </p>

                                        </div>

                                        <h3 className="mt-3 text-2xl sm:text-3xl font-bold tracking-[-0.04em]">
                                            Join the draw.
                                        </h3>

                                        <p className="mt-2 text-sm text-white/40">
                                            Selected plan:{" "}
                                            <span className="text-white/80 font-semibold capitalize">
                                                {plan}
                                            </span>
                                            {" · "}
                                            ₹{selectedPlan?.price.toLocaleString("en-IN")}
                                        </p>

                                    </div>


                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                                        <p className="hidden sm:block text-[10px] uppercase tracking-[0.14em] text-white/30">
                                            Razorpay Test Mode
                                        </p>

                                        <button
                                            onClick={handleActivateSubscription}
                                            disabled={saving}
                                            className="
                                                group min-w-[220px]
                                                px-6 py-3.5 rounded-xl
                                                bg-[#8ee276] text-[#103523]
                                                text-sm font-bold
                                                shadow-[0_10px_30px_rgba(142,226,118,0.12)]
                                                hover:bg-[#a0ed89]
                                                hover:-translate-y-0.5
                                                transition-all
                                                disabled:opacity-50
                                                disabled:cursor-not-allowed
                                                disabled:hover:translate-y-0
                                            "
                                        >
                                            {saving ? (
                                                "Opening payment..."
                                            ) : (
                                                <>
                                                    Activate membership
                                                    <span className="ml-2 inline-block group-hover:translate-x-1 transition-transform">
                                                        →
                                                    </span>
                                                </>
                                            )}
                                        </button>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </section>
                )}


                {/* =====================================================
                    MESSAGES
                ====================================================== */}

                {error && (
                    <div className="mt-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">

                        <span className="w-8 h-8 shrink-0 rounded-full bg-red-100 flex items-center justify-center font-bold">
                            !
                        </span>

                        <span>{error}</span>

                    </div>
                )}

                {message && (
                    <div className="mt-6 flex items-center gap-3 rounded-2xl border border-[#b8cbbd] bg-[#e4eee6] px-5 py-4 text-sm text-[#38644f]">

                        <span className="w-8 h-8 shrink-0 rounded-full bg-[#d1e3d5] flex items-center justify-center font-bold">
                            ✓
                        </span>

                        <span>{message}</span>

                    </div>
                )}


                {/* =====================================================
                    BENEFITS
                ====================================================== */}

                <section className="mt-12">

                    <div className="flex items-center gap-2 mb-6">

                        <span className="w-6 h-[2px] bg-[#47775f]" />

                        <p className="text-[9px] uppercase tracking-[0.23em] text-[#47775f] font-semibold">
                            Membership benefits
                        </p>

                    </div>


                    <div className="grid md:grid-cols-3 gap-4">

                        <BenefitCard
                            number="01"
                            title="Play"
                            description="Track your latest Stableford scores and build your performance history."
                        />

                        <BenefitCard
                            number="02"
                            title="Participate"
                            description="Active members can participate in the monthly Digital Heroes draw."
                        />

                        <BenefitCard
                            number="03"
                            title="Give back"
                            description="Direct a chosen percentage of your winnings towards a charity you care about."
                        />

                    </div>

                </section>


                {/* =====================================================
                    BOTTOM CTA
                ====================================================== */}

                <section className="mt-12 mb-6 rounded-[1.75rem] bg-[#dfe7dc] border border-[#cbd6c9] p-7 sm:p-9">

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-7">

                        <div>

                            <p className="text-[9px] uppercase tracking-[0.2em] text-[#47775f] font-semibold">
                                Performance with purpose
                            </p>

                            <h3 className="mt-3 text-2xl sm:text-3xl font-bold tracking-[-0.04em] text-[#103523]">
                                Play better. Give more.
                            </h3>

                            <p className="mt-2 text-sm text-[#687169]">
                                Your membership connects performance,
                                opportunity and charitable impact.
                            </p>

                        </div>

                        {/* <div className="w-12 h-12 rounded-full bg-[#8ee276] text-[#103523] flex items-center justify-center text-lg font-bold">
                            →
                        </div> */}

                    </div>

                </section>

            </main>

        </div>
    );
}


/* =========================================================
   BENEFIT
========================================================= */

function Benefit({ text, selected }) {
    return (
        <div
            className={`
                flex items-center gap-2 text-xs
                ${
                    selected
                        ? "text-white/55"
                        : "text-[#687169]"
                }
            `}
        >
            <span
                className={`
                    w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold
                    ${
                        selected
                            ? "bg-[#8ee276] text-[#103523]"
                            : "bg-[#e5ebe2] text-[#47775f]"
                    }
                `}
            >
                ✓
            </span>

            {text}
        </div>
    );
}


/* =========================================================
   BENEFIT CARD
========================================================= */

function BenefitCard({
    number,
    title,
    description,
}) {
    return (
        <div className="group rounded-[1.5rem] bg-white border border-[#d9ddd4] p-7 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(16,24,19,0.06)] transition-all">

            <div className="flex items-center justify-between">

                <span className="w-9 h-9 rounded-xl bg-[#eef1eb] text-[#47775f] flex items-center justify-center text-[10px] font-bold">
                    {number}
                </span>

                <span className="text-[#47775f] group-hover:translate-x-1 transition-transform">
                    →
                </span>

            </div>

            <h3 className="mt-8 text-xl font-bold tracking-[-0.03em]">
                {title}
            </h3>

            <p className="mt-3 text-sm leading-6 text-[#687169]">
                {description}
            </p>

        </div>
    );
}

export default Subscription;