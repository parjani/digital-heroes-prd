import { useNavigate } from "react-router-dom";

function PaymentFailure() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#f3f1e8] text-[#101813] flex items-center justify-center px-6">
            <div className="w-full max-w-xl">
                <div className="border border-[#cfd4c8] bg-[#f8f7f1] p-8 md:p-12 text-center">

                    <div className="mx-auto w-16 h-16 border border-[#b86b5c] bg-[#f8e9e5] flex items-center justify-center">
                        <span className="text-3xl text-[#b86b5c]">
                            ×
                        </span>
                    </div>

                    <p className="mt-8 text-xs uppercase tracking-[0.2em] font-semibold text-[#b86b5c]">
                        § Payment failed
                    </p>

                    <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-[-0.04em]">
                        Payment not completed.
                    </h1>

                    <p className="mt-5 text-[#687169] leading-7">
                        Your payment could not be completed.
                        No subscription has been activated.
                    </p>

                    <div className="mt-8 border-t border-[#cfd4c8] pt-6 text-sm text-[#687169]">
                        You can return to the subscription page
                        and try again.
                    </div>

                    <div className="mt-8 grid sm:grid-cols-2 gap-3">
                        <button
                            onClick={() =>
                                navigate(
                                    "/dashboard/subscription"
                                )
                            }
                            className="w-full px-6 py-4 bg-[#47775f] text-white text-sm font-semibold hover:bg-[#38644f] transition"
                        >
                            Try Again →
                        </button>

                        <button
                            onClick={() =>
                                navigate("/dashboard")
                            }
                            className="w-full px-6 py-4 border border-[#cfd4c8] text-sm font-semibold hover:bg-[#e7ebe3] transition"
                        >
                            Dashboard
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PaymentFailure;