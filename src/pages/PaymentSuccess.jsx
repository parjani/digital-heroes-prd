import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function PaymentSuccess() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [status, setStatus] = useState("verifying");
    const [message, setMessage] = useState(
        "Please wait while we verify your payment..."
    );

    useEffect(() => {
        verifyPayment();
    }, []);

    const verifyPayment = async () => {
        try {
            const razorpay_payment_id =
                searchParams.get("razorpay_payment_id");

            const razorpay_payment_link_id =
                searchParams.get("razorpay_payment_link_id");

            const razorpay_payment_link_reference_id =
                searchParams.get(
                    "razorpay_payment_link_reference_id"
                );

            const razorpay_payment_link_status =
                searchParams.get(
                    "razorpay_payment_link_status"
                );

            const razorpay_signature =
                searchParams.get(
                    "razorpay_signature"
                );

            if (
                !razorpay_payment_id ||
                !razorpay_payment_link_id ||
                !razorpay_signature
            ) {
                setStatus("error");

                setMessage(
                    "Payment verification information is missing. We could not verify your payment."
                );

                return;
            }

            const {
                data,
                error,
            } = await supabase.functions.invoke(
                "verify-razorpay-payment",
                {
                    body: {
                        razorpay_payment_id,
                        razorpay_payment_link_id,
                        razorpay_payment_link_reference_id,
                        razorpay_payment_link_status,
                        razorpay_signature,
                    },
                }
            );

            if (error) {
                console.error(
                    "Verification function error:",
                    error
                );

                throw new Error(
                    error.message ||
                        "Unable to verify payment."
                );
            }

            if (!data?.success) {
                throw new Error(
                    data?.error ||
                        "Payment verification failed."
                );
            }

            console.log(
                "Payment verified successfully:",
                data
            );

            setStatus("success");

            setMessage(
                data.alreadyActive
                    ? "Your subscription is already active."
                    : "Your payment has been verified and your membership is now active."
            );
        } catch (error) {
            console.error(
                "Payment verification error:",
                error
            );

            setStatus("error");

            setMessage(
                error?.message ||
                    "We could not verify your payment."
            );
        }
    };

    return (
        <div className="min-h-screen bg-[#0d2117] text-white relative overflow-hidden">

            {/* =====================================================
                BACKGROUND
            ====================================================== */}
            <div className="absolute inset-0 pointer-events-none">

                <div className="absolute -top-40 -right-32 w-[520px] h-[520px] rounded-full bg-[#8ee276]/10 blur-3xl" />

                <div className="absolute -bottom-48 -left-32 w-[500px] h-[500px] rounded-full bg-[#47775f]/20 blur-3xl" />

                <div className="absolute inset-0 opacity-[0.025]">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage:
                                "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
                            backgroundSize: "64px 64px",
                        }}
                    />
                </div>

            </div>

            {/* =====================================================
                PAGE
            ====================================================== */}
            <div className="relative min-h-screen flex flex-col">

                {/* Header */}
                <header className="px-5 sm:px-8 lg:px-10 pt-6">

                    <div className="max-w-7xl mx-auto flex items-center justify-between">

                        <button
                            type="button"
                            onClick={() => navigate("/")}
                            className="flex items-center gap-3 group"
                        >

                            <div className="w-11 h-11 rounded-full bg-[#8ee276] text-[#103523] flex items-center justify-center font-black italic tracking-[-0.08em] text-sm shadow-[0_8px_25px_rgba(142,226,118,0.15)] group-hover:scale-105 transition-transform">
                                DH
                            </div>

                            <div className="text-left leading-none">
                                <div className="text-lg font-bold tracking-[-0.03em]">
                                    digital.
                                </div>

                                <div className="mt-1 text-[9px] uppercase tracking-[0.24em] text-[#8ee276] font-semibold">
                                    Heroes
                                </div>
                            </div>

                        </button>

                        <div className="hidden sm:flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-white/35">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#8ee276]" />
                            Secure payment
                        </div>

                    </div>

                </header>

                {/* Main */}
                <main className="flex-1 flex items-center justify-center px-5 sm:px-8 py-14 md:py-20">

                    <div className="w-full max-w-2xl">

                        {/* =================================================
                            VERIFYING
                        ================================================== */}
                        {status === "verifying" && (
                            <div className="text-center">

                                <StatusIcon type="loading" />

                                <div className="mt-8">

                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] border border-white/10">

                                        <span className="w-1.5 h-1.5 rounded-full bg-[#8ee276] animate-pulse" />

                                        <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#8ee276]">
                                            Verifying payment
                                        </span>

                                    </div>

                                </div>

                                <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-bold tracking-[-0.055em] leading-[0.95]">
                                    One moment.
                                </h1>

                                <p className="mt-6 max-w-lg mx-auto text-sm md:text-base leading-7 text-white/45">
                                    {message}
                                </p>

                                <div className="mt-10 mx-auto max-w-md rounded-2xl border border-white/10 bg-white/[0.05] p-5">

                                    <div className="flex items-center gap-4">

                                        <div className="w-10 h-10 rounded-xl bg-[#8ee276]/10 flex items-center justify-center text-[#8ee276]">
                                            ₹
                                        </div>

                                        <div className="text-left">

                                            <p className="text-sm font-semibold text-white/80">
                                                Securing your membership
                                            </p>

                                            <p className="mt-1 text-xs text-white/35">
                                                Razorpay payment verification in progress
                                            </p>

                                        </div>

                                    </div>

                                    <div className="mt-5 h-1 rounded-full bg-white/10 overflow-hidden">
                                        <div className="h-full w-1/2 bg-[#8ee276] rounded-full animate-pulse" />
                                    </div>

                                </div>

                            </div>
                        )}

                        {/* =================================================
                            SUCCESS
                        ================================================== */}
                        {status === "success" && (
                            <div className="text-center">

                                <StatusIcon type="success" />

                                <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#8ee276]/10 border border-[#8ee276]/20">

                                    <span className="w-1.5 h-1.5 rounded-full bg-[#8ee276]" />

                                    <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#8ee276]">
                                        Payment verified
                                    </span>

                                </div>

                                <h1 className="mt-6 text-5xl sm:text-6xl md:text-7xl font-bold tracking-[-0.06em] leading-[0.9]">
                                    You're in.
                                </h1>

                                <p className="mt-6 max-w-xl mx-auto text-sm md:text-base leading-7 text-white/50">
                                    {message}
                                </p>

                                {/* Success card */}
                                <div className="mt-10 rounded-[1.75rem] border border-white/10 bg-white/[0.06] backdrop-blur-xl text-left overflow-hidden">

                                    <div className="p-6 sm:p-8">

                                        <div className="flex items-center gap-4">

                                            <div className="w-12 h-12 rounded-2xl bg-[#8ee276] text-[#103523] flex items-center justify-center text-xl font-bold">
                                                ✓
                                            </div>

                                            <div>
                                                <p className="text-sm font-bold text-white">
                                                    Digital Heroes membership
                                                </p>

                                                <p className="mt-1 text-xs text-white/35">
                                                    Payment successfully verified
                                                </p>
                                            </div>

                                        </div>

                                    </div>

                                    <div className="grid sm:grid-cols-2 border-t border-white/10">

                                        <div className="p-6 sm:p-7">

                                            <p className="text-[9px] uppercase tracking-[0.18em] text-white/30 font-semibold">
                                                Payment
                                            </p>

                                            <p className="mt-2 text-sm font-semibold text-[#8ee276]">
                                                Verified
                                            </p>

                                        </div>

                                        <div className="border-t sm:border-t-0 sm:border-l border-white/10 p-6 sm:p-7">

                                            <p className="text-[9px] uppercase tracking-[0.18em] text-white/30 font-semibold">
                                                Membership
                                            </p>

                                            <p className="mt-2 text-sm font-semibold text-[#8ee276]">
                                                Active
                                            </p>

                                        </div>

                                    </div>

                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate("/dashboard")
                                    }
                                    className="group mt-8 w-full flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-[#8ee276] text-[#103523] text-sm font-bold shadow-[0_10px_30px_rgba(142,226,118,0.15)] hover:bg-[#a0ed89] hover:-translate-y-0.5 transition-all"
                                >
                                    Go to Dashboard
                                    <span className="group-hover:translate-x-1 transition-transform">
                                        →
                                    </span>
                                </button>

                                <p className="mt-5 text-[10px] uppercase tracking-[0.15em] text-white/20">
                                    Play better · Give more · Make an impact
                                </p>

                            </div>
                        )}

                        {/* =================================================
                            ERROR
                        ================================================== */}
                        {status === "error" && (
                            <div className="text-center">

                                <StatusIcon type="error" />

                                <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-400/10 border border-red-400/20">

                                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />

                                    <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-red-300">
                                        Verification failed
                                    </span>

                                </div>

                                <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-bold tracking-[-0.055em] leading-[0.92]">
                                    Payment needs
                                    <span className="block text-[#8ee276]">
                                        review.
                                    </span>
                                </h1>

                                <p className="mt-6 max-w-xl mx-auto text-sm md:text-base leading-7 text-white/45">
                                    {message}
                                </p>

                                {/* Error card */}
                                <div className="mt-9 rounded-[1.5rem] border border-red-300/10 bg-red-400/[0.05] p-6 sm:p-7 text-left">

                                    <div className="flex items-start gap-4">

                                        <div className="shrink-0 w-10 h-10 rounded-xl bg-red-400/10 text-red-300 flex items-center justify-center font-bold">
                                            !
                                        </div>

                                        <div>

                                            <p className="text-sm font-semibold text-white/80">
                                                We couldn't confirm the payment
                                            </p>

                                            <p className="mt-2 text-xs leading-6 text-white/35">
                                                Your payment information could
                                                not be verified automatically.
                                                Please return to your subscription
                                                page and check your membership
                                                status before trying again.
                                            </p>

                                        </div>

                                    </div>

                                </div>

                                <div className="mt-8 flex flex-col sm:flex-row gap-3">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate(
                                                "/dashboard/subscription"
                                            )
                                        }
                                        className="group flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-[#8ee276] text-[#103523] text-sm font-bold hover:bg-[#a0ed89] transition-all"
                                    >
                                        Subscription
                                        <span className="group-hover:translate-x-1 transition-transform">
                                            →
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate("/dashboard")
                                        }
                                        className="flex-1 px-6 py-4 rounded-full border border-white/10 bg-white/[0.05] text-white/70 text-sm font-semibold hover:bg-white/10 hover:text-white transition-all"
                                    >
                                        Dashboard
                                    </button>

                                </div>

                            </div>
                        )}

                    </div>

                </main>

                {/* Footer */}
                <footer className="px-5 sm:px-8 lg:px-10 pb-6">

                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 pt-5 border-t border-white/10">

                        <p className="text-[9px] uppercase tracking-[0.16em] text-white/20">
                            Digital Heroes
                        </p>

                        <p className="text-[9px] uppercase tracking-[0.16em] text-white/20">
                            Secure payment · Razorpay Test Mode
                        </p>

                    </div>

                </footer>

            </div>
        </div>
    );
}


/* ============================================================
   STATUS ICON
============================================================ */

function StatusIcon({ type }) {
    if (type === "loading") {
        return (
            <div className="mx-auto w-20 h-20 rounded-[1.75rem] bg-white/[0.06] border border-white/10 flex items-center justify-center">

                <div className="w-9 h-9 rounded-full border-2 border-white/15 border-t-[#8ee276] animate-spin" />

            </div>
        );
    }

    if (type === "success") {
        return (
            <div className="mx-auto w-20 h-20 rounded-[1.75rem] bg-[#8ee276] text-[#103523] flex items-center justify-center shadow-[0_15px_45px_rgba(142,226,118,0.18)]">

                <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M5 12.5l4 4L19 7" />
                </svg>

            </div>
        );
    }

    return (
        <div className="mx-auto w-20 h-20 rounded-[1.75rem] bg-red-400/10 border border-red-400/20 text-red-300 flex items-center justify-center">

            <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
                <path d="M10.3 3.8L2.7 17a2 2 0 001.7 3h15.2a2 2 0 001.7-3L13.7 3.8a2 2 0 00-3.4 0z" />
            </svg>

        </div>
    );
}

export default PaymentSuccess;