import { useEffect, useMemo, useRef, useState } from "react";
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

    /* =============================================================
       UPLOAD PROOF
    ============================================================= */

    async function uploadProof(winnerId, file) {
        if (!file) {
            return;
        }

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "application/pdf",
        ];

        if (!allowedTypes.includes(file.type)) {
            alert(
                "Please upload a JPG, PNG, WEBP or PDF file."
            );
            return;
        }

        const maxSize = 10 * 1024 * 1024;

        if (file.size > maxSize) {
            alert("File size must be less than 10 MB.");
            return;
        }

        setProcessing(winnerId);

        try {
            const winner = winners.find(
                (item) => item.id === winnerId
            );

            if (!winner) {
                throw new Error("Winner record not found.");
            }

            /*
             * Create a unique storage path.
             *
             * Example:
             * winner-proofs/
             *   winner-id/
             *     1727000000000-proof.pdf
             */

            const fileExtension =
                file.name.split(".").pop()?.toLowerCase() ||
                "file";

            const filePath =
                `${winnerId}/${Date.now()}-proof.${fileExtension}`;

            /*
             * Upload file to Supabase Storage
             */

            const { error: uploadError } =
                await supabase.storage
                    .from("winner-proofs")
                    .upload(filePath, file, {
                        cacheControl: "3600",
                        upsert: false,
                    });

            if (uploadError) {
                throw uploadError;
            }

            /*
             * Save the Storage path in winners.proof_url
             */

            const { error: updateError } =
                await supabase
                    .from("winners")
                    .update({
                        proof_url: filePath,
                    })
                    .eq("id", winnerId);

            if (updateError) {
                /*
                 * If database update fails, remove the uploaded file
                 * so we don't leave an unused file in Storage.
                 */

                await supabase.storage
                    .from("winner-proofs")
                    .remove([filePath]);

                throw updateError;
            }

            /*
             * Remove previous proof if one existed
             */

            if (
                winner.proof_url &&
                winner.proof_url !== filePath
            ) {
                const { error: removeError } =
                    await supabase.storage
                        .from("winner-proofs")
                        .remove([winner.proof_url]);

                if (removeError) {
                    console.warn(
                        "Old proof could not be removed:",
                        removeError
                    );
                }
            }

            alert("Proof uploaded successfully.");

            await fetchWinners();
        } catch (error) {
            console.error(
                "Proof upload error:",
                error
            );

            alert(
                error?.message ||
                "Unable to upload proof."
            );
        } finally {
            setProcessing(null);
        }
    }

    /* =============================================================
       VIEW PROOF
    ============================================================= */

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

    /* =============================================================
       VERIFICATION
    ============================================================= */

    async function updateVerification(
        winnerId,
        status
    ) {
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
            }

            if (status === "rejected") {
                updateData.verified_at = null;
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

            alert(
                error?.message ||
                "Unable to update winner verification."
            );
        } finally {
            setProcessing(null);
        }
    }

    /* =============================================================
       MARK AS PAID
    ============================================================= */

    async function markAsPaid(winner) {
    if (winner.verification_status !== "approved") {
        alert("Winner must be approved before payment.");
        return;
    }

    if (winner.payment_status === "paid") {
        return;
    }

    const confirmed = window.confirm(
        "Mark this winner as paid and record the charity contribution?"
    );

    if (!confirmed) {
        return;
    }

    setProcessing(winner.id);

    try {
        /*
         * 1. Get user's charity preference
         */
        const { data: profile, error: profileError } =
            await supabase
                .from("profiles")
                .select(
                    "id, charity_id, charity_percentage"
                )
                .eq("id", winner.user_id)
                .single();

        if (profileError) {
            throw profileError;
        }

        if (!profile?.charity_id) {
            throw new Error(
                "This user has not selected a charity."
            );
        }

        const percentage =
            Number(profile.charity_percentage) || 0;

        if (percentage < 10 || percentage > 100) {
            throw new Error(
                "Invalid charity percentage for this user."
            );
        }

        /*
         * 2. Find user's active subscription
         *
         * charity_contributions.subscription_id
         * is optional, but we will save it when available.
         */
        const { data: subscription, error: subscriptionError } =
            await supabase
                .from("subscriptions")
                .select("id")
                .eq("user_id", winner.user_id)
                .eq("status", "active")
                .order("created_at", {
                    ascending: false,
                })
                .limit(1)
                .maybeSingle();

        if (subscriptionError) {
            throw subscriptionError;
        }

        /*
         * 3. Calculate charity contribution
         *
         * Example:
         * Prize = ₹3500
         * Percentage = 10%
         * Contribution = ₹350
         */
        const prizeAmount =
            Number(winner.prize_amount) || 0;

        const contributionAmount = Math.round(
            (prizeAmount * percentage) / 100
        );

        /*
         * 4. Check whether contribution already exists
         *
         * Your charity_contributions table does not have
         * winner_id, so we use user + amount + charity + subscription.
         *
         * For stronger duplicate protection, we should eventually
         * add a winner_id column. For now this prevents the common
         * duplicate-click case.
         */
        const { data: existingContribution, error: existingError } =
            await supabase
                .from("charity_contributions")
                .select("id")
                .eq("user_id", winner.user_id)
                .eq("charity_id", profile.charity_id)
                .eq("percentage", percentage)
                .eq("amount", contributionAmount)
                .limit(1)
                .maybeSingle();

        if (existingError) {
            throw existingError;
        }

        /*
         * 5. Insert charity contribution if it doesn't exist
         */
        if (!existingContribution) {
            const { error: contributionError } =
                await supabase
                    .from("charity_contributions")
                    .insert({
                        user_id: winner.user_id,
                        charity_id: profile.charity_id,
                        subscription_id:
                            subscription?.id || null,
                        percentage,
                        amount: contributionAmount,
                    });

            if (contributionError) {
                throw contributionError;
            }
        }

        /*
         * 6. Mark winner as paid
         */
        const { error: paymentError } =
            await supabase
                .from("winners")
                .update({
                    payment_status: "paid",
                })
                .eq("id", winner.id);

        if (paymentError) {
            throw paymentError;
        }

        alert(
            `Payment marked as paid.\n\n` +
            `Prize: ₹${prizeAmount.toLocaleString("en-IN")}\n` +
            `Charity: ${percentage}%\n` +
            `Contribution: ₹${contributionAmount.toLocaleString("en-IN")}`
        );

        await fetchWinners();

    } catch (error) {
        console.error(
            "Payment / charity contribution error:",
            error
        );

        alert(
            error?.message ||
            "Unable to process payment."
        );
    } finally {
        setProcessing(null);
    }
}

    const stats = useMemo(() => {
        const pending = winners.filter(
            (winner) =>
                winner.verification_status !==
                    "approved" &&
                winner.verification_status !==
                    "rejected"
        ).length;

        const approved = winners.filter(
            (winner) =>
                winner.verification_status ===
                "approved"
        ).length;

        const paid = winners.filter(
            (winner) =>
                winner.payment_status === "paid"
        ).length;

        const pendingPayment = winners.filter(
            (winner) =>
                winner.verification_status ===
                    "approved" &&
                winner.payment_status !== "paid"
        ).length;

        return {
            total: winners.length,
            pending,
            approved,
            paid,
            pendingPayment,
        };
    }, [winners]);

    return (
        <div className="min-h-screen bg-[#f3f1e8] text-[#101813]">

            {/* =========================================================
                HERO
            ========================================================= */}

            <section className="bg-[#102019] text-white border-b border-[#183126]">

                <div className="max-w-[1500px] mx-auto px-5 sm:px-7 lg:px-10">

                    <div className="py-9 lg:py-11">

                        <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-8">

                            <div className="max-w-3xl">

                                <div className="flex items-center gap-2 mb-4">

                                    <span className="w-2 h-2 rounded-full bg-[#8ee276]" />

                                    <p className="text-[10px] uppercase tracking-[0.22em] font-bold text-[#8ee276]">
                                        Rewards · Winner verification
                                    </p>

                                </div>

                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.055em] leading-[0.95]">
                                    Verify winners.
                                    <span className="block text-[#8ee276]">
                                        Process payouts.
                                    </span>
                                </h1>

                                <p className="mt-6 text-sm sm:text-base text-white/60 leading-7 max-w-2xl">
                                    Review qualifying winners, upload
                                    proof, verify submissions and move
                                    approved rewards through the payout
                                    workflow.
                                </p>

                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 xl:w-[570px]">

                                <HeaderStat
                                    label="Total"
                                    value={
                                        loading
                                            ? "—"
                                            : stats.total
                                    }
                                />

                                <HeaderStat
                                    label="Pending"
                                    value={
                                        loading
                                            ? "—"
                                            : stats.pending
                                    }
                                    accent
                                />

                                <HeaderStat
                                    label="Approved"
                                    value={
                                        loading
                                            ? "—"
                                            : stats.approved
                                    }
                                />

                                <HeaderStat
                                    label="Paid"
                                    value={
                                        loading
                                            ? "—"
                                            : stats.paid
                                    }
                                />

                            </div>

                        </div>

                    </div>

                </div>

            </section>

            {/* =========================================================
                MAIN
            ========================================================= */}

            <main className="max-w-[1500px] mx-auto px-5 sm:px-7 lg:px-10 py-8 lg:py-10">

                {/* WORKFLOW */}

                <section className="rounded-2xl border border-[#cfd4c8] bg-[#f8f7f1] overflow-hidden shadow-[0_12px_40px_rgba(16,24,19,0.05)] mb-6">

                    <div className="px-6 sm:px-7 py-5">

                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                            <div>

                                <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#47775f]">
                                    Winner workflow
                                </p>

                                <h2 className="mt-1 text-xl font-bold tracking-[-0.035em]">
                                    Proof, verification and payout queue
                                </h2>

                            </div>

                            <div className="flex flex-wrap items-center gap-2">

                                <WorkflowStep
                                    number="01"
                                    label="Upload proof"
                                    active
                                />

                                <span className="text-[#a1a69f]">
                                    →
                                </span>

                                <WorkflowStep
                                    number="02"
                                    label="Approve"
                                />

                                <span className="text-[#a1a69f]">
                                    →
                                </span>

                                <WorkflowStep
                                    number="03"
                                    label="Pay"
                                />

                            </div>

                        </div>

                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 border-t border-[#cfd4c8]">

                        <MiniMetric
                            label="Needs review"
                            value={
                                loading
                                    ? "—"
                                    : stats.pending
                            }
                        />

                        <MiniMetric
                            label="Approved"
                            value={
                                loading
                                    ? "—"
                                    : stats.approved
                            }
                        />

                        <MiniMetric
                            label="Awaiting payout"
                            value={
                                loading
                                    ? "—"
                                    : stats.pendingPayment
                            }
                        />

                        <MiniMetric
                            label="Completed"
                            value={
                                loading
                                    ? "—"
                                    : stats.paid
                            }
                        />

                    </div>

                </section>

                {/* RECORDS HEADER */}

                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5">

                    <div>

                        <div className="flex items-center gap-2">

                            <span className="w-1.5 h-1.5 rounded-full bg-[#8ee276]" />

                            <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#47775f]">
                                Winner records
                            </p>

                        </div>

                        <h2 className="mt-1 text-2xl font-bold tracking-[-0.04em]">
                            Verification queue
                        </h2>

                    </div>

                    <p className="text-xs text-[#8a918b]">
                        {winners.length}{" "}
                        {winners.length === 1
                            ? "winner record"
                            : "winner records"}
                    </p>

                </div>

                {/* CONTENT */}

                {loading ? (
                    <LoadingState />
                ) : winners.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="space-y-4">

                        {winners.map(
                            (winner, index) => {

                                const profile =
                                    profiles[
                                        winner.user_id
                                    ];

                                const draw =
                                    winner.draws;

                                return (
                                    <WinnerCard
                                        key={winner.id}
                                        winner={winner}
                                        profile={profile}
                                        draw={draw}
                                        index={index}
                                        processing={
                                            processing
                                        }
                                        formatDrawMonth={
                                            formatDrawMonth
                                        }
                                        viewProof={
                                            viewProof
                                        }
                                        uploadProof={
                                            uploadProof
                                        }
                                        updateVerification={
                                            updateVerification
                                        }
                                        markAsPaid={
                                            markAsPaid
                                        }
                                    />
                                );
                            }
                        )}

                    </div>
                )}

                {/* FOOTER */}

                <section className="mt-6 rounded-2xl bg-[#103523] text-white overflow-hidden">

                    <div className="p-7 sm:p-9">

                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

                            <div className="max-w-2xl">

                                <div className="flex items-center gap-2 mb-4">

                                    <span className="w-2 h-2 rounded-full bg-[#8ee276]" />

                                    <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#8ee276]">
                                        Payout control
                                    </p>

                                </div>

                                <h2 className="text-2xl sm:text-3xl font-bold tracking-[-0.04em]">
                                    Upload proof first.
                                    <span className="text-[#8ee276]">
                                        {" "}Pay after approval.
                                    </span>
                                </h2>

                                <p className="mt-4 text-sm text-white/55 leading-6 max-w-xl">
                                    Upload the winner proof before
                                    approving the winner. Once approved,
                                    the reward can be marked as paid.
                                </p>

                            </div>

                            <div className="grid grid-cols-2 gap-3 lg:w-[280px]">

                                <ImpactStat
                                    value={
                                        loading
                                            ? "—"
                                            : stats.pendingPayment
                                    }
                                    label="Awaiting payout"
                                />

                                <ImpactStat
                                    value={
                                        loading
                                            ? "—"
                                            : stats.paid
                                    }
                                    label="Paid winners"
                                />

                            </div>

                        </div>

                    </div>

                </section>

            </main>

        </div>
    );
}


