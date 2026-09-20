import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AdminCharities() {
    const [charities, setCharities] = useState([]);
    const [loading, setLoading] = useState(true);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [website, setWebsite] = useState("");
    const [isActive, setIsActive] = useState(true);

    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchCharities();
    }, []);

    async function fetchCharities() {
        setLoading(true);

        const { data, error } = await supabase
            .from("charities")
            .select("*")
            .order("created_at", {
                ascending: false,
            });

        if (error) {
            console.error(error);
            alert(error.message);
        } else {
            setCharities(data || []);
        }

        setLoading(false);
    }

    async function addCharity(e) {
        e.preventDefault();

        if (!name.trim()) {
            alert("Charity name is required.");
            return;
        }

        setSaving(true);

        const { error } = await supabase
            .from("charities")
            .insert({
                name: name.trim(),
                description: description.trim(),
                website: website.trim() || null,
                active: isActive,
            });

        if (error) {
            console.error(error);
            alert(error.message);
        } else {
            setName("");
            setDescription("");
            setWebsite("");
            setIsActive(true);

            await fetchCharities();
        }

        setSaving(false);
    }

    async function toggleCharity(charity) {
        const { error } = await supabase
            .from("charities")
            .update({
                active: !charity.active,
            })
            .eq("id", charity.id);

        if (error) {
            console.error(error);
            alert(error.message);
            return;
        }

        await fetchCharities();
    }

    const stats = useMemo(() => {
        const active = charities.filter((charity) => charity.active).length;
        const inactive = charities.length - active;

        return {
            total: charities.length,
            active,
            inactive,
        };
    }, [charities]);

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
                                        Impact · Charity management
                                    </p>
                                </div>

                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.055em] leading-[0.95]">
                                    Manage the causes
                                    <span className="block text-[#8ee276]">
                                        behind the platform.
                                    </span>
                                </h1>

                                <p className="mt-6 text-sm sm:text-base text-white/60 leading-7 max-w-2xl">
                                    Add participating charities, control their
                                    availability and keep the member impact
                                    directory up to date.
                                </p>

                            </div>

                            {/* Stats */}

                            <div className="grid grid-cols-3 gap-2 sm:gap-3 xl:w-[440px]">

                                <StatCard
                                    label="Total"
                                    value={loading ? "—" : stats.total}
                                />

                                <StatCard
                                    label="Active"
                                    value={loading ? "—" : stats.active}
                                    accent
                                />

                                <StatCard
                                    label="Inactive"
                                    value={loading ? "—" : stats.inactive}
                                />

                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {/* =========================================================
                MAIN CONTENT
            ========================================================= */}

            <main className="max-w-[1500px] mx-auto px-5 sm:px-7 lg:px-10 py-8 lg:py-10">

                <div className="grid xl:grid-cols-[390px_1fr] gap-6 items-start">


                    {/* =================================================
                        ADD CHARITY
                    ================================================= */}

                    <section className="rounded-2xl border border-[#cfd4c8] bg-[#f8f7f1] overflow-hidden shadow-[0_12px_40px_rgba(16,24,19,0.05)]">

                        {/* Header */}

                        <div className="px-6 py-5 border-b border-[#cfd4c8] bg-[#dfe7dc]">

                            <div className="flex items-center justify-between">

                                <div className="flex items-center gap-3">

                                    <div className="w-10 h-10 rounded-xl bg-[#103523] text-[#8ee276] flex items-center justify-center text-lg font-bold">
                                        +
                                    </div>

                                    <div>

                                        <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#47775f]">
                                            New cause
                                        </p>

                                        <h2 className="mt-1 text-lg font-bold tracking-[-0.03em]">
                                            Add charity
                                        </h2>

                                    </div>

                                </div>

                                <span className="px-2.5 py-1 rounded-full bg-[#f3f1e8] text-[#687169] text-[9px] uppercase tracking-[0.12em] font-bold">
                                    Create
                                </span>

                            </div>

                        </div>


                        {/* Form */}

                        <form
                            onSubmit={addCharity}
                            className="p-6 space-y-5"
                        >

                            {/* Name */}

                            <FormField label="Charity name" required>

                                <input
                                    value={name}
                                    onChange={(e) =>
                                        setName(e.target.value)
                                    }
                                    placeholder="Example: Hope Foundation"
                                    className="admin-charity-input"
                                />

                            </FormField>


                            {/* Description */}

                            <FormField label="Description">

                                <textarea
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                    rows={4}
                                    placeholder="Describe the charity's impact..."
                                    className="admin-charity-input resize-none py-3"
                                />

                            </FormField>


                            {/* Website */}

                            <FormField label="Website">

                                <div className="relative">

                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-[#8a918b]">
                                        ↗
                                    </span>

                                    <input
                                        type="url"
                                        value={website}
                                        onChange={(e) =>
                                            setWebsite(e.target.value)
                                        }
                                        placeholder="https://example.org"
                                        className="admin-charity-input pl-9"
                                    />

                                </div>

                            </FormField>


                            {/* Active toggle */}

                            <label className="flex items-center justify-between gap-4 p-4 rounded-xl border border-[#cfd4c8] bg-[#f3f1e8] cursor-pointer hover:border-[#47775f] transition">

                                <div>

                                    <p className="text-sm font-semibold">
                                        Make charity active
                                    </p>

                                    <p className="mt-1 text-[10px] text-[#8a918b]">
                                        Active causes are visible to members.
                                    </p>

                                </div>

                                <div className="relative shrink-0">

                                    <input
                                        type="checkbox"
                                        checked={isActive}
                                        onChange={(e) =>
                                            setIsActive(
                                                e.target.checked
                                            )
                                        }
                                        className="sr-only peer"
                                    />

                                    <div className="w-11 h-6 rounded-full bg-[#cfd4c8] peer-checked:bg-[#47775f] transition" />

                                    <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow-sm transition peer-checked:translate-x-5" />

                                </div>

                            </label>


                            {/* Submit */}

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full h-12 rounded-xl bg-[#103523] text-[#8ee276] border border-[#103523] text-sm font-bold transition-all duration-200 hover:bg-[#47775f] hover:text-white hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(16,53,35,0.18)] disabled:opacity-50 disabled:hover:translate-y-0"
                            >

                                {saving ? (
                                    <span className="flex items-center justify-center gap-2">

                                        <span className="w-4 h-4 rounded-full border-2 border-[#8ee276]/30 border-t-[#8ee276] animate-spin" />

                                        Adding...

                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        Add charity
                                        <span className="text-base">
                                            →
                                        </span>
                                    </span>
                                )}

                            </button>

                        </form>

                    </section>


                    {/* =================================================
                        CHARITY DIRECTORY
                    ================================================= */}

                    <section className="rounded-2xl border border-[#cfd4c8] bg-[#f8f7f1] overflow-hidden shadow-[0_12px_40px_rgba(16,24,19,0.05)]">


                        {/* Directory header */}

                        <div className="px-6 sm:px-7 py-5 border-b border-[#cfd4c8] bg-[#f3f1e8]">

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                                <div>

                                    <div className="flex items-center gap-2">

                                        <span className="w-1.5 h-1.5 rounded-full bg-[#8ee276]" />

                                        <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#47775f]">
                                            Charity directory
                                        </p>

                                    </div>

                                    <h2 className="mt-1 text-xl font-bold tracking-[-0.035em]">
                                        Participating causes
                                    </h2>

                                </div>

                                <div className="flex items-center gap-2">

                                    <span className="px-3 py-1.5 rounded-full bg-[#dfe7dc] text-[#47775f] text-[10px] font-bold">
                                        {stats.active} active
                                    </span>

                                    <span className="px-3 py-1.5 rounded-full bg-[#e7ebe3] text-[#687169] text-[10px] font-bold">
                                        {stats.total} total
                                    </span>

                                </div>

                            </div>

                        </div>


                        {/* Directory content */}

                        <div className="p-5 sm:p-6">

                            {loading ? (

                                <LoadingState />

                            ) : charities.length === 0 ? (

                                <EmptyState />

                            ) : (

                                <div className="space-y-3">

                                    {charities.map((charity, index) => (

                                        <CharityCard
                                            key={charity.id}
                                            charity={charity}
                                            index={index}
                                            onToggle={toggleCharity}
                                        />

                                    ))}

                                </div>

                            )}

                        </div>

                    </section>

                </div>


                {/* =====================================================
                    IMPACT FOOTER
                ===================================================== */}

                <section className="mt-6 rounded-2xl bg-[#103523] text-white overflow-hidden">

                    <div className="p-7 sm:p-9">

                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

                            <div className="max-w-2xl">

                                <div className="flex items-center gap-2 mb-4">

                                    <span className="w-2 h-2 rounded-full bg-[#8ee276]" />

                                    <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#8ee276]">
                                        Impact control
                                    </p>

                                </div>

                                <h2 className="text-2xl sm:text-3xl font-bold tracking-[-0.04em]">
                                    Keep every cause visible,
                                    <span className="text-[#8ee276]">
                                        {" "}current and ready.
                                    </span>
                                </h2>

                                <p className="mt-4 text-sm text-white/55 leading-6 max-w-xl">
                                    Only active charities are presented to
                                    members when they choose where their
                                    contribution should go.
                                </p>

                            </div>


                            <div className="grid grid-cols-2 gap-3 lg:w-[280px]">

                                <ImpactStat
                                    value={stats.active}
                                    label="Active causes"
                                />

                                <ImpactStat
                                    value={stats.inactive}
                                    label="Hidden causes"
                                />

                            </div>

                        </div>

                    </div>

                </section>

            </main>


            {/* =========================================================
                STYLES
            ========================================================= */}

            <style>{`

                .admin-charity-input {
                    width: 100%;
                    min-height: 48px;
                    border-radius: 12px;
                    border: 1px solid #cfd4c8;
                    background: #f3f1e8;
                    padding: 0 16px;
                    font-size: 13px;
                    color: #101813;
                    outline: none;
                    transition: all 0.2s ease;
                }

                .admin-charity-input:focus {
                    border-color: #47775f;
                    background: #f8f7f1;
                    box-shadow: 0 0 0 3px rgba(71,119,95,0.08);
                }

                .admin-charity-input::placeholder {
                    color: #9a9f98;
                }

            `}</style>

        </div>
    );
}


