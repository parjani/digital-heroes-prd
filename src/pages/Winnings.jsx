import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

export default function Winnings() {
    const { user } = useAuth();

    const [winnings, setWinnings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(null);

    useEffect(() => {
        if (user) {
            fetchWinnings();
        }
    }, [user]);

    async function fetchWinnings() {
        setLoading(true);

        const { data, error } = await supabase
            .from("winners")
            .select(`
                *,
                draws (
                    draw_month,
                    draw_year,
                    winning_numbers
                )
            `)
            .eq("user_id", user.id)
            .order("created_at", {
                ascending: false,
            });

        if (error) {
            console.error("Winnings error:", error);
            setWinnings([]);
        } else {
            setWinnings(data || []);
        }

        setLoading(false);
    }

    function formatDrawDate(draw) {
        if (!draw?.draw_month || !draw?.draw_year) {
            return "Date unavailable";
        }

        const date = new Date(
            Number(draw.draw_year),
            Number(draw.draw_month) - 1,
            1
        );

        return date.toLocaleDateString("en-IN", {
            month: "long",
            year: "numeric",
        });
    }

    async function uploadProof(winnerId, file) {
        if (!file) {
            return;
        }

        const allowedTypes = [
            "image/png",
            "image/jpeg",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            alert("Please upload a PNG, JPG or WEBP image.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert("Maximum file size is 5MB.");
            return;
        }

        setUploading(winnerId);

        try {
            const extension = file.name.split(".").pop();

            const filePath =
                `${winnerId}/${Date.now()}-proof.${extension}`;

            const { error: uploadError } =
                await supabase.storage
                    .from("winner-proofs")
                    .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { error: updateError } =
                await supabase.rpc(
                    "upload_winner_proof",
                    {
                        p_winner_id: winnerId,
                        p_file_path: filePath,
                    }
                );

            if (updateError) {
                throw updateError;
            }

            alert("Proof uploaded successfully.");

            await fetchWinnings();
        } catch (error) {
            console.error("Proof upload error:", error);
            alert(error.message);
        } finally {
            setUploading(null);
        }
    }

    async function viewProof(filePath) {
        if (!filePath) {
            alert("No proof has been uploaded.");
            return;
        }

        const { data, error } =
            await supabase.storage
                .from("winner-proofs")
                .createSignedUrl(
                    filePath,
                    60 * 5
                );

        if (error) {
            console.error(
                "View proof error:",
                error
            );

            alert(error.message);
            return;
        }

        window.open(
            data.signedUrl,
            "_blank",
            "noopener,noreferrer"
        );
    }

    const totalPrize = winnings.reduce(
        (total, winner) =>
            total + Number(winner.prize_amount || 0),
        0
    );

    const verifiedCount = winnings.filter(
        (winner) =>
            String(winner.verification_status).toLowerCase() ===
            "verified"
    ).length;

    const paidCount = winnings.filter(
        (winner) =>
            String(winner.payment_status).toLowerCase() ===
            "paid"
    ).length;

    return (
        <div className="min-h-screen bg-[#f3f1e8] text-[#101813]">

            {/* =====================================================
                HERO
            ====================================================== */}
            <section className="relative overflow-hidden bg-[#0d2117] text-white">

                {/* Background decoration */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute -top-32 right-[-80px] w-[420px] h-[420px] rounded-full bg-[#8ee276]/10 blur-3xl" />

                    <div className="absolute bottom-[-180px] left-[20%] w-[380px] h-[380px] rounded-full bg-[#47775f]/20 blur-3xl" />

                    <div className="absolute inset-0 opacity-[0.035]">
                        <div
                            className="absolute inset-0"
                            style={{
                                backgroundImage:
                                    "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
                                backgroundSize: "60px 60px",
                            }}
                        />
                    </div>
                </div>

                <div className="relative max-w-7xl mx-auto px-5 sm:px-7 lg:px-10 py-14 md:py-20 lg:py-24">

                    <div className="grid lg:grid-cols-[1fr_360px] gap-12 lg:gap-20 items-end">

                        {/* Left */}
                        <div className="max-w-4xl">

                            <div className="flex items-center gap-3 mb-6">
                                <span className="w-8 h-[2px] bg-[#8ee276]" />

                                <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#8ee276]">
                                    Rewards · Winning history
                                </span>
                            </div>

                            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-[-0.06em] leading-[0.9]">
                                Your wins.
                                <span className="block text-[#8ee276]">
                                    Your reward.
                                </span>
                            </h1>

                            <p className="mt-7 max-w-2xl text-sm sm:text-base md:text-lg leading-7 text-white/55">
                                Review your winning entries, upload proof
                                and follow your verification and payment
                                status from one place.
                            </p>

                        </div>

                        {/* Hero summary */}
                        <div className="relative">

                            <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] backdrop-blur-xl p-6 sm:p-7">

                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                                        Total winnings
                                    </span>

                                    <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-[#8ee276] font-semibold">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#8ee276]" />
                                        Live
                                    </span>
                                </div>

                                <div className="mt-5">
                                    <span className="text-4xl sm:text-5xl font-bold tracking-[-0.05em] text-white">
                                        ₹{totalPrize.toLocaleString("en-IN")}
                                    </span>
                                </div>

                                <div className="mt-6 grid grid-cols-2 gap-3">

                                    <HeroMetric
                                        value={winnings.length}
                                        label="Winning entries"
                                    />

                                    <HeroMetric
                                        value={verifiedCount}
                                        label="Verified"
                                    />

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

                <div className="h-[3px] bg-[#8ee276]" />
            </section>

            {/* =====================================================
                QUICK STATS
            ====================================================== */}
            <section className="max-w-7xl mx-auto px-5 sm:px-7 lg:px-10 pt-8">

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

                    <StatCard
                        label="Winning entries"
                        value={winnings.length}
                        icon="✦"
                    />

                    <StatCard
                        label="Total prize"
                        value={`₹${totalPrize.toLocaleString("en-IN")}`}
                        icon="₹"
                    />

                    <StatCard
                        label="Verified"
                        value={verifiedCount}
                        icon="✓"
                    />

                    <StatCard
                        label="Paid"
                        value={paidCount}
                        icon="↗"
                    />

                </div>

            </section>

            {/* =====================================================
                WINNING HISTORY
            ====================================================== */}
            <section className="max-w-7xl mx-auto px-5 sm:px-7 lg:px-10 py-12 md:py-16">

                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">

                    <div>

                        <div className="flex items-center gap-2.5 mb-3">
                            <span className="w-6 h-[2px] bg-[#47775f]" />

                            <span className="text-[10px] uppercase tracking-[0.22em] font-bold text-[#47775f]">
                                Winning history
                            </span>
                        </div>

                        <h2 className="text-3xl md:text-4xl font-bold tracking-[-0.045em]">
                            Your qualifying entries.
                        </h2>

                    </div>

                    {winnings.length > 0 && (
                        <div className="text-xs text-[#687169]">
                            {winnings.length}{" "}
                            {winnings.length === 1
                                ? "winning entry"
                                : "winning entries"}
                        </div>
                    )}

                </div>

                {/* =================================================
                    LOADING
                ================================================== */}
                {loading ? (

                    <div className="rounded-[1.5rem] border border-[#cfd4c8] bg-[#f8f7f1] p-12 md:p-16 text-center">

                        <div className="mx-auto w-11 h-11 rounded-full border-2 border-[#cfd4c8] border-t-[#47775f] animate-spin" />

                        <p className="mt-5 text-sm font-medium text-[#687169]">
                            Loading your winnings...
                        </p>

                    </div>

                ) : winnings.length === 0 ? (

                    /* =================================================
                       EMPTY STATE
                    ================================================== */
                    <div className="relative overflow-hidden rounded-[1.75rem] bg-[#103523] text-white">

                        <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-[#8ee276]/10 blur-3xl" />

                        <div className="relative p-8 md:p-12 lg:p-14">

                            <div className="w-14 h-14 rounded-2xl bg-[#8ee276] text-[#103523] flex items-center justify-center text-2xl font-bold">
                                ✦
                            </div>

                            <p className="mt-8 text-[10px] uppercase tracking-[0.22em] font-bold text-[#8ee276]">
                                Waiting for your first win
                            </p>

                            <h3 className="mt-3 text-3xl md:text-4xl font-bold tracking-[-0.045em]">
                                No winnings yet.
                            </h3>

                            <p className="mt-4 max-w-xl text-sm md:text-base leading-7 text-white/50">
                                Keep participating in the monthly draws.
                                When you have a qualifying winning entry,
                                it will appear here with your prize and
                                verification details.
                            </p>

                            <div className="mt-8 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 border border-white/10 text-sm font-semibold text-white/80">
                                Keep playing · Keep giving
                            </div>

                        </div>

                    </div>

                ) : (

                    /* =================================================
                       WINNINGS LIST
                    ================================================== */
                    <div className="space-y-6">

                        {winnings.map((winner, index) => {

                            const matchCount =
                                Number(winner.match_count || 0);

                            const verificationStatus =
                                winner.verification_status ||
                                "pending";

                            const paymentStatus =
                                winner.payment_status ||
                                "pending";

                            const isVerified =
                                ["approved", "verified"].includes(
                                    String(verificationStatus).toLowerCase()
                                );

                            const isPaid =
                                String(
                                    paymentStatus
                                ).toLowerCase() === "paid";

                            return (
                                <article
                                    key={winner.id}
                                    className="group overflow-hidden rounded-[1.75rem] border border-[#cfd4c8] bg-[#f8f7f1] shadow-[0_12px_35px_rgba(16,24,19,0.035)]"
                                >

                                    {/* =================================
                                        TOP SECTION
                                    ================================== */}
                                    <div className="relative overflow-hidden bg-[#103523] text-white p-6 sm:p-8 md:p-9">

                                        <div className="absolute right-0 top-0 w-72 h-72 rounded-full bg-[#8ee276]/10 blur-3xl" />

                                        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

                                            <div className="flex items-start gap-5">

                                                <div className="hidden sm:flex shrink-0 w-12 h-12 rounded-2xl bg-white/10 border border-white/10 items-center justify-center text-sm font-bold text-[#8ee276]">
                                                    {String(
                                                        index + 1
                                                    ).padStart(2, "0")}
                                                </div>

                                                <div>

                                                    <div className="flex items-center gap-2">

                                                        <span className="w-1.5 h-1.5 rounded-full bg-[#8ee276]" />

                                                        <p className="text-[10px] uppercase tracking-[0.22em] font-bold text-[#8ee276]">
                                                            Monthly draw
                                                        </p>

                                                    </div>

                                                    <h2 className="mt-2 text-2xl sm:text-3xl md:text-4xl font-bold tracking-[-0.045em]">
                                                        {formatDrawDate(
                                                            winner.draws
                                                        )}
                                                    </h2>

                                                    <p className="mt-2 text-xs text-white/40">
                                                        Winning entry #{index + 1}
                                                    </p>

                                                </div>

                                            </div>

                                            {/* Match score */}
                                            <div className="lg:min-w-[190px]">

                                                <div className="flex items-center justify-between lg:justify-end gap-5">

                                                    <div className="text-left lg:text-right">

                                                        <p className="text-[9px] uppercase tracking-[0.18em] text-white/40">
                                                            Match result
                                                        </p>

                                                        <p className="mt-1 text-4xl font-bold tracking-[-0.05em] text-[#8ee276]">
                                                            {matchCount}/5
                                                        </p>

                                                    </div>

                                                    <div className="w-14 h-14 rounded-full border border-[#8ee276]/30 bg-[#8ee276]/10 flex items-center justify-center text-[#8ee276]">
                                                        <span className="text-xl">
                                                            ✓
                                                        </span>
                                                    </div>

                                                </div>

                                                <div className="mt-4 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-[#8ee276] transition-all"
                                                        style={{
                                                            width: `${Math.min(
                                                                matchCount * 20,
                                                                100
                                                            )}%`,
                                                        }}
                                                    />
                                                </div>

                                                <p className="mt-2 text-[10px] text-white/35 lg:text-right">
                                                    {matchCount === 1
                                                        ? "1 matching number"
                                                        : `${matchCount} matching numbers`}
                                                </p>

                                            </div>

                                        </div>

                                    </div>

                                    {/* =================================
                                        PRIZE / STATUS
                                    ================================== */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 border-b border-[#cfd4c8]">

                                        {/* Prize */}
                                        <div className="p-6 md:p-7">

                                            <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#8a918b]">
                                                Prize
                                            </p>

                                            <p className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[#103523]">
                                                ₹{Number(
                                                    winner.prize_amount || 0
                                                ).toLocaleString("en-IN")}
                                            </p>

                                            <p className="mt-1 text-xs text-[#687169]">
                                                Winning amount
                                            </p>

                                        </div>

                                        {/* Verification */}
                                        <div className="border-t md:border-t-0 md:border-l border-[#cfd4c8] p-6 md:p-7">

                                            <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#8a918b]">
                                                Verification
                                            </p>

                                            <StatusBadge
                                                value={verificationStatus}
                                                success={isVerified}
                                            />

                                            <p className="mt-2 text-xs text-[#687169]">
                                                {isVerified
                                                    ? "Your proof has been verified."
                                                    : "Proof review is pending."}
                                            </p>

                                        </div>

                                        {/* Payment */}
                                        <div className="border-t md:border-t-0 md:border-l border-[#cfd4c8] p-6 md:p-7">

                                            <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#8a918b]">
                                                Payment
                                            </p>

                                            <StatusBadge
                                                value={paymentStatus}
                                                success={isPaid}
                                            />

                                            <p className="mt-2 text-xs text-[#687169]">
                                                {isPaid
                                                    ? "Prize payment completed."
                                                    : "Payment will update after approval."}
                                            </p>

                                        </div>

                                    </div>

                                    {/* =================================
                                        PROOF SECTION
                                    ================================== */}
                                    <div className="p-6 sm:p-8 md:p-9">

                                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-7">

                                            <div className="max-w-xl">

                                                <div className="flex items-center gap-2">

                                                    <div className="w-8 h-8 rounded-xl bg-[#dfe7dc] text-[#47775f] flex items-center justify-center">
                                                        {winner.proof_url
                                                            ? "✓"
                                                            : "↑"}
                                                    </div>

                                                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#47775f]">
                                                        Proof of winning
                                                    </p>

                                                </div>

                                                <h3 className="mt-4 text-xl font-bold tracking-[-0.025em]">
                                                    {winner.proof_url
                                                        ? "Your proof has been submitted."
                                                        : "Submit your winning score proof."}
                                                </h3>

                                                <p className="mt-2 text-sm leading-6 text-[#687169]">
                                                    {winner.proof_url
                                                        ? "Your uploaded proof is available to view. The admin team can use it for verification."
                                                        : "Upload an image showing your winning score so the admin team can verify your entry."}
                                                </p>

                                                <p className="mt-3 text-[10px] uppercase tracking-[0.12em] text-[#9aa099]">
                                                    PNG · JPG · WEBP · Maximum 5MB
                                                </p>

                                            </div>

                                            {/* Actions */}
                                            {!winner.proof_url ? (

                                                <label
                                                    className={`shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-bold transition-all ${uploading === winner.id
                                                            ? "bg-[#cfd4c8] text-[#8a918b] cursor-not-allowed"
                                                            : "bg-[#8ee276] text-[#103523] hover:bg-[#a0ed89] hover:-translate-y-0.5 cursor-pointer shadow-[0_8px_25px_rgba(142,226,118,0.18)]"
                                                        }`}
                                                >
                                                    {uploading === winner.id
                                                        ? (
                                                            <>
                                                                <span className="w-4 h-4 rounded-full border-2 border-[#8a918b] border-t-transparent animate-spin" />
                                                                Uploading...
                                                            </>
                                                        )
                                                        : (
                                                            <>
                                                                Upload proof
                                                                <span>→</span>
                                                            </>
                                                        )}

                                                    <input
                                                        type="file"
                                                        accept="image/png,image/jpeg,image/webp"
                                                        disabled={
                                                            uploading ===
                                                            winner.id
                                                        }
                                                        onChange={(e) =>
                                                            uploadProof(
                                                                winner.id,
                                                                e.target.files?.[0]
                                                            )
                                                        }
                                                        className="hidden"
                                                    />
                                                </label>

                                            ) : (

                                                <div className="flex flex-wrap items-center gap-3">

                                                    <div className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-[#dfe7dc] text-[#47775f] text-sm font-semibold">
                                                        <span>✓</span>
                                                        Proof uploaded
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            viewProof(
                                                                winner.proof_url
                                                            )
                                                        }
                                                        className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#103523] text-white text-sm font-semibold hover:bg-[#0d2117] transition-all"
                                                    >
                                                        View proof
                                                        <span>↗</span>
                                                    </button>

                                                </div>

                                            )}

                                        </div>

                                    </div>

                                </article>
                            );
                        })}

                    </div>
                )}

            </section>

            {/* =====================================================
                STATUS GUIDE
            ====================================================== */}
            {winnings.length > 0 && (
                <section className="relative overflow-hidden bg-[#103523] text-white">

                    <div className="absolute -right-24 top-[-120px] w-96 h-96 rounded-full bg-[#8ee276]/10 blur-3xl" />

                    <div className="relative max-w-7xl mx-auto px-5 sm:px-7 lg:px-10 py-14 md:py-18">

                        <div className="grid lg:grid-cols-[260px_1fr] gap-10 lg:gap-16">

                            <div>

                                <div className="flex items-center gap-2.5">
                                    <span className="w-7 h-[2px] bg-[#8ee276]" />

                                    <span className="text-[10px] uppercase tracking-[0.22em] font-bold text-[#8ee276]">
                                        What happens next
                                    </span>
                                </div>

                                <h2 className="mt-5 text-3xl md:text-4xl font-bold tracking-[-0.045em]">
                                    From winning
                                    <span className="block text-[#8ee276]">
                                        to reward.
                                    </span>
                                </h2>

                                <p className="mt-4 text-sm leading-6 text-white/40">
                                    Follow the simple verification journey
                                    after a successful draw.
                                </p>

                            </div>

                            <div className="grid md:grid-cols-3 gap-3">

                                <GuideCard
                                    number="01"
                                    title="Submit proof"
                                    text="Upload your winning score evidence."
                                />

                                <GuideCard
                                    number="02"
                                    title="Verification"
                                    text="The admin team reviews your proof."
                                />

                                <GuideCard
                                    number="03"
                                    title="Payment"
                                    text="Once approved, your payment status is updated."
                                />

                            </div>

                        </div>

                    </div>

                </section>
            )}

        </div>
    );
}


/* ============================================================
   SMALL COMPONENTS
============================================================ */

function HeroMetric({ value, label }) {
    return (
        <div className="rounded-2xl bg-white/[0.06] border border-white/10 p-4">
            <p className="text-2xl font-bold tracking-[-0.04em] text-white">
                {value}
            </p>

            <p className="mt-1 text-[9px] uppercase tracking-[0.14em] text-white/35">
                {label}
            </p>
        </div>
    );
}


function StatCard({ label, value, icon }) {
    return (
        <div className="group rounded-2xl border border-[#cfd4c8] bg-[#f8f7f1] p-5 sm:p-6 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(16,24,19,0.05)] transition-all">

            <div className="flex items-start justify-between gap-4">

                <div>
                    <p className="text-[9px] uppercase tracking-[0.18em] font-bold text-[#8a918b]">
                        {label}
                    </p>

                    <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-[-0.04em] text-[#103523]">
                        {value}
                    </p>
                </div>

                <div className="w-9 h-9 rounded-xl bg-[#dfe7dc] text-[#47775f] flex items-center justify-center text-sm font-bold group-hover:bg-[#8ee276] group-hover:text-[#103523] transition-colors">
                    {icon}
                </div>

            </div>

        </div>
    );
}


function StatusBadge({ value, success }) {
    const formatted =
        String(value)
            .replace(/_/g, " ")
            .replace(/\b\w/g, (letter) =>
                letter.toUpperCase()
            );

    return (
        <div
            className={`inline-flex items-center gap-2 mt-3 px-3.5 py-2 rounded-full text-xs font-bold ${success
                    ? "bg-[#dfe7dc] text-[#47775f]"
                    : "bg-[#ece9dc] text-[#746f5f]"
                }`}
        >
            <span
                className={`w-1.5 h-1.5 rounded-full ${success
                        ? "bg-[#47775f]"
                        : "bg-[#a69f83]"
                    }`}
            />

            {formatted}
        </div>
    );
}


function GuideCard({ number, title, text }) {
    return (
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-6 hover:bg-white/[0.07] transition-colors">

            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8ee276]">
                {number}
            </span>

            <h3 className="mt-5 text-lg font-bold text-white">
                {title}
            </h3>

            <p className="mt-2 text-sm leading-6 text-white/40">
                {text}
            </p>

        </div>
    );
}