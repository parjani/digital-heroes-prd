import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

function DemoPayment() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const { plan = "monthly", amount = 499 } = location.state || {};

    const [paymentMethod, setPaymentMethod] = useState("upi");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const paymentMethods = [
        {
            id: "upi",
            name: "UPI",
            description: "Google Pay, PhonePe, Paytm",
            icon: "↗",
        },
        {
            id: "card",
            name: "Credit / Debit Card",
            description: "Visa, Mastercard, RuPay",
            icon: "▣",
        },
        {
            id: "netbanking",
            name: "Net Banking",
            description: "All major banks",
            icon: "⌂",
        },
        {
            id: "wallet",
            name: "Wallet",
            description: "Paytm, Amazon Pay and more",
            icon: "▱",
        },
    ];

    const handlePayment = async () => {
        if (!user) {
            setError("You must be logged in.");
            return;
        }

        setSaving(true);
        setError("");

        try {
            // Demo payment delay
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const now = new Date();
            const endDate = new Date(now);

            if (plan === "monthly") {
                endDate.setMonth(endDate.getMonth() + 1);
            } else {
                endDate.setFullYear(endDate.getFullYear() + 1);
            }

            const { error: paymentError } = await supabase
                .from("subscriptions")
                .insert({
                    user_id: user.id,
                    plan,
                    amount,
                    currency: "INR",
                    status: "active",
                    start_date: now.toISOString(),
                    renewal_date: endDate.toISOString(),
                    current_period_start: now.toISOString(),
                    current_period_end: endDate.toISOString(),
                    cancel_at_period_end: false,
                });

            if (paymentError) {
                throw paymentError;
            }

            navigate("/dashboard", {
                state: {
                    paymentSuccess: true,
                    message: `${plan === "monthly" ? "Monthly" : "Yearly"} subscription activated successfully.`,
                },
            });
        } catch (err) {
            console.error("Demo payment error:", err);
            setError(
                err.message || "Demo payment failed. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f3f1e8] text-[#101813]">
            <main className="max-w-6xl mx-auto px-6 lg:px-10 py-12">

                {/* Header */}
                <section className="border-b border-[#cfd4c8] pb-8">
                    <button
                        onClick={() => navigate("/dashboard/subscription")}
                        className="text-sm text-[#47775f] hover:underline"
                    >
                        ← Back to membership
                    </button>

                    <p className="mt-10 text-xs uppercase tracking-[0.2em] font-semibold text-[#47775f]">
                        § Demo Payment
                    </p>

                    <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-[-0.04em]">
                        Complete your payment.
                    </h1>

                    <p className="mt-4 text-[#687169]">
                        This is a demo payment screen. No real money will be
                        charged.
                    </p>
                </section>

                <div className="grid lg:grid-cols-[1fr_360px] gap-8 mt-10">

                    {/* Payment methods */}
                    <section>
                        <p className="text-xs uppercase tracking-[0.16em] text-[#8a918b]">
                            Payment method
                        </p>

                        <div className="mt-5 border border-[#cfd4c8]">
                            {paymentMethods.map((method) => {
                                const selected =
                                    paymentMethod === method.id;

                                return (
                                    <button
                                        key={method.id}
                                        type="button"
                                        onClick={() =>
                                            setPaymentMethod(method.id)
                                        }
                                        className={`w-full text-left p-5 border-b last:border-b-0 border-[#cfd4c8] transition ${
                                            selected
                                                ? "bg-[#dfe5da]"
                                                : "bg-[#f8f7f1] hover:bg-[#e7ebe3]"
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">

                                            <div
                                                className={`w-11 h-11 border flex items-center justify-center text-lg ${
                                                    selected
                                                        ? "border-[#47775f] bg-[#47775f] text-white"
                                                        : "border-[#cfd4c8]"
                                                }`}
                                            >
                                                {method.icon}
                                            </div>

                                            <div className="flex-1">
                                                <p className="font-semibold">
                                                    {method.name}
                                                </p>

                                                <p className="mt-1 text-sm text-[#687169]">
                                                    {method.description}
                                                </p>
                                            </div>

                                            <div
                                                className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                                    selected
                                                        ? "border-[#47775f]"
                                                        : "border-[#aeb5ac]"
                                                }`}
                                            >
                                                {selected && (
                                                    <div className="w-2.5 h-2.5 rounded-full bg-[#47775f]" />
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Demo details */}
                        <div className="mt-6 border border-[#cfd4c8] bg-[#f8f7f1] p-6">
                            <p className="text-xs uppercase tracking-[0.16em] text-[#8a918b]">
                                Demo mode
                            </p>

                            <p className="mt-3 text-sm text-[#687169] leading-6">
                                No real payment gateway is connected. Clicking
                                the payment button below will simulate a
                                successful payment and activate your
                                subscription.
                            </p>
                        </div>
                    </section>

                    {/* Order summary */}
                    <aside>
                        <div className="border border-[#cfd4c8] bg-[#f8f7f1] p-7 sticky top-6">

                            <p className="text-xs uppercase tracking-[0.16em] text-[#8a918b]">
                                Order summary
                            </p>

                            <div className="mt-7 pb-6 border-b border-[#cfd4c8]">
                                <p className="text-lg font-semibold capitalize">
                                    {plan} Membership
                                </p>

                                <p className="mt-2 text-sm text-[#687169]">
                                    Digital Heroes membership
                                </p>
                            </div>

                            <div className="py-6 border-b border-[#cfd4c8]">
                                <div className="flex justify-between text-sm">
                                    <span className="text-[#687169]">
                                        Membership
                                    </span>

                                    <span className="font-semibold">
                                        ₹{amount.toLocaleString("en-IN")}
                                    </span>
                                </div>

                                <div className="mt-3 flex justify-between text-sm">
                                    <span className="text-[#687169]">
                                        Payment method
                                    </span>

                                    <span className="font-semibold uppercase">
                                        {paymentMethod}
                                    </span>
                                </div>
                            </div>

                            <div className="py-6 flex justify-between">
                                <span className="font-semibold">
                                    Total
                                </span>

                                <span className="text-2xl font-semibold">
                                    ₹{amount.toLocaleString("en-IN")}
                                </span>
                            </div>

                            {error && (
                                <div className="mb-5 border border-red-200 bg-[#f8e9e5] px-4 py-3 text-sm text-red-700">
                                    {error}
                                </div>
                            )}

                            <button
                                onClick={handlePayment}
                                disabled={saving}
                                className="w-full px-6 py-4 bg-[#47775f] text-white text-sm font-semibold hover:bg-[#38644f] disabled:opacity-50 transition"
                            >
                                {saving
                                    ? "Processing payment..."
                                    : `Pay ₹${amount.toLocaleString("en-IN")} →`}
                            </button>

                            <p className="mt-4 text-center text-xs text-[#8a918b]">
                                Demo payment · No real money charged
                            </p>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}

export default DemoPayment;