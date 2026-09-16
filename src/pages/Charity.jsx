import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

function Charity() {
    const { user, profile } = useAuth();
    const navigate = useNavigate();

    const [charities, setCharities] = useState([]);
    const [selectedCharity, setSelectedCharity] = useState(
        profile?.charity_id || ""
    );
    const [percentage, setPercentage] = useState(
        profile?.charity_percentage || 10
    );

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        fetchCharities();
    }, []);

    useEffect(() => {
        if (profile) {
            setSelectedCharity(profile.charity_id || "");
            setPercentage(profile.charity_percentage || 10);
        }
    }, [profile]);

    const fetchCharities = async () => {
        const { data, error } = await supabase
            .from("charities")
            .select("*")
            .eq("active", true)
            .order("name");

        if (error) {
            console.error(error);
            setError("Unable to load charities.");
        } else {
            setCharities(data || []);
        }

        setLoading(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();

        setError("");
        setMessage("");

        if (!selectedCharity) {
            setError("Please select a charity.");
            return;
        }

        if (percentage < 10 || percentage > 100) {
            setError("Charity contribution must be between 10% and 100%.");
            return;
        }

        setSaving(true);

        const { error } = await supabase.rpc(
            "update_my_charity_preferences",
            {
                p_charity_id: selectedCharity,
                p_charity_percentage: Number(percentage),
            }
        );



        if (error) {
    console.error(error);
    setError("Unable to save your charity preferences.");
    setSaving(false);
    return;
}

setMessage("Your charity preferences have been saved.");
setSaving(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f7f3ea] text-[#101813] flex items-center justify-center">
                Loading charities...
            </div>
        );
    }

    return (
    <div className="min-h-screen bg-[#f3f1e8] text-[#101813]">

       

        <main className="max-w-7xl mx-auto px-6 lg:px-10 py-12 md:py-16">

            {/* Header */}
            <section className="border-b border-[#cfd4c8] pb-12">

                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">

                    <div className="max-w-3xl">

                        <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#47775f]">
                            § 01 · Your impact
                        </p>

                        <h1 className="mt-5 text-4xl md:text-6xl font-semibold tracking-[-0.04em] leading-[0.95]">
                            Choose where your
                            <span className="block text-[#47775f]">
                                impact goes.
                            </span>
                        </h1>

                        <p className="mt-6 text-[#687169] text-base md:text-lg leading-7 max-w-2xl">
                            Select a charity you care about and decide how much
                            of your winnings you want to contribute. Your choice
                            can be changed whenever you need.
                        </p>

                    </div>

                    <div className="border-l border-[#cfd4c8] pl-6 min-w-[180px]">
                        <p className="text-xs uppercase tracking-[0.16em] text-[#8a918b]">
                            Minimum contribution
                        </p>

                        <p className="mt-2 text-4xl font-semibold tracking-tight">
                            10%
                        </p>
                    </div>

                </div>

            </section>

            <form onSubmit={handleSave}>

                {/* Charity selection */}
                <section className="py-12 border-b border-[#cfd4c8]">

                    <div className="mb-8">
                        <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#47775f]">
                            § 02 · Select a charity
                        </p>

                        <h2 className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight">
                            Put your winnings behind a cause.
                        </h2>

                        <p className="mt-3 text-[#687169] max-w-2xl">
                            Choose one of the active charities below. Your
                            selected organisation will receive the contribution
                            percentage you set.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#cfd4c8] border border-[#cfd4c8]">

                        {charities.map((charity, index) => {
                            const isSelected = selectedCharity === charity.id;

                            return (
                                <button
                                    type="button"
                                    key={charity.id}
                                    onClick={() => setSelectedCharity(charity.id)}
                                    className={`text-left p-6 md:p-7 min-h-[220px] transition ${isSelected
                                        ? "bg-[#dfe5da]"
                                        : "bg-[#f8f7f1] hover:bg-[#e7ebe3]"
                                        }`}
                                >

                                    <div className="flex items-start justify-between gap-5">

                                        <span className="text-xs tracking-[0.15em] text-[#8a918b]">
                                            0{index + 1}
                                        </span>

                                        <span
                                            className={`w-5 h-5 border flex items-center justify-center shrink-0 ${isSelected
                                                ? "border-[#47775f] bg-[#47775f]"
                                                : "border-[#aeb5ac]"
                                                }`}
                                        >
                                            {isSelected && (
                                                <span className="w-2 h-2 bg-[#f8f7f1]" />
                                            )}
                                        </span>

                                    </div>

                                    <div className="mt-12">

                                        <h3 className="text-xl font-semibold tracking-tight">
                                            {charity.name}
                                        </h3>

                                        <p className="mt-3 text-sm text-[#687169] leading-6">
                                            {charity.description ||
                                                "Supporting meaningful community impact."}
                                        </p>

                                    </div>

                                    {isSelected && (
                                        <p className="mt-6 text-xs uppercase tracking-[0.16em] font-semibold text-[#47775f]">
                                            Selected · Your choice
                                        </p>
                                    )}

                                </button>
                            );
                        })}

                    </div>

                </section>

                {/* Contribution */}
                <section className="py-12 border-b border-[#cfd4c8]">

                    <div className="grid lg:grid-cols-[1fr_360px] gap-12 lg:gap-20">

                        <div>

                            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#47775f]">
                                § 03 · Contribution
                            </p>

                            <h2 className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight">
                                Decide how much you give.
                            </h2>

                            <p className="mt-3 text-[#687169] max-w-2xl">
                                Set the percentage of your winnings that should
                                go towards your selected charity. The minimum
                                contribution is 10%.
                            </p>

                            <div className="mt-10">

                                <input
                                    type="range"
                                    min="10"
                                    max="100"
                                    step="5"
                                    value={percentage}
                                    onChange={(e) =>
                                        setPercentage(e.target.value)
                                    }
                                    className="w-full accent-[#47775f]"
                                />

                                <div className="flex justify-between mt-3 text-xs text-[#8a918b]">
                                    <span>10% minimum</span>
                                    <span>100%</span>
                                </div>

                            </div>

                            <div className="flex flex-wrap gap-2 mt-7">

                                {[10, 20, 30, 50, 75, 100].map((value) => (
                                    <button
                                        type="button"
                                        key={value}
                                        onClick={() => setPercentage(value)}
                                        className={`px-4 py-2 text-sm border transition ${Number(percentage) === value
                                            ? "border-[#47775f] bg-[#dfe5da] text-[#47775f] font-semibold"
                                            : "border-[#cfd4c8] bg-[#f8f7f1] text-[#687169] hover:border-[#47775f] hover:text-[#101813]"
                                            }`}
                                    >
                                        {value}%
                                    </button>
                                ))}

                            </div>

                        </div>

                        {/* Percentage display */}
                        <div className="border border-[#cfd4c8] bg-[#dfe5da] p-7 md:p-8 flex flex-col justify-between min-h-[230px]">

                            <div>
                                <p className="text-xs uppercase tracking-[0.16em] text-[#687169]">
                                    Your contribution
                                </p>

                                <p className="mt-6 text-6xl md:text-7xl font-semibold tracking-[-0.05em] text-[#47775f]">
                                    {percentage}%
                                </p>
                            </div>

                            <p className="mt-8 text-sm leading-6 text-[#687169]">
                                of eligible winnings directed to your chosen
                                charity.
                            </p>

                        </div>

                    </div>

                </section>

                {/* Messages */}
                {error && (
                    <div className="mt-8 border border-red-200 bg-[#f8e9e5] px-5 py-4 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="mt-8 border border-[#b8cbbd] bg-[#e4eee6] px-5 py-4 text-sm text-[#38644f]">
                        {message}
                    </div>
                )}

                {/* Save */}
                <section className="pt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">

                    <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-[#8a918b]">
                            Final step
                        </p>

                        <p className="mt-2 text-sm text-[#687169]">
                            Your charity preference will be saved to your profile.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="px-7 py-3.5 bg-[#47775f] text-white text-sm font-semibold hover:bg-[#38644f] disabled:opacity-50 transition"
                    >
                        {saving ? "Saving..." : "Save preferences →"}
                    </button>

                </section>

            </form>

        </main>


    </div>
);
}

export default Charity;