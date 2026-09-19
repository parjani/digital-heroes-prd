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
            /*
             * Get Razorpay callback parameters
             * from the URL.
             */
            const razorpay_payment_id =
                searchParams.get(
                    "razorpay_payment_id"
                );

            const razorpay_payment_link_id =
                searchParams.get(
                    "razorpay_payment_link_id"
                );

            const razorpay_payment_link_reference_id =
                searchParams.get(
                    "razorpay_payment_link_reference_id"
                );

            const razorpay_payment_link_status =
                searchParams.get(
                    "razorpay_payment_link_status"
                );

            if (
                !razorpay_payment_id ||
                !razorpay_payment_link_id
            ) {
                setStatus("error");

                setMessage(
                    "Payment information is missing. We could not verify your payment."
                );

                return;
            }

            /*
             * Call Supabase Edge Function.
             */
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

            /*
             * Payment successfully verified
             * and subscription activated.
             */
            console.log(
                "Payment verified:",
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
        <div className="min-h-screen bg-[#f3f1e8] text-[#101813] flex items-center justify-center px-6">
            <div className="w-full max-w-xl">
                <div className="border border-[#cfd4c8] bg-[#f8f7f1] p-8 md:p-12 text-center">

                    {status === "verifying" && (
                        <>
                            <div className="mx-auto w-16 h-16 border border-[#47775f] bg-[#dfe5da] flex items-center justify-center">
                                <span className="text-2xl text-[#47775f] animate-pulse">
                                    ...
                                </span>
                            </div>

                            <p className="mt-8 text-xs uppercase tracking-[0.2em] font-semibold text-[#47775f]">
                                § Verifying payment
                            </p>

                            <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-[-0.04em]">
                                Please wait.
                            </h1>

                            <p className="mt-5 text-[#687169] leading-7">
                                {message}
                            </p>
                        </>
                    )}

                    {status === "success" && (
                        <>
                            <div className="mx-auto w-16 h-16 border border-[#47775f] bg-[#dfe5da] flex items-center justify-center">
                                <span className="text-3xl text-[#47775f]">
                                    ✓
                                </span>
                            </div>

                            <p className="mt-8 text-xs uppercase tracking-[0.2em] font-semibold text-[#47775f]">
                                § Payment verified
                            </p>

                            <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-[-0.04em]">
                                Thank you.
                            </h1>

                            <p className="mt-5 text-[#687169] leading-7">
                                {message}
                            </p>

                            <div className="mt-8 border-t border-[#cfd4c8] pt-6 text-sm text-[#687169]">
                                Razorpay payment verified successfully.
                                Your Digital Heroes subscription is active.
                            </div>

                            <button
                                onClick={() =>
                                    navigate("/dashboard")
                                }
                                className="mt-8 w-full px-6 py-4 bg-[#47775f] text-white text-sm font-semibold hover:bg-[#38644f] transition"
                            >
                                Go to Dashboard →
                            </button>
                        </>
                    )}

                    {status === "error" && (
                        <>
                            <div className="mx-auto w-16 h-16 border border-red-300 bg-red-50 flex items-center justify-center">
                                <span className="text-3xl text-red-500">
                                    !
                                </span>
                            </div>

                            <p className="mt-8 text-xs uppercase tracking-[0.2em] font-semibold text-red-500">
                                § Verification failed
                            </p>

                            <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-[-0.04em]">
                                Payment needs review.
                            </h1>

                            <p className="mt-5 text-[#687169] leading-7">
                                {message}
                            </p>

                            <div className="mt-8 flex flex-col gap-3">
                                <button
                                    onClick={() =>
                                        navigate(
                                            "/dashboard/subscription"
                                        )
                                    }
                                    className="w-full px-6 py-4 bg-[#47775f] text-white text-sm font-semibold hover:bg-[#38644f] transition"
                                >
                                    Return to Subscription →
                                </button>

                                <button
                                    onClick={() =>
                                        navigate(
                                            "/dashboard"
                                        )
                                    }
                                    className="w-full px-6 py-4 border border-[#cfd4c8] text-[#101813] text-sm font-semibold hover:bg-[#e7ebe3] transition"
                                >
                                    Go to Dashboard
                                </button>
                            </div>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
}

export default PaymentSuccess;