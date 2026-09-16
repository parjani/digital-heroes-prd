import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AdminWinners() {
    const [winners, setWinners] = useState([]);
    const [profiles, setProfiles] = useState({});
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null);

    useEffect(() => {
        fetchWinners();
    }, []);

    async function fetchWinners() {
        setLoading(true);

        const { data, error } = await supabase
            .from("winners")
            .select(`
                *,
                draws (
                    draw_month,
                    draw_year,
                    draw_type,
                    winning_numbers
                )
            `)
            .order("created_at", {
                ascending: false,
            });

        if (error) {
            console.error("Fetch winners error:", error);
            alert(error.message);
            setLoading(false);
            return;
        }

        setWinners(data || []);

        const userIds = [
            ...new Set(
                (data || []).map((winner) => winner.user_id)
            ),
        ];

        if (userIds.length > 0) {
            const {
                data: profileData,
                error: profileError,
            } = await supabase
                .from("profiles")
                .select("id, full_name, email")
                .in("id", userIds);

            if (profileError) {
                console.error(
                    "Profile fetch error:",
                    profileError
                );
            } else {
                const profileMap = {};

                profileData.forEach((profile) => {
                    profileMap[profile.id] = profile;
                });

                setProfiles(profileMap);
            }
        } else {
            setProfiles({});
        }

        setLoading(false);
    }

    // --------------------------------------------------
    // FORMAT DRAW MONTH
    // --------------------------------------------------

    function formatDrawMonth(draw) {
        if (!draw?.draw_month || !draw?.draw_year) {
            return "Unknown";
        }

        return new Date(
            draw.draw_year,
            draw.draw_month - 1
        ).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
        });
    }

    // --------------------------------------------------
    // VIEW WINNER PROOF
    // --------------------------------------------------

    async function viewProof(filePath) {
        if (!filePath) {
            return;
        }

        const { data, error } = await supabase.storage
            .from("winner-proofs")
            .createSignedUrl(filePath, 60 * 5);

        if (error) {
            console.error(error);
            alert(error.message);
            return;
        }

        window.open(
            data.signedUrl,
            "_blank",
            "noopener,noreferrer"
        );
    }

    // --------------------------------------------------
    // APPROVE / REJECT
    // --------------------------------------------------

    async function updateVerification(winnerId, status) {
        setProcessing(winnerId);

        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                throw new Error(
                    "You must be logged in as an admin."
                );
            }

            const updateData = {
                verification_status: status,
            };

            if (status === "approved") {
                updateData.verified_at =
                    new Date().toISOString();

                updateData.verified_by = user.id;
            }

            if (status === "rejected") {
                updateData.verified_at = null;
                updateData.verified_by = null;
            }

            const { error } = await supabase
                .from("winners")
                .update(updateData)
                .eq("id", winnerId);

            if (error) {
                throw error;
            }

            await fetchWinners();
        } catch (error) {
            console.error(
                "Verification update error:",
                error
            );

            alert(error.message);
        } finally {
            setProcessing(null);
        }
    }

    // --------------------------------------------------
    // MARK AS PAID
    // --------------------------------------------------

    async function markAsPaid(winner) {
        if (winner.verification_status !== "approved") {
            alert(
                "Winner must be approved before payment."
            );
            return;
        }

        if (winner.payment_status === "paid") {
            return;
        }

        const confirmed = window.confirm(
            "Mark this winner as paid?"
        );

        if (!confirmed) {
            return;
        }

        setProcessing(winner.id);

        try {
            const { error } = await supabase
                .from("winners")
                .update({
                    payment_status: "paid",
                })
                .eq("id", winner.id);

            if (error) {
                throw error;
            }

            await fetchWinners();
        } catch (error) {
            console.error(
                "Payment update error:",
                error
            );

            alert(error.message);
        } finally {
            setProcessing(null);
        }
    }

    // --------------------------------------------------
    // UI
    // --------------------------------------------------

  return (
    <div className="min-h-screen bg-[#f3f1e8] text-[#101813]">

   
        <main>

            {/* Hero */}
            <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16 md:py-24 border-b border-[#cfd4c8]">

                <div className="grid lg:grid-cols-[1fr_300px] gap-12 lg:gap-20 items-end">

                    <div className="max-w-4xl">

                        <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#47775f]">
                            § 01 · Winner verification
                        </p>

                        <h1 className="mt-6 text-5xl md:text-7xl font-semibold tracking-[-0.05em] leading-[0.92]">
                            Review winners.
                            <span className="block text-[#47775f]">
                                Verify. Approve. Pay.
                            </span>
                        </h1>

                        <p className="mt-8 text-[#687169] text-base md:text-lg leading-7 max-w-2xl">
                            Review qualifying winners, inspect submitted
                            proof and move verified winnings through the
                            payout process.
                        </p>

                    </div>

                    <div className="border-l border-[#cfd4c8] pl-6">

                        <p className="text-xs uppercase tracking-[0.16em] text-[#8a918b]">
                            Winner records
                        </p>

                        <p className="mt-3 text-5xl font-semibold tracking-[-0.04em] text-[#47775f]">
                            {loading ? "—" : winners.length}
                        </p>

                        <p className="mt-3 text-sm leading-6 text-[#687169]">
                            Qualifying winners currently awaiting
                            verification or payout.
                        </p>

                    </div>

                </div>

            </section>

            {/* Winner List */}
            <section className="max-w-7xl mx-auto px-6 lg:px-10 py-14 md:py-20">

                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-10">

                    <div>

                        <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#47775f]">
                            § 02 · Winner records
                        </p>

                        <h2 className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight">
                            Verification queue.
                        </h2>

                    </div>

                    <p className="text-sm text-[#8a918b]">
                        {winners.length}{" "}
                        {winners.length === 1 ? "winner" : "winners"}
                    </p>

                </div>

                {loading ? (

                    <div className="border border-[#cfd4c8] bg-[#f8f7f1] px-6 py-16 text-center">

                        <p className="text-sm text-[#687169]">
                            Loading winners...
                        </p>

                    </div>

                ) : winners.length === 0 ? (

                    <div className="border border-[#cfd4c8] bg-[#f8f7f1] px-6 py-16 text-center">

                        <p className="text-xs uppercase tracking-[0.16em] text-[#8a918b]">
                            Queue empty
                        </p>

                        <h2 className="mt-3 text-xl font-semibold">
                            No winners yet
                        </h2>

                        <p className="text-sm text-[#687169] mt-2">
                            Winners will appear here after a draw
                            is processed.
                        </p>

                    </div>

                ) : (

                    <div className="space-y-px bg-[#cfd4c8] border border-[#cfd4c8]">

                        {winners.map((winner, index) => {

                            const profile =
                                profiles[winner.user_id];

                            const draw = winner.draws;

                            return (

                                <article
                                    key={winner.id}
                                    className="bg-[#f8f7f1] p-7 md:p-8 hover:bg-[#e7ebe3] transition"
                                >

                                    {/* Winner Header */}
                                    <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-8">

                                        <div className="flex gap-5">

                                            <span className="text-xs tracking-[0.16em] text-[#8a918b] pt-1">
                                                {String(index + 1).padStart(2, "0")}
                                            </span>

                                            <div>

                                                <p className="text-xs uppercase tracking-[0.16em] text-[#8a918b]">
                                                    Winner
                                                </p>

                                                <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                                                    {profile?.full_name ||
                                                        "Unknown user"}
                                                </h3>

                                                <p className="text-sm text-[#8a918b] mt-1">
                                                    {profile?.email ||
                                                        winner.user_id}
                                                </p>

                                                <p className="text-sm text-[#687169] mt-3">
                                                    Draw:{" "}
                                                    <span className="text-[#101813] font-medium">
                                                        {formatDrawMonth(draw)}
                                                    </span>
                                                </p>

                                            </div>

                                        </div>

                                        {/* Match + Prize */}
                                        <div className="flex flex-wrap gap-3">

                                            <div className="border border-[#cfd4c8] bg-[#e7ebe3] px-5 py-3">

                                                <p className="text-[10px] uppercase tracking-[0.14em] text-[#8a918b]">
                                                    Matches
                                                </p>

                                                <p className="mt-1 text-xl font-semibold text-[#47775f]">
                                                    {winner.match_count}
                                                    <span className="text-sm text-[#8a918b]">
                                                        /5
                                                    </span>
                                                </p>

                                            </div>

                                            <div className="border border-[#cfd4c8] bg-[#e7ebe3] px-5 py-3">

                                                <p className="text-[10px] uppercase tracking-[0.14em] text-[#8a918b]">
                                                    Prize
                                                </p>

                                                <p className="mt-1 text-xl font-semibold text-[#47775f]">
                                                    ₹
                                                    {Number(
                                                        winner.prize_amount || 0
                                                    ).toLocaleString("en-IN")}
                                                </p>

                                            </div>

                                        </div>

                                    </div>

                                    {/* Winning Numbers */}
                                    {draw?.winning_numbers?.length > 0 && (

                                        <div className="mt-8 pt-7 border-t border-[#cfd4c8]">

                                            <p className="text-xs uppercase tracking-[0.16em] text-[#8a918b] mb-4">
                                                Winning numbers
                                            </p>

                                            <div className="flex flex-wrap gap-2">

                                                {draw.winning_numbers.map(
                                                    (number) => (

                                                        <span
                                                            key={number}
                                                            className="w-10 h-10 border border-[#47775f] bg-[#dfe5da] text-[#47775f] flex items-center justify-center text-sm font-semibold"
                                                        >
                                                            {number}
                                                        </span>

                                                    )
                                                )}

                                            </div>

                                        </div>

                                    )}

                                    {/* Status */}
                                    <div className="grid md:grid-cols-3 gap-px bg-[#cfd4c8] border border-[#cfd4c8] mt-8">

                                        <div className="bg-[#f8f7f1] p-5">

                                            <p className="text-[10px] uppercase tracking-[0.14em] text-[#8a918b]">
                                                Verification
                                            </p>

                                            <p
                                                className={`mt-2 text-sm font-semibold capitalize ${
                                                    winner.verification_status ===
                                                    "approved"
                                                        ? "text-[#47775f]"
                                                        : winner.verification_status ===
                                                          "rejected"
                                                        ? "text-[#8a625d]"
                                                        : "text-[#856f36]"
                                                }`}
                                            >
                                                {winner.verification_status}
                                            </p>

                                        </div>

                                        <div className="bg-[#f8f7f1] p-5">

                                            <p className="text-[10px] uppercase tracking-[0.14em] text-[#8a918b]">
                                                Payment
                                            </p>

                                            <p
                                                className={`mt-2 text-sm font-semibold capitalize ${
                                                    winner.payment_status ===
                                                    "paid"
                                                        ? "text-[#47775f]"
                                                        : "text-[#856f36]"
                                                }`}
                                            >
                                                {winner.payment_status}
                                            </p>

                                        </div>

                                        <div className="bg-[#f8f7f1] p-5">

                                            <p className="text-[10px] uppercase tracking-[0.14em] text-[#8a918b]">
                                                Proof
                                            </p>

                                            <p className="mt-2 text-sm font-semibold">
                                                {winner.proof_file_path
                                                    ? "Uploaded"
                                                    : "Not uploaded"}
                                            </p>

                                        </div>

                                    </div>

                                    {/* Actions */}
                                    <div className="mt-8 pt-7 border-t border-[#cfd4c8] flex flex-wrap items-center gap-3">

                                        {/* View Proof */}
                                        {winner.proof_file_path && (

                                            <button
                                                onClick={() =>
                                                    viewProof(
                                                        winner.proof_file_path
                                                    )
                                                }
                                                className="px-5 py-2.5 border border-[#cfd4c8] bg-[#e7ebe3] hover:bg-[#dfe5da] text-[#101813] text-sm font-semibold transition"
                                            >
                                                View Proof →
                                            </button>

                                        )}

                                        {/* Approve */}
                                        {winner.verification_status !==
                                            "approved" && (

                                            <button
                                                disabled={
                                                    processing ===
                                                    winner.id
                                                }
                                                onClick={() =>
                                                    updateVerification(
                                                        winner.id,
                                                        "approved"
                                                    )
                                                }
                                                className="px-5 py-2.5 bg-[#47775f] hover:bg-[#38644f] text-white font-semibold text-sm disabled:opacity-50 transition"
                                            >
                                                {processing === winner.id
                                                    ? "Processing..."
                                                    : "Approve Winner"}
                                            </button>

                                        )}

                                        {/* Reject */}
                                        {winner.verification_status !==
                                            "rejected" && (

                                            <button
                                                disabled={
                                                    processing ===
                                                    winner.id
                                                }
                                                onClick={() =>
                                                    updateVerification(
                                                        winner.id,
                                                        "rejected"
                                                    )
                                                }
                                                className="px-5 py-2.5 border border-[#c7aaa5] text-[#8a625d] hover:bg-[#ebe6e2] text-sm font-semibold disabled:opacity-50 transition"
                                            >
                                                {processing === winner.id
                                                    ? "Processing..."
                                                    : "Reject"}
                                            </button>

                                        )}

                                        {/* Mark Paid */}
                                        {winner.verification_status ===
                                            "approved" &&
                                            winner.payment_status !==
                                                "paid" && (

                                            <button
                                                disabled={
                                                    processing ===
                                                    winner.id
                                                }
                                                onClick={() =>
                                                    markAsPaid(
                                                        winner
                                                    )
                                                }
                                                className="px-5 py-2.5 bg-[#47775f] hover:bg-[#38644f] text-white font-semibold text-sm disabled:opacity-50 transition"
                                            >
                                                {processing === winner.id
                                                    ? "Processing..."
                                                    : "Mark as Paid →"}
                                            </button>

                                        )}

                                    </div>

                                </article>

                            );
                        })}

                    </div>

                )}

            </section>

            {/* Process */}
            <section className="border-y border-[#cfd4c8] bg-[#dfe5da]">

                <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14 md:py-18">

                    <div className="grid md:grid-cols-[220px_1fr] gap-10 md:gap-16">

                        <div>

                            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#47775f]">
                                § 03 · Payout process
                            </p>

                        </div>

                        <div className="max-w-4xl">

                            <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.04em] leading-tight">
                                Proof first.
                                <span className="text-[#47775f]">
                                    {" "}Payment after approval.
                                </span>
                            </h2>

                            <p className="mt-6 text-[#687169] text-base md:text-lg leading-7 max-w-2xl">
                                Winners submit proof for review. Once
                                approved, the payout can be marked as
                                paid and the record remains visible in
                                the administration workflow.
                            </p>

                        </div>

                    </div>

                </div>

            </section>

        </main>

 

    </div>
);
}