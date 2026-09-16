import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
    const { profile } = useAuth();
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        users: 0,
        activeSubscriptions: 0,
        charities: 0,
        publishedDraws: 0,
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    async function fetchStats() {
        setLoading(true);

        try {
            const [
                usersResult,
                subscriptionsResult,
                charitiesResult,
                drawsResult,
            ] = await Promise.all([
                supabase
                    .from("profiles")
                    .select("*", { count: "exact", head: true }),

                supabase
                    .from("subscriptions")
                    .select("*", { count: "exact", head: true })
                    .eq("status", "active"),

                supabase
                    .from("charities")
                    .select("*", { count: "exact", head: true })
                    .eq("active", true),

                supabase
                    .from("draws")
                    .select("*", { count: "exact", head: true })
                    .eq("status", "published"),
            ]);

            if (usersResult.error) {
                throw usersResult.error;
            }

            if (subscriptionsResult.error) {
                throw subscriptionsResult.error;
            }

            if (charitiesResult.error) {
                throw charitiesResult.error;
            }

            if (drawsResult.error) {
                throw drawsResult.error;
            }

            setStats({
                users: usersResult.count || 0,
                activeSubscriptions:
                    subscriptionsResult.count || 0,
                charities: charitiesResult.count || 0,
                publishedDraws: drawsResult.count || 0,
            });
        } catch (error) {
            console.error("Failed to load admin stats:", error);
        } finally {
            setLoading(false);
        }
    }

   return (
    <div className="min-h-screen bg-[#f3f1e8] text-[#101813]">

   

        <main>

            {/* Hero */}
            <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16 md:py-24 border-b border-[#cfd4c8]">

                <div className="grid lg:grid-cols-[1fr_300px] gap-12 lg:gap-20 items-end">

                    <div className="max-w-4xl">

                        <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#47775f]">
                            § 01 · Admin control
                        </p>

                        <h1 className="mt-6 text-5xl md:text-7xl font-semibold tracking-[-0.05em] leading-[0.92]">
                            Welcome,
                            <span className="block text-[#47775f]">
                                {profile?.full_name || "Admin"}.
                            </span>
                        </h1>

                        <p className="mt-8 text-[#687169] text-base md:text-lg leading-7 max-w-2xl">
                            Manage the Digital Heroes community, monitor
                            subscriptions, operate monthly draws and
                            review charitable activity from one place.
                        </p>

                    </div>

                    <div className="border-l border-[#cfd4c8] pl-6">

                        <p className="text-xs uppercase tracking-[0.16em] text-[#8a918b]">
                            Control centre
                        </p>

                        <p className="mt-3 text-5xl font-semibold tracking-[-0.04em] text-[#47775f]">
                            04
                        </p>

                        <p className="mt-3 text-sm leading-6 text-[#687169]">
                            Core areas available for platform
                            administration.
                        </p>

                    </div>

                </div>

            </section>

            {/* Statistics */}
            <section className="max-w-7xl mx-auto px-6 lg:px-10 py-14 md:py-20">

                <div className="mb-9">

                    <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#47775f]">
                        § 02 · Platform overview
                    </p>

                    <h2 className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight">
                        Current platform activity.
                    </h2>

                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#cfd4c8] border border-[#cfd4c8]">

                    {/* Users */}
                    <div className="bg-[#f8f7f1] p-7 md:p-8 min-h-[190px] flex flex-col justify-between">

                        <div className="flex items-start justify-between">

                            <p className="text-xs uppercase tracking-[0.16em] text-[#8a918b]">
                                01 · Users
                            </p>

                            <span className="text-[#47775f]">
                                +
                            </span>

                        </div>

                        <p className="mt-10 text-4xl md:text-5xl font-semibold tracking-[-0.04em]">
                            {loading ? "—" : stats.users}
                        </p>

                    </div>

                    {/* Subscriptions */}
                    <div className="bg-[#f8f7f1] p-7 md:p-8 min-h-[190px] flex flex-col justify-between">

                        <div className="flex items-start justify-between">

                            <p className="text-xs uppercase tracking-[0.16em] text-[#8a918b]">
                                02 · Subscriptions
                            </p>

                            <span className="text-[#47775f]">
                                +
                            </span>

                        </div>

                        <p className="mt-10 text-4xl md:text-5xl font-semibold tracking-[-0.04em]">
                            {loading
                                ? "—"
                                : stats.activeSubscriptions}
                        </p>

                    </div>

                    {/* Charities */}
                    <div className="bg-[#f8f7f1] p-7 md:p-8 min-h-[190px] flex flex-col justify-between">

                        <div className="flex items-start justify-between">

                            <p className="text-xs uppercase tracking-[0.16em] text-[#8a918b]">
                                03 · Charities
                            </p>

                            <span className="text-[#47775f]">
                                +
                            </span>

                        </div>

                        <p className="mt-10 text-4xl md:text-5xl font-semibold tracking-[-0.04em]">
                            {loading ? "—" : stats.charities}
                        </p>

                    </div>

                    {/* Draws */}
                    <div className="bg-[#dfe5da] p-7 md:p-8 min-h-[190px] flex flex-col justify-between">

                        <div className="flex items-start justify-between">

                            <p className="text-xs uppercase tracking-[0.16em] text-[#8a918b]">
                                04 · Published draws
                            </p>

                            <span className="text-[#47775f]">
                                +
                            </span>

                        </div>

                        <p className="mt-10 text-4xl md:text-5xl font-semibold tracking-[-0.04em] text-[#47775f]">
                            {loading ? "—" : stats.publishedDraws}
                        </p>

                    </div>

                </div>

            </section>

            {/* Management */}
            <section className="border-y border-[#cfd4c8] bg-[#e7ebe3]">

                <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14 md:py-20">

                    <div className="grid md:grid-cols-[220px_1fr] gap-10 md:gap-16">

                        <div>

                            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#47775f]">
                                § 03 · Management
                            </p>

                            <p className="mt-4 text-sm leading-6 text-[#687169]">
                                Platform operations and administrative
                                controls.
                            </p>

                        </div>

                        <div className="grid sm:grid-cols-2 gap-px bg-[#cfd4c8] border border-[#cfd4c8]">

                            <AdminCard
                                title="Users"
                                description="View subscribers and account details."
                                onClick={() => navigate("/admin/users")}
                            />

                            <AdminCard
                                title="Draws"
                                description="Create, simulate and publish monthly draws."
                                onClick={() => navigate("/admin/draws")}
                            />

                            <AdminCard
                                title="Charities"
                                description="Manage supported charities and their availability."
                                onClick={() => navigate("/admin/charities")}
                            />

                            <AdminCard
                                title="Winners"
                                description="Verify winners, review proof and manage payouts."
                                onClick={() => navigate("/admin/winners")}
                            />

                        </div>

                    </div>

                </div>

            </section>

            {/* Operational statement */}
            <section className="max-w-7xl mx-auto px-6 lg:px-10 py-20 md:py-28">

                <div className="border-t border-b border-[#cfd4c8] py-14 md:py-18">

                    <div className="max-w-4xl">

                        <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#47775f]">
                            § 04 · Platform principle
                        </p>

                        <h2 className="mt-5 text-4xl md:text-6xl font-semibold tracking-[-0.04em] leading-[0.95]">
                            Every draw.
                            <span className="block text-[#47775f]">
                                Every contribution.
                            </span>
                            Every winner.
                        </h2>

                        <p className="mt-7 text-[#687169] text-base md:text-lg leading-7 max-w-2xl">
                            Keep the platform transparent, maintain accurate
                            records and make every stage of the member journey
                            easy to manage.
                        </p>

                    </div>

                </div>

            </section>

        </main>

 

    </div>
);
}

function AdminCard({ title, description, onClick }) {
    return (
        <div className="bg-[#f8f7f1] p-7 md:p-8 min-h-[230px] flex flex-col hover:bg-[#dfe5da] transition">

            <div>

                <div className="flex items-start justify-between">

                    <p className="text-xs uppercase tracking-[0.16em] text-[#8a918b]">
                        Admin module
                    </p>

                    <span className="text-lg text-[#47775f]">
                        +
                    </span>

                </div>

                <h3 className="mt-8 text-2xl font-semibold tracking-tight">
                    {title}
                </h3>

                <p className="mt-3 text-sm text-[#687169] leading-6 max-w-sm">
                    {description}
                </p>

            </div>

            {/* Button with clear spacing */}
            <button
                onClick={onClick}
                className="mt-10 self-start px-5 py-2.5 bg-[#47775f] text-white text-sm font-semibold hover:bg-[#38644f] transition"
            >
                Manage {title} →
            </button>

        </div>
    );
}