/* =============================================================
   WINNER CARD
============================================================= */

function WinnerCard({
    winner,
    profile,
    draw,
    index,
    processing,
    formatDrawMonth,
    viewProof,
    uploadProof,
    updateVerification,
    markAsPaid,
}) {
    const isProcessing =
        processing === winner.id;

    const isApproved =
        winner.verification_status ===
        "approved";

    const isRejected =
        winner.verification_status ===
        "rejected";

    const isPaid =
        winner.payment_status === "paid";

    const hasProof =
        Boolean(winner.proof_url);

    const fileInputRef = useRef(null);

    function handleFileChange(event) {
        const file =
            event.target.files?.[0];

        if (file) {
            uploadProof(
                winner.id,
                file
            );
        }

        event.target.value = "";
    }

    return (
        <article className="rounded-2xl border border-[#cfd4c8] bg-[#f8f7f1] overflow-hidden shadow-[0_8px_30px_rgba(16,24,19,0.04)]">

            {/* TOP */}

            <div className="p-5 sm:p-6 lg:p-7">

                <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">

                    {/* WINNER */}

                    <div className="flex gap-4 min-w-0">

                        <div className="hidden sm:flex w-11 h-11 shrink-0 rounded-xl bg-[#dfe7dc] text-[#47775f] items-center justify-center text-[10px] font-bold">
                            {String(index + 1).padStart(
                                2,
                                "0"
                            )}
                        </div>

                        <div className="min-w-0">

                            <div className="flex flex-wrap items-center gap-2">

                                <span className="text-[9px] uppercase tracking-[0.16em] font-bold text-[#8a918b]">
                                    Winner
                                </span>

                                <StatusBadge
                                    type="verification"
                                    status={
                                        winner.verification_status
                                    }
                                />

                                {isPaid && (
                                    <StatusBadge
                                        type="payment"
                                        status="paid"
                                    />
                                )}

                            </div>

                            <h3 className="mt-2 text-xl sm:text-2xl font-bold tracking-[-0.035em] truncate">
                                {profile?.full_name ||
                                    "Unknown user"}
                            </h3>

                            <p className="mt-1 text-xs sm:text-sm text-[#8a918b] truncate">
                                {profile?.email ||
                                    winner.user_id}
                            </p>

                        </div>

                    </div>

                    {/* PRIZE */}

                    <div className="flex items-center gap-2">

                        <div className="rounded-xl border border-[#cfd4c8] bg-[#dfe7dc] px-5 py-3 min-w-[150px]">

                            <p className="text-[9px] uppercase tracking-[0.14em] text-[#8a918b]">
                                Prize amount
                            </p>

                            <p className="mt-1 text-xl font-bold tracking-[-0.03em] text-[#47775f]">
                                ₹
                                {Number(
                                    winner.prize_amount ||
                                        0
                                ).toLocaleString(
                                    "en-IN"
                                )}
                            </p>

                        </div>

                    </div>

                </div>

                {/* DETAILS */}

                <div className="grid md:grid-cols-3 gap-3 mt-6">

                    <DetailCard
                        label="Draw"
                        value={formatDrawMonth(draw)}
                    />

                    <DetailCard
                        label="Matches"
                        value={
                            <>
                                {
                                    winner.match_count
                                }
                                <span className="text-[#8a918b] text-xs font-normal">
                                    /5
                                </span>
                            </>
                        }
                    />

                    <DetailCard
                        label="Draw type"
                        value={
                            draw?.draw_type ||
                            "Unknown"
                        }
                    />

                </div>

                {/* WINNING NUMBERS */}

                {draw?.winning_numbers
                    ?.length > 0 && (
                    <div className="mt-5 rounded-xl border border-[#cfd4c8] bg-[#f3f1e8] p-5">

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                            <div>

                                <p className="text-[9px] uppercase tracking-[0.16em] font-bold text-[#8a918b]">
                                    Winning numbers
                                </p>

                                <p className="mt-1 text-xs text-[#687169]">
                                    Numbers generated for this draw.
                                </p>

                            </div>

                            <div className="flex flex-wrap gap-2">

                                {draw.winning_numbers.map(
                                    (
                                        number,
                                        numberIndex
                                    ) => (
                                        <span
                                            key={`${number}-${numberIndex}`}
                                            className="w-9 h-9 rounded-lg bg-[#103523] text-[#8ee276] flex items-center justify-center text-xs font-bold"
                                        >
                                            {number}
                                        </span>
                                    )
                                )}

                            </div>

                        </div>

                    </div>
                )}

                {/* STATUS */}

                <div className="grid md:grid-cols-3 gap-3 mt-5">

                    <StatusPanel
                        label="Verification"
                        status={
                            winner.verification_status
                        }
                        type="verification"
                    />

                    <StatusPanel
                        label="Payment"
                        status={
                            winner.payment_status
                        }
                        type="payment"
                    />

                    <StatusPanel
                        label="Proof"
                        status={
                            hasProof
                                ? "Uploaded"
                                : "Not uploaded"
                        }
                        type="proof"
                    />

                </div>

            </div>

            {/* =====================================================
                ACTION BAR
            ===================================================== */}

            <div className="border-t border-[#cfd4c8] bg-[#f3f1e8] px-5 sm:px-6 lg:px-7 py-4">

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                    {/* PROOF ACTIONS */}

                    <div className="flex flex-wrap items-center gap-2">

                        {/* Hidden file input */}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp,.pdf"
                            className="hidden"
                            onChange={
                                handleFileChange
                            }
                        />

                        {/* UPLOAD / REPLACE */}

                        <button
                            disabled={
                                isProcessing
                            }
                            onClick={() =>
                                fileInputRef.current?.click()
                            }
                            className="h-10 px-4 rounded-lg bg-[#47775f] hover:bg-[#38644f] text-white text-xs font-bold transition disabled:opacity-50"
                        >
                            {isProcessing
                                ? "Uploading..."
                                : hasProof
                                ? "Replace proof"
                                : "Upload proof"}
                        </button>

                        {/* VIEW */}

                        {hasProof && (
                            <button
                                disabled={
                                    isProcessing
                                }
                                onClick={() =>
                                    viewProof(
                                        winner.proof_url
                                    )
                                }
                                className="h-10 px-4 rounded-lg border border-[#cfd4c8] bg-[#f8f7f1] hover:bg-[#dfe7dc] text-xs font-bold transition disabled:opacity-50"
                            >
                                View proof
                                <span className="ml-1">
                                    ↗
                                </span>
                            </button>
                        )}

                    </div>

                    {/* VERIFICATION / PAYMENT */}

                    <div className="flex flex-wrap items-center gap-2">

                        {!isApproved && (
                            <button
                                disabled={
                                    isProcessing
                                }
                                onClick={() =>
                                    updateVerification(
                                        winner.id,
                                        "approved"
                                    )
                                }
                                className="h-10 px-4 rounded-lg bg-[#47775f] hover:bg-[#38644f] text-white text-xs font-bold transition disabled:opacity-50"
                            >
                                {isProcessing
                                    ? "Processing..."
                                    : "Approve winner"}
                            </button>
                        )}

                        {!isRejected && (
                            <button
                                disabled={
                                    isProcessing
                                }
                                onClick={() =>
                                    updateVerification(
                                        winner.id,
                                        "rejected"
                                    )
                                }
                                className="h-10 px-4 rounded-lg border border-[#c7aaa5] bg-[#f8f7f1] text-[#8a625d] hover:bg-[#ebe6e2] text-xs font-bold transition disabled:opacity-50"
                            >
                                {isProcessing
                                    ? "Processing..."
                                    : "Reject"}
                            </button>
                        )}

                        {isApproved &&
                            !isPaid && (
                                <button
                                    disabled={
                                        isProcessing
                                    }
                                    onClick={() =>
                                        markAsPaid(
                                            winner
                                        )
                                    }
                                    className="h-10 px-5 rounded-lg bg-[#103523] text-[#8ee276] hover:bg-[#47775f] hover:text-white text-xs font-bold transition disabled:opacity-50"
                                >
                                    {isProcessing
                                        ? "Processing..."
                                        : "Mark as paid →"}
                                </button>
                            )}

                        {isPaid && (
                            <div className="h-10 px-4 rounded-lg bg-[#dfe7dc] text-[#47775f] flex items-center gap-2 text-xs font-bold">

                                <span className="w-1.5 h-1.5 rounded-full bg-[#47775f]" />

                                Payment completed

                            </div>
                        )}

                    </div>

                </div>

            </div>

        </article>
    );
}


