import { useNavigate } from "react-router-dom";

function PaymentSuccess() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#f3f1e8] text-[#101813] flex items-center justify-center px-6">
            <div className="w-full max-w-xl">
                <div className="border border-[#cfd4c8] bg-[#f8f7f1] p-8 md:p-12 text-center">

                    <div className="mx-auto w-16 h-16 border border-[#47775f] bg-[#dfe5da] flex items-center justify-center">
                        <span className="text-3xl text-[#47775f]">
                            ✓
                        </span>
                    </div>

                    <p className="mt-8 text-xs uppercase tracking-[0.2em] font-semibold text-[#47775f]">
                        § Payment successful
                    </p>

                    <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-[-0.04em]">
                        Thank you.
                    </h1>

                    <p className="mt-5 text-[#687169] leading-7">
                        Your payment has been received successfully.
                        Your Digital Heroes membership is being
                        activated.
                    </p>

                    <div className="mt-8 border-t border-[#cfd4c8] pt-6 text-sm text-[#687169]">
                        Payment confirmation has been received from
                        Razorpay.
                    </div>

                    <button
                        onClick={() =>
                            navigate("/dashboard")
                        }
                        className="mt-8 w-full px-6 py-4 bg-[#47775f] text-white text-sm font-semibold hover:bg-[#38644f] transition"
                    >
                        Go to Dashboard →
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PaymentSuccess;