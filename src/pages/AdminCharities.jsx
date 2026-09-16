import { useEffect, useState } from "react";
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

   return (
    <div className="min-h-screen bg-[#f3f1e8] text-[#101813]">

    
        <main>

            {/* Hero */}
            <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16 md:py-24 border-b border-[#cfd4c8]">

                <div className="grid lg:grid-cols-[1fr_300px] gap-12 lg:gap-20 items-end">

                    <div className="max-w-4xl">

                        <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#47775f]">
                            § 01 · Charity management
                        </p>

                        <h1 className="mt-6 text-5xl md:text-7xl font-semibold tracking-[-0.05em] leading-[0.92]">
                            Manage the
                            <span className="block text-[#47775f]">
                                causes we support.
                            </span>
                        </h1>

                        <p className="mt-8 text-[#687169] text-base md:text-lg leading-7 max-w-2xl">
                            Add participating charities, update their
                            availability and keep the member charity
                            directory current.
                        </p>

                    </div>

                    <div className="border-l border-[#cfd4c8] pl-6">

                        <p className="text-xs uppercase tracking-[0.16em] text-[#8a918b]">
                            Total charities
                        </p>

                        <p className="mt-3 text-5xl font-semibold tracking-[-0.04em] text-[#47775f]">
                            {loading ? "—" : charities.length}
                        </p>

                        <p className="mt-3 text-sm leading-6 text-[#687169]">
                            Causes currently recorded in the
                            platform.
                        </p>

                    </div>

                </div>

            </section>

            {/* Management area */}
            <section className="max-w-7xl mx-auto px-6 lg:px-10 py-14 md:py-20">

                <div className="mb-10">

                    <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#47775f]">
                        § 02 · Manage causes
                    </p>

                    <h2 className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight">
                        Add and maintain charities.
                    </h2>

                </div>

                <div className="grid lg:grid-cols-[380px_1fr] gap-px bg-[#cfd4c8] border border-[#cfd4c8]">

                    {/* Add Charity */}
                    <div className="bg-[#dfe5da] p-7 md:p-8 h-fit">

                        <div className="flex items-start justify-between">

                            <div>
                                <p className="text-xs uppercase tracking-[0.16em] text-[#8a918b]">
                                    01 · New cause
                                </p>

                                <h2 className="mt-3 text-2xl font-semibold">
                                    Add charity
                                </h2>
                            </div>

                            <span className="text-xl text-[#47775f]">
                                +
                            </span>

                        </div>

                        <form
                            onSubmit={addCharity}
                            className="space-y-5 mt-8"
                        >

                            <div>
                                <label className="block text-xs uppercase tracking-[0.14em] text-[#687169] mb-2">
                                    Charity name
                                </label>

                                <input
                                    value={name}
                                    onChange={(e) =>
                                        setName(e.target.value)
                                    }
                                    placeholder="Example: Hope Foundation"
                                    className="w-full bg-[#f8f7f1] border border-[#cfd4c8] px-4 py-3 text-sm text-[#101813] placeholder:text-[#9a9f98] outline-none focus:border-[#47775f] transition"
                                />
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-[0.14em] text-[#687169] mb-2">
                                    Description
                                </label>

                                <textarea
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(
                                            e.target.value
                                        )
                                    }
                                    rows="4"
                                    placeholder="Describe the charity's impact..."
                                    className="w-full bg-[#f8f7f1] border border-[#cfd4c8] px-4 py-3 text-sm text-[#101813] placeholder:text-[#9a9f98] outline-none focus:border-[#47775f] transition resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-[0.14em] text-[#687169] mb-2">
                                    Website
                                </label>

                                <input
                                    type="url"
                                    value={website}
                                    onChange={(e) =>
                                        setWebsite(
                                            e.target.value
                                        )
                                    }
                                    placeholder="https://example.org"
                                    className="w-full bg-[#f8f7f1] border border-[#cfd4c8] px-4 py-3 text-sm text-[#101813] placeholder:text-[#9a9f98] outline-none focus:border-[#47775f] transition"
                                />
                            </div>

                            <label className="flex items-center gap-3 text-sm text-[#687169] cursor-pointer">

                                <input
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={(e) =>
                                        setIsActive(
                                            e.target.checked
                                        )
                                    }
                                    className="w-4 h-4 accent-[#47775f]"
                                />

                                Make this charity active

                            </label>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full mt-3 bg-[#47775f] hover:bg-[#38644f] text-white font-semibold py-3.5 text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving
                                    ? "Adding..."
                                    : "Add Charity →"}
                            </button>

                        </form>

                    </div>

                    {/* Charity List */}
                    <div className="bg-[#f8f7f1] p-7 md:p-8">

                        <div className="flex items-end justify-between gap-5 mb-7">

                            <div>
                                <p className="text-xs uppercase tracking-[0.16em] text-[#8a918b]">
                                    02 · Directory
                                </p>

                                <h2 className="mt-2 text-2xl font-semibold">
                                    Participating causes
                                </h2>
                            </div>

                            <span className="text-xs text-[#8a918b]">
                                {charities.length} total
                            </span>

                        </div>

                        {loading ? (

                            <div className="border border-[#cfd4c8] px-6 py-14 text-center">
                                <p className="text-sm text-[#687169]">
                                    Loading charities...
                                </p>
                            </div>

                        ) : charities.length === 0 ? (

                            <div className="border border-[#cfd4c8] px-6 py-14 text-center">

                                <p className="text-xs uppercase tracking-[0.16em] text-[#8a918b]">
                                    Directory empty
                                </p>

                                <h3 className="mt-3 text-xl font-semibold">
                                    No charities yet
                                </h3>

                                <p className="mt-2 text-sm text-[#687169]">
                                    Add the first participating charity
                                    using the form.
                                </p>

                            </div>

                        ) : (

                            <div className="space-y-px bg-[#cfd4c8] border border-[#cfd4c8]">

                                {charities.map((charity, index) => (

                                    <div
                                        key={charity.id}
                                        className="bg-[#f8f7f1] p-6 md:p-7 hover:bg-[#e7ebe3] transition"
                                    >

                                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">

                                            <div className="flex gap-5">

                                                <span className="text-xs tracking-[0.16em] text-[#8a918b] pt-1">
                                                    {String(index + 1).padStart(2, "0")}
                                                </span>

                                                <div>

                                                    <div className="flex flex-wrap items-center gap-3">

                                                        <h3 className="text-xl font-semibold tracking-tight">
                                                            {charity.name}
                                                        </h3>

                                                        <span
                                                            className={`px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] font-semibold ${
                                                                charity.active
                                                                    ? "bg-[#dfe5da] text-[#47775f]"
                                                                    : "bg-[#ebe6e2] text-[#8a625d]"
                                                            }`}
                                                        >
                                                            {charity.active
                                                                ? "Active"
                                                                : "Inactive"}
                                                        </span>

                                                    </div>

                                                    <p className="text-sm text-[#687169] mt-3 leading-6 max-w-xl">
                                                        {charity.description ||
                                                            "No description provided."}
                                                    </p>

                                                    {charity.website && (
                                                        <a
                                                            href={charity.website}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-block mt-4 text-sm font-semibold text-[#47775f] hover:text-[#38644f] transition"
                                                        >
                                                            Visit website →
                                                        </a>
                                                    )}

                                                </div>

                                            </div>

                                            <button
                                                onClick={() =>
                                                    toggleCharity(
                                                        charity
                                                    )
                                                }
                                                className={`shrink-0 px-5 py-2.5 text-sm font-semibold transition ${
                                                    charity.active
                                                        ? "border border-[#c7aaa5] text-[#8a625d] hover:bg-[#ebe6e2]"
                                                        : "bg-[#47775f] text-white hover:bg-[#38644f]"
                                                }`}
                                            >
                                                {charity.active
                                                    ? "Deactivate"
                                                    : "Activate"}
                                            </button>

                                        </div>

                                    </div>

                                ))}

                            </div>

                        )}

                    </div>

                </div>

            </section>

            {/* Impact note */}
            <section className="border-y border-[#cfd4c8] bg-[#dfe5da]">

                <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14 md:py-18">

                    <div className="grid md:grid-cols-[220px_1fr] gap-10 md:gap-16">

                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#47775f]">
                                § 03 · Impact
                            </p>
                        </div>

                        <div className="max-w-4xl">

                            <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.04em] leading-tight">
                                Keep every cause
                                <span className="text-[#47775f]">
                                    {" "}visible and current.
                                </span>
                            </h2>

                            <p className="mt-6 text-[#687169] text-base md:text-lg leading-7 max-w-2xl">
                                Active charities are available to members
                                when they choose where their contribution
                                should go.
                            </p>

                        </div>

                    </div>

                </div>

            </section>

        </main>


    </div>
);
}