/* =============================================================
   STAT CARD
============================================================= */

function StatCard({ label, value, accent = false }) {

    return (
        <div className="rounded-xl border border-white/10 bg-white/[0.045] px-4 py-4">

            <p className="text-[9px] uppercase tracking-[0.16em] text-white/40 font-bold">
                {label}
            </p>

            <p
                className={`mt-2 text-2xl sm:text-3xl font-bold tracking-[-0.04em] ${
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
   FORM FIELD
============================================================= */

function FormField({ label, required, children }) {

    return (
        <div>

            <div className="flex items-center justify-between mb-2">

                <label className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#687169]">
                    {label}
                </label>

                {required && (
                    <span className="text-[9px] text-[#8a918b]">
                        Required
                    </span>
                )}

            </div>

            {children}

        </div>
    );
}


/* =============================================================
   CHARITY CARD
============================================================= */

function CharityCard({
    charity,
    index,
    onToggle,
}) {

    return (
        <article
            className={`rounded-xl border p-5 sm:p-6 transition-all duration-200 ${
                charity.active
                    ? "border-[#cfd4c8] bg-[#f8f7f1] hover:border-[#9eae9f] hover:shadow-[0_8px_25px_rgba(16,24,19,0.05)]"
                    : "border-[#d8d5d0] bg-[#efede7] opacity-80"
            }`}
        >

            <div className="flex flex-col lg:flex-row lg:items-center gap-5">


                {/* Number */}

                <div className="hidden sm:flex w-10 h-10 shrink-0 rounded-lg bg-[#dfe7dc] text-[#47775f] items-center justify-center text-[10px] font-bold">
                    {String(index + 1).padStart(2, "0")}
                </div>


                {/* Main content */}

                <div className="flex-1 min-w-0">

                    <div className="flex flex-wrap items-center gap-2.5">

                        <h3 className="text-lg font-bold tracking-[-0.025em]">
                            {charity.name}
                        </h3>

                        <StatusBadge active={charity.active} />

                    </div>

                    <p className="mt-2 text-sm text-[#687169] leading-6 max-w-2xl">
                        {charity.description ||
                            "No description provided."}
                    </p>


                    <div className="flex flex-wrap items-center gap-4 mt-4">

                        {charity.website && (
                            <a
                                href={charity.website}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#47775f] hover:text-[#103523] transition"
                            >
                                Visit website
                                <span>↗</span>
                            </a>
                        )}

                        <span className="text-[10px] text-[#a0a59f]">
                            ID · {charity.id?.slice(0, 8)}
                        </span>

                    </div>

                </div>


                {/* Action */}

                <button
                    onClick={() => onToggle(charity)}
                    className={`shrink-0 h-10 px-5 rounded-lg text-xs font-bold transition-all ${
                        charity.active
                            ? "border border-[#c9aaa5] bg-[#f8f7f1] text-[#8a625d] hover:bg-[#ebe6e2]"
                            : "bg-[#47775f] text-white hover:bg-[#38644f] hover:-translate-y-0.5"
                    }`}
                >
                    {charity.active
                        ? "Deactivate"
                        : "Activate"}
                </button>

            </div>

        </article>
    );
}


/* =============================================================
   STATUS BADGE
============================================================= */

function StatusBadge({ active }) {

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] uppercase tracking-[0.12em] font-bold ${
                active
                    ? "bg-[#dfe7dc] text-[#47775f]"
                    : "bg-[#ebe6e2] text-[#8a625d]"
            }`}
        >

            <span
                className={`w-1.5 h-1.5 rounded-full ${
                    active
                        ? "bg-[#47775f]"
                        : "bg-[#8a625d]"
                }`}
            />

            {active ? "Active" : "Inactive"}

        </span>
    );
}


