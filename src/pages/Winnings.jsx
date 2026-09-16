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
            alert(
                "Please upload a PNG, JPG or WEBP image."
            );
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert("Maximum file size is 5MB.");
            return;
        }

        setUploading(winnerId);

        try {
            const extension =
                file.name.split(".").pop();

            const filePath =
                `${user.id}/${winnerId}-${Date.now()}.${extension}`;

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

    return (
    <div className="min-h-screen bg-[#f3f1e8] text-[#101813]">

   
        <main>

            {/* Hero */}
            <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16 md:py-24 border-b border-[#cfd4c8]">

                <div className="grid lg:grid-cols-[1fr_300px] gap-12 lg:gap-20 items-end">

                    <div className="max-w-4xl">

                        <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#47775f]">
                            § 01 · My winnings
                        </p>

                        <h1 className="mt-6 text-5xl md:text-7xl font-semibold tracking-[-0.05em] leading-[0.92]">
                            Your wins.
                            <span className="block text-[#47775f]">
                                Your proof.
                            </span>
                        </h1>

                        <p className="mt-8 text-[#687169] text-base md:text-lg leading-7 max-w-2xl">
                            Review your winning entries, submit score proof
                            and track verification and payment status.
                        </p>

                    </div>

                    <div className="border-l border-[#cfd4c8] pl-6">

                        <p className="text-xs uppercase tracking-[0.16em] text-[#8a918b]">
                            Winning entries
                        </p>

                        <p className="mt-3 text-5xl font-semibold tracking-[-0.04em] text-[#47775f]">
                            {winnings.length}
                        </p>

                        <p className="mt-3 text-sm leading-6 text-[#687169]">
                            Your qualifying draw entries are
                            recorded here.
                        </p>

                    </div>

                </div>

            </section>

            {/* Winnings */}
            <section className="max-w-7xl mx-auto px-6 lg:px-10 py-14 md:py-20">

                <div className="mb-10">

                    <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#47775f]">
                        § 02 · Winning history
                    </p>

                    <h2 className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight">
                        Your qualifying entries.
                    </h2>

                </div>

                {/* Loading */}
                {loading ? (

                    <div className="border border-[#cfd4c8] bg-[#f8f7f1] px-6 py-16 text-center">

                        <p className="text-sm text-[#687169]">
                            Loading winnings...
                        </p>

                    </div>

                ) : winnings.length === 0 ? (

                    /* No winnings */
                    <div className="border border-[#cfd4c8] bg-[#f8f7f1]">

                        <div className="grid md:grid-cols-[180px_1fr]">

                            <div className="border-b md:border-b-0 md:border-r border-[#cfd4c8] p-7">

                                <p className="text-xs uppercase tracking-[0.16em] text-[#8a918b]">
                                    Status
                                </p>

                                <p className="mt-3 text-xl font-semibold text-[#47775f]">
                                    Waiting
                                </p>

                            </div>

                            <div className="p-8 md:p-10">

                                <h3 className="text-2xl md:text-3xl font-semibold tracking-tight">
                                    No winnings yet.
                                </h3>

                                <p className="mt-4 text-[#687169] leading-7 max-w-xl">
                                    Keep participating in the monthly
                                    draws. Any qualifying winning entry
                                    will appear here.
                                </p>

                            </div>

                        </div>

                    </div>

                ) : (

                    /* Winnings list */
                    <div className="space-y-8">

                        {winnings.map((winner, index) => (

                            <article
                                key={winner.id}
                                className="border border-[#cfd4c8] bg-[#f8f7f1]"
                            >

                                {/* Header */}
                                <div className="grid md:grid-cols-[1fr_220px] border-b border-[#cfd4c8]">

                                    <div className="p-7 md:p-9">

                                        <div className="flex items-start gap-5">

                                            <span className="text-xs tracking-[0.16em] text-[#8a918b] pt-1">
                                                {String(index + 1).padStart(2, "0")}
                                            </span>

                                            <div>

                                                <p className="text-xs uppercase tracking-[0.18em] font-semibold text-[#47775f]">
                                                    Monthly draw
                                                </p>

                                                <h2 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight">
                                                    {formatDrawDate(
                                                        winner.draws
                                                    )}
                                                </h2>

                                            </div>

                                        </div>

                                    </div>

                                    <div className="border-t md:border-t-0 md:border-l border-[#cfd4c8] bg-[#dfe5da] p-7 md:p-9 flex flex-col justify-center">

                                        <p className="text-xs uppercase tracking-[0.16em] text-[#8a918b]">
                                            Match result
                                        </p>

                                        <p className="mt-2 text-3xl font-semibold text-[#47775f]">
                                            {winner.match_count}/5
                                        </p>

                                        <p className="mt-1 text-xs text-[#687169]">
                                            matching numbers
                                        </p>

                                    </div>

                                </div>

                                {/* Prize information */}
                                <div className="grid md:grid-cols-3 gap-px bg-[#cfd4c8] border-b border-[#cfd4c8]">

                                    <div className="bg-[#f8f7f1] p-7 md:p-8">

                                        <p className="text-xs uppercase tracking-[0.16em] text-[#8a918b]">
                                            Prize
                                        </p>

                                        <p className="mt-3 text-3xl font-semibold tracking-[-0.03em]">
                                            ₹{Number(
                                                winner.prize_amount || 0
                                            ).toLocaleString("en-IN")}
                                        </p>

                                    </div>

                                    <div className="bg-[#f8f7f1] p-7 md:p-8">

                                        <p className="text-xs uppercase tracking-[0.16em] text-[#8a918b]">
                                            Verification
                                        </p>

                                        <p className="mt-3 text-lg font-semibold capitalize">
                                            {winner.verification_status ||
                                                "pending"}
                                        </p>

                                    </div>

                                    <div className="bg-[#f8f7f1] p-7 md:p-8">

                                        <p className="text-xs uppercase tracking-[0.16em] text-[#8a918b]">
                                            Payment
                                        </p>

                                        <p className="mt-3 text-lg font-semibold capitalize">
                                            {winner.payment_status ||
                                                "pending"}
                                        </p>

                                    </div>

                                </div>

                                {/* Proof */}
                                <div className="p-7 md:p-9">

                                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-7">

                                        <div>

                                            <p className="text-xs uppercase tracking-[0.18em] font-semibold text-[#47775f]">
                                                § Proof of winning
                                            </p>

                                            <p className="mt-3 text-sm leading-6 text-[#687169] max-w-xl">
                                                Upload an image showing your
                                                winning score for admin
                                                verification.
                                            </p>

                                            <p className="mt-2 text-xs text-[#8a918b]">
                                                PNG, JPG or WEBP · Maximum 5MB
                                            </p>

                                        </div>

                                        {!winner.proof_file_path ? (

                                            <div className="w-full md:w-auto">

                                                <label
                                                    className={`inline-flex items-center justify-center px-6 py-3 text-sm font-semibold transition ${
                                                        uploading === winner.id
                                                            ? "bg-[#cfd4c8] text-[#8a918b] cursor-not-allowed"
                                                            : "bg-[#47775f] text-white hover:bg-[#38644f] cursor-pointer"
                                                    }`}
                                                >

                                                    {uploading === winner.id
                                                        ? "Uploading..."
                                                        : "Upload proof →"}

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

                                            </div>

                                        ) : (

                                            <div className="flex flex-wrap items-center gap-5">

                                                <span className="text-sm font-semibold text-[#47775f]">
                                                    ✓ Proof uploaded
                                                </span>

                                                <button
                                                    onClick={() =>
                                                        viewProof(
                                                            winner.proof_file_path
                                                        )
                                                    }
                                                    className="text-sm font-semibold text-[#47775f] hover:text-[#38644f] transition"
                                                >
                                                    View proof →
                                                </button>

                                            </div>

                                        )}

                                    </div>

                                </div>

                            </article>

                        ))}

                    </div>

                )}

            </section>

            {/* Status guide */}
            {winnings.length > 0 && (
                <section className="border-y border-[#cfd4c8] bg-[#dfe5da]">

                    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14 md:py-18">

                        <div className="grid md:grid-cols-[220px_1fr] gap-10 md:gap-16">

                            <div>

                                <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#47775f]">
                                    § 03 · What happens next
                                </p>

                            </div>

                            <div className="max-w-4xl">

                                <div className="grid sm:grid-cols-3 gap-px bg-[#cfd4c8] border border-[#cfd4c8]">

                                    <div className="bg-[#f8f7f1] p-6">

                                        <p className="text-xs uppercase tracking-[0.16em] text-[#8a918b]">
                                            01
                                        </p>

                                        <h3 className="mt-4 font-semibold">
                                            Submit proof
                                        </h3>

                                        <p className="mt-2 text-sm leading-6 text-[#687169]">
                                            Upload your winning score
                                            evidence.
                                        </p>

                                    </div>

                                    <div className="bg-[#f8f7f1] p-6">

                                        <p className="text-xs uppercase tracking-[0.16em] text-[#8a918b]">
                                            02
                                        </p>

                                        <h3 className="mt-4 font-semibold">
                                            Verification
                                        </h3>

                                        <p className="mt-2 text-sm leading-6 text-[#687169]">
                                            Your submission is reviewed
                                            by the admin team.
                                        </p>

                                    </div>

                                    <div className="bg-[#f8f7f1] p-6">

                                        <p className="text-xs uppercase tracking-[0.16em] text-[#8a918b]">
                                            03
                                        </p>

                                        <h3 className="mt-4 font-semibold">
                                            Payment
                                        </h3>

                                        <p className="mt-2 text-sm leading-6 text-[#687169]">
                                            Once approved, your payment
                                            status is updated.
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </section>
            )}

        </main>

      

    </div>
);
}