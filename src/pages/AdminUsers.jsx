import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    async function fetchUsers() {
        setLoading(true);

        const { data: profiles, error } = await supabase
            .from("profiles")
            .select(`
                id,
                full_name,
                email,
                role,
                charity_percentage,
                charity_id,
                created_at
            `)
            .order("created_at", {
                ascending: false,
            });

        if (error) {
            console.error(error);
            alert(error.message);
            setLoading(false);
            return;
        }

        const { data: subscriptions, error: subscriptionError } =
            await supabase
                .from("subscriptions")
                .select(
                    "user_id, plan, status, current_period_end"
                );

        if (subscriptionError) {
            console.error(subscriptionError);
        }

        const { data: charities, error: charityError } =
            await supabase
                .from("charities")
                .select("id, name");

        if (charityError) {
            console.error(charityError);
        }

        const subscriptionMap = {};

        (subscriptions || []).forEach((subscription) => {
            subscriptionMap[subscription.user_id] =
                subscription;
        });

        const charityMap = {};

        (charities || []).forEach((charity) => {
            charityMap[charity.id] = charity.name;
        });

        const formattedUsers = (profiles || []).map((profile) => ({
            ...profile,
            subscription:
                subscriptionMap[profile.id] || null,
            charityName:
                charityMap[profile.charity_id] ||
                "Not selected",
        }));

        setUsers(formattedUsers);
        setLoading(false);
    }

  return (
    <div className="min-h-screen bg-[#f3f1e8] text-[#101813]">

       

        <main>

            {/* Hero */}
            <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16 md:py-24 border-b border-[#cfd4c8]">

                <div className="grid lg:grid-cols-[1fr_300px] gap-12 lg:gap-20 items-end">

                    <div className="max-w-4xl">

                        <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#47775f]">
                            § 01 · Community
                        </p>

                        <h1 className="mt-6 text-5xl md:text-7xl font-semibold tracking-[-0.05em] leading-[0.92]">
                            Understand the
                            <span className="block text-[#47775f]">
                                people behind the platform.
                            </span>
                        </h1>

                        <p className="mt-8 text-[#687169] text-base md:text-lg leading-7 max-w-2xl">
                            Review registered members, their subscription
                            status, selected charity and contribution
                            preferences.
                        </p>

                    </div>

                    <div className="border-l border-[#cfd4c8] pl-6">

                        <p className="text-xs uppercase tracking-[0.16em] text-[#8a918b]">
                            Registered users
                        </p>

                        <p className="mt-3 text-5xl font-semibold tracking-[-0.04em] text-[#47775f]">
                            {loading ? "—" : users.length}
                        </p>

                        <p className="mt-3 text-sm leading-6 text-[#687169]">
                            Members currently recorded in the
                            Digital Heroes platform.
                        </p>

                    </div>

                </div>

            </section>

            {/* Users */}
            <section className="max-w-7xl mx-auto px-6 lg:px-10 py-14 md:py-20">

                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-10">

                    <div>

                        <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#47775f]">
                            § 02 · Member directory
                        </p>

                        <h2 className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight">
                            Registered users.
                        </h2>

                    </div>

                    <p className="text-sm text-[#8a918b]">
                        {users.length} {users.length === 1 ? "member" : "members"}
                    </p>

                </div>

                {loading ? (

                    <div className="border border-[#cfd4c8] bg-[#f8f7f1] px-6 py-16 text-center">

                        <p className="text-sm text-[#687169]">
                            Loading users...
                        </p>

                    </div>

                ) : users.length === 0 ? (

                    <div className="border border-[#cfd4c8] bg-[#f8f7f1] px-6 py-16 text-center">

                        <p className="text-xs uppercase tracking-[0.16em] text-[#8a918b]">
                            Directory empty
                        </p>

                        <h2 className="mt-3 text-xl font-semibold">
                            No users found
                        </h2>

                        <p className="mt-2 text-sm text-[#687169]">
                            Registered members will appear here.
                        </p>

                    </div>

                ) : (

                    <div className="border border-[#cfd4c8] overflow-x-auto bg-[#f8f7f1]">

                        <table className="w-full text-left min-w-[950px]">

                            <thead>

                                <tr className="border-b border-[#cfd4c8] bg-[#e7ebe3]">

                                    <th className="px-6 py-4 text-[10px] uppercase tracking-[0.16em] font-semibold text-[#687169]">
                                        User
                                    </th>

                                    <th className="px-6 py-4 text-[10px] uppercase tracking-[0.16em] font-semibold text-[#687169]">
                                        Role
                                    </th>

                                    <th className="px-6 py-4 text-[10px] uppercase tracking-[0.16em] font-semibold text-[#687169]">
                                        Subscription
                                    </th>

                                    <th className="px-6 py-4 text-[10px] uppercase tracking-[0.16em] font-semibold text-[#687169]">
                                        Charity
                                    </th>

                                    <th className="px-6 py-4 text-[10px] uppercase tracking-[0.16em] font-semibold text-[#687169]">
                                        Contribution
                                    </th>

                                    <th className="px-6 py-4 text-[10px] uppercase tracking-[0.16em] font-semibold text-[#687169]">
                                        Joined
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {users.map((user, index) => (

                                    <tr
                                        key={user.id}
                                        className="border-b border-[#cfd4c8] last:border-b-0 hover:bg-[#e7ebe3] transition"
                                    >

                                        {/* User */}
                                        <td className="px-6 py-6">

                                            <div className="flex items-start gap-4">

                                                <span className="text-xs tracking-[0.16em] text-[#8a918b] pt-1">
                                                    {String(index + 1).padStart(2, "0")}
                                                </span>

                                                <div>

                                                    <p className="font-semibold">
                                                        {user.full_name ||
                                                            "Unnamed user"}
                                                    </p>

                                                    <p className="text-sm text-[#8a918b] mt-1">
                                                        {user.email}
                                                    </p>

                                                </div>

                                            </div>

                                        </td>

                                        {/* Role */}
                                        <td className="px-6 py-6">

                                            <span
                                                className={`inline-block px-3 py-1 text-[10px] uppercase tracking-[0.12em] font-semibold ${
                                                    user.role === "admin"
                                                        ? "bg-[#dfe5da] text-[#47775f]"
                                                        : "bg-[#ebece7] text-[#687169]"
                                                }`}
                                            >
                                                {user.role}
                                            </span>

                                        </td>

                                        {/* Subscription */}
                                        <td className="px-6 py-6">

                                            {user.subscription ? (

                                                <div>

                                                    <span
                                                        className={`inline-block px-3 py-1 text-[10px] uppercase tracking-[0.12em] font-semibold ${
                                                            user.subscription.status ===
                                                            "active"
                                                                ? "bg-[#dfe5da] text-[#47775f]"
                                                                : "bg-[#ebe6e2] text-[#8a625d]"
                                                        }`}
                                                    >
                                                        {
                                                            user
                                                                .subscription
                                                                .status
                                                        }
                                                    </span>

                                                    <p className="text-xs text-[#8a918b] mt-2 capitalize">
                                                        {
                                                            user
                                                                .subscription
                                                                .plan
                                                        }
                                                    </p>

                                                </div>

                                            ) : (

                                                <span className="text-sm text-[#8a918b]">
                                                    No subscription
                                                </span>

                                            )}

                                        </td>

                                        {/* Charity */}
                                        <td className="px-6 py-6">

                                            <p className="text-sm font-medium">
                                                {user.charityName}
                                            </p>

                                        </td>

                                        {/* Contribution */}
                                        <td className="px-6 py-6">

                                            <div className="flex items-center gap-3">

                                                <span className="text-lg font-semibold text-[#47775f]">
                                                    {user.charity_percentage}%
                                                </span>

                                                <span className="text-[10px] uppercase tracking-[0.12em] text-[#8a918b]">
                                                    contribution
                                                </span>

                                            </div>

                                        </td>

                                        {/* Joined */}
                                        <td className="px-6 py-6">

                                            <p className="text-sm text-[#687169]">
                                                {user.created_at
                                                    ? new Date(
                                                          user.created_at
                                                      ).toLocaleDateString()
                                                    : "-"}
                                            </p>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>

            {/* Summary */}
            <section className="border-y border-[#cfd4c8] bg-[#dfe5da]">

                <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14 md:py-18">

                    <div className="grid md:grid-cols-[220px_1fr] gap-10 md:gap-16">

                        <div>

                            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#47775f]">
                                § 03 · Member data
                            </p>

                        </div>

                        <div className="max-w-4xl">

                            <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.04em] leading-tight">
                                One view of
                                <span className="text-[#47775f]">
                                    {" "}membership and impact.
                                </span>
                            </h2>

                            <p className="mt-6 text-[#687169] text-base md:text-lg leading-7 max-w-2xl">
                                Subscription activity and charity preferences
                                help administrators understand how members
                                participate in the platform.
                            </p>

                        </div>

                    </div>

                </div>

            </section>

        </main>



    </div>
);
}