/* =============================================================
   LOADING
============================================================= */

function LoadingState() {

    return (
        <div className="rounded-xl border border-[#cfd4c8] bg-[#f3f1e8] py-16 text-center">

            <div className="mx-auto w-7 h-7 rounded-full border-2 border-[#cfd4c8] border-t-[#47775f] animate-spin" />

            <p className="mt-4 text-xs uppercase tracking-[0.14em] font-bold text-[#8a918b]">
                Loading directory
            </p>

        </div>
    );
}


/* =============================================================
   EMPTY STATE
============================================================= */

function EmptyState() {

    return (
        <div className="rounded-xl border border-dashed border-[#cfd4c8] bg-[#f3f1e8] py-16 px-6 text-center">

            <div className="mx-auto w-12 h-12 rounded-xl bg-[#dfe7dc] text-[#47775f] flex items-center justify-center text-xl font-bold">
                +
            </div>

            <p className="mt-5 text-[9px] uppercase tracking-[0.18em] font-bold text-[#8a918b]">
                Directory empty
            </p>

            <h3 className="mt-2 text-xl font-bold tracking-[-0.03em]">
                No charities yet
            </h3>

            <p className="mt-2 text-sm text-[#687169]">
                Add the first participating charity using the form.
            </p>

        </div>
    );
}


/* =============================================================
   IMPACT STAT
============================================================= */

function ImpactStat({ value, label }) {

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