/* =============================================================
   HEADER STAT
============================================================= */

function HeaderStat({
    label,
    value,
    accent = false,
}) {
    return (
        <div className="rounded-xl border border-white/10 bg-white/[0.045] px-4 py-3.5">

            <p className="text-[9px] uppercase tracking-[0.15em] text-white/40 font-bold">
                {label}
            </p>

            <p
                className={`mt-1.5 text-2xl font-bold tracking-[-0.04em] ${
                    accent
                        ? "text-[#8ee276]"
                        : "text-white"
                }`}
            >
                {value}
            </p>

        </div>
    );
}


/* =============================================================
   WORKFLOW STEP
============================================================= */

function WorkflowStep({
    number,
    label,
    active = false,
}) {
    return (
        <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold ${
                active
                    ? "bg-[#dfe7dc] text-[#47775f]"
                    : "bg-[#e7ebe3] text-[#687169]"
            }`}
        >
            <span className="opacity-60">
                {number}
            </span>

            {label}
        </div>
    );
}


/* =============================================================
   MINI METRIC
============================================================= */

function MiniMetric({
    label,
    value,
}) {
    return (
        <div className="px-5 py-4 border-r border-[#cfd4c8] last:border-r-0">

            <p className="text-[9px] uppercase tracking-[0.14em] text-[#8a918b] font-bold">
                {label}
            </p>

            <p className="mt-1 text-xl font-bold tracking-[-0.03em]">
                {value}
            </p>

        </div>
    );
}


/* =============================================================
   DETAIL CARD
============================================================= */

function DetailCard({
    label,
    value,
}) {
    return (
        <div className="rounded-xl border border-[#cfd4c8] bg-[#f3f1e8] px-4 py-3.5">

            <p className="text-[9px] uppercase tracking-[0.14em] text-[#8a918b] font-bold">
                {label}
            </p>

            <p className="mt-1.5 text-sm font-bold capitalize">
                {value}
            </p>

        </div>
    );
}


/* =============================================================
   STATUS PANEL
============================================================= */

function StatusPanel({
    label,
    status,
}) {
    let textColor =
        "text-[#856f36]";

    let dotColor =
        "bg-[#856f36]";

    let bgColor =
        "bg-[#f3f1e8]";

    const normalized =
        String(status || "").toLowerCase();

    if (
        normalized === "approved" ||
        normalized === "paid" ||
        normalized === "uploaded"
    ) {
        textColor =
            "text-[#47775f]";

        dotColor =
            "bg-[#47775f]";

        bgColor =
            "bg-[#dfe7dc]";
    }

    if (
        normalized === "rejected" ||
        normalized === "not uploaded"
    ) {
        textColor =
            "text-[#8a625d]";

        dotColor =
            "bg-[#8a625d]";

        bgColor =
            "bg-[#ebe6e2]";
    }

    return (
        <div
            className={`rounded-xl border border-[#cfd4c8] ${bgColor} px-4 py-3.5`}
        >

            <p className="text-[9px] uppercase tracking-[0.14em] text-[#8a918b] font-bold">
                {label}
            </p>

            <div className="flex items-center gap-2 mt-1.5">

                <span
                    className={`w-1.5 h-1.5 rounded-full ${dotColor}`}
                />

                <p
                    className={`text-sm font-bold capitalize ${textColor}`}
                >
                    {status || "Unknown"}
                </p>

            </div>

        </div>
    );
}


/* =============================================================
   STATUS BADGE
============================================================= */

function StatusBadge({
    status,
}) {
    const normalized =
        String(status || "").toLowerCase();

    let classes =
        "bg-[#e7ebe3] text-[#687169]";

    if (
        normalized === "approved" ||
        normalized === "paid"
    ) {
        classes =
            "bg-[#dfe7dc] text-[#47775f]";
    }

    if (normalized === "rejected") {
        classes =
            "bg-[#ebe6e2] text-[#8a625d]";
    }

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] uppercase tracking-[0.1em] font-bold ${classes}`}
        >

            <span
                className={`w-1.5 h-1.5 rounded-full ${
                    normalized === "approved" ||
                    normalized === "paid"
                        ? "bg-[#47775f]"
                        : normalized ===
                          "rejected"
                        ? "bg-[#8a625d]"
                        : "bg-[#856f36]"
                }`}
            />

            {status || "Unknown"}

        </span>
    );
}


/* =============================================================
   LOADING STATE
============================================================= */

function LoadingState() {
    return (
        <div className="rounded-2xl border border-[#cfd4c8] bg-[#f8f7f1] py-20 text-center">

            <div className="mx-auto w-8 h-8 rounded-full border-2 border-[#cfd4c8] border-t-[#47775f] animate-spin" />

            <p className="mt-4 text-[10px] uppercase tracking-[0.16em] font-bold text-[#8a918b]">
                Loading winner records
            </p>

        </div>
    );
}


/* =============================================================
   EMPTY STATE
============================================================= */

function EmptyState() {
    return (
        <div className="rounded-2xl border border-dashed border-[#cfd4c8] bg-[#f8f7f1] py-20 px-6 text-center">

            <div className="mx-auto w-12 h-12 rounded-xl bg-[#dfe7dc] text-[#47775f] flex items-center justify-center text-lg font-bold">
                ✓
            </div>

            <p className="mt-5 text-[9px] uppercase tracking-[0.18em] font-bold text-[#8a918b]">
                Queue empty
            </p>

            <h2 className="mt-2 text-xl font-bold tracking-[-0.03em]">
                No winners yet
            </h2>

            <p className="mt-2 text-sm text-[#687169]">
                Winners will appear here after a draw is processed.
            </p>

        </div>
    );
}


/* =============================================================
   IMPACT STAT
============================================================= */

function ImpactStat({
    value,
    label,
}) {
    return (
        <div className="rounded-xl border border-white/10 bg-white/[0.05] p-4">

            <p className="text-2xl font-bold tracking-[-0.04em] text-[#8ee276]">
                {value}
            </p>

            <p className="mt-1 text-[9px] uppercase tracking-[0.13em] font-bold text-white/40">
                {label}
            </p>

        </div>
    );
}