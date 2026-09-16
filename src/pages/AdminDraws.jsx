import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
    calculateDrawResults,
    saveDrawResults,
    publishDraw,
    simulateDraw as simulateDrawService,
} from "../services/drawService";

export default function AdminDraws() {
    const [draws, setDraws] = useState([]);

    const [drawMonth, setDrawMonth] = useState("");
    const [drawType, setDrawType] = useState("random");
    const [prizePool, setPrizePool] = useState("");

    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [simulating, setSimulating] = useState(null);
    const [calculating, setCalculating] = useState(null);
    const [savingResults, setSavingResults] = useState(null);
    const [publishing, setPublishing] = useState(null);

    const [results, setResults] = useState({});

    useEffect(() => {
        fetchDraws();
    }, []);

    // --------------------------------------------------
    // FETCH DRAWS
    // --------------------------------------------------

    async function fetchDraws() {
        setLoading(true);

        try {
            const { data, error } = await supabase
                .from("draws")
                .select("*")
                .order("draw_year", {
                    ascending: false,
                })
                .order("draw_month", {
                    ascending: false,
                });

            if (error) {
                throw error;
            }

            setDraws(data || []);
        } catch (error) {
            console.error("Fetch draws error:", error);
        } finally {
            setLoading(false);
        }
    }

    // --------------------------------------------------
    // CREATE DRAW
    // --------------------------------------------------

    async function createDrawHandler(e) {
        e.preventDefault();

        if (!drawMonth) {
            alert("Please select a draw month.");
            return;
        }

        const [year, month] = drawMonth.split("-");

        const drawYear = Number(year);
        const drawMonthNumber = Number(month);

        if (
            !drawYear ||
            !drawMonthNumber ||
            drawMonthNumber < 1 ||
            drawMonthNumber > 12
        ) {
            alert("Invalid draw month.");
            return;
        }

        const pool = Number(prizePool);

        if (!Number.isFinite(pool) || pool < 0) {
            alert("Please enter a valid prize pool.");
            return;
        }

        setCreating(true);

        try {
            // Check duplicate month
            const {
                data: existingDraw,
                error: checkError,
            } = await supabase
                .from("draws")
                .select("id")
                .eq("draw_year", drawYear)
                .eq("draw_month", drawMonthNumber)
                .maybeSingle();

            if (checkError) {
                throw checkError;
            }

            if (existingDraw) {
                alert(
                    "A draw already exists for this month."
                );
                return;
            }

            const { error } = await supabase
                .from("draws")
                .insert({
                    draw_month: drawMonthNumber,
                    draw_year: drawYear,
                    draw_type: drawType,
                    status: "draft",
                    prize_pool: pool,
                    jackpot_amount: 0,
                });

            if (error) {
                throw error;
            }

            alert("Monthly draw created successfully.");

            setDrawMonth("");
            setDrawType("random");
            setPrizePool("");

            await fetchDraws();
        } catch (error) {
            console.error("Create draw error:", error);
            alert(error.message);
        } finally {
            setCreating(false);
        }
    }

    // --------------------------------------------------
    // SIMULATE
    // --------------------------------------------------

   async function simulateDraw(draw) {
    if (draw.status !== "draft") {
        alert(
            "Only draft draws can be simulated."
        );
        return;
    }

    setSimulating(draw.id);

    try {
        const simulatedDraw =
            await simulateDrawService(
                draw.id,
                draw.draw_type
            );

        alert(
            `Draw simulated.\n\nWinning numbers: ${simulatedDraw.winning_numbers.join(
                ", "
            )}`
        );

        await fetchDraws();
    } catch (error) {
        console.error(
            "Simulate draw error:",
            error
        );

        alert(error.message);
    } finally {
        setSimulating(null);
    }
}

    // --------------------------------------------------
    // CALCULATE RESULTS
    // --------------------------------------------------

    async function calculateResults(draw) {
        if (draw.status !== "simulated") {
            alert(
                "Only simulated draws can be calculated."
            );
            return;
        }

        if (!draw.winning_numbers?.length) {
            alert(
                "Simulate the draw first."
            );
            return;
        }

        setCalculating(draw.id);

        try {
            const drawResults =
                await calculateDrawResults(draw);

            setResults((previous) => ({
                ...previous,
                [draw.id]: drawResults,
            }));

            alert(
                `Calculation complete.\n\nQualifying winners: ${drawResults.length}`
            );
        } catch (error) {
            console.error(
                "Calculate results error:",
                error
            );

            alert(error.message);
        } finally {
            setCalculating(null);
        }
    }

    // --------------------------------------------------
    // SAVE RESULTS
    // --------------------------------------------------

    async function saveResults(draw) {
        const drawResults = results[draw.id];

        if (!drawResults) {
            alert(
                "Calculate the results first."
            );
            return;
        }

        if (draw.status !== "simulated") {
            alert(
                "Only simulated draws can have results saved."
            );
            return;
        }

        setSavingResults(draw.id);

        try {
            const distribution =
                await saveDrawResults(
                    draw,
                    drawResults,
                    Number(draw.prize_pool || 0)
                );

            alert(
                `Results saved successfully.\n\n` +
                `Qualifying winners: ${drawResults.length}\n` +
                `Total prize pool: ₹${distribution.totalPool.toLocaleString()}\n` +
                `Jackpot rollover: ₹${distribution.jackpotRollover.toLocaleString()}`
            );

            await fetchDraws();
        } catch (error) {
            console.error(
                "Save results error:",
                error
            );

            alert(error.message);
        } finally {
            setSavingResults(null);
        }
    }

    // --------------------------------------------------
    // PUBLISH
    // --------------------------------------------------

    async function handlePublish(draw) {
        if (draw.status !== "simulated") {
            alert(
                "Only simulated draws can be published."
            );
            return;
        }

        if (!draw.winning_numbers?.length) {
            alert(
                "This draw has no winning numbers."
            );
            return;
        }

        if (!results[draw.id]) {
            alert(
                "Please calculate the draw results first."
            );
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to publish this draw?\n\n" +
            "The draw will become visible to subscribers."
        );

        if (!confirmed) {
            return;
        }

        setPublishing(draw.id);

        try {
            await publishDraw(draw.id);

            alert(
                "Draw published successfully."
            );

            await fetchDraws();
        } catch (error) {
            console.error(
                "Publish draw error:",
                error
            );

            alert(error.message);
        } finally {
            setPublishing(null);
        }
    }

    // --------------------------------------------------
    // FORMAT MONTH
    // --------------------------------------------------

    function formatDrawMonth(draw) {
        if (
            !draw.draw_month ||
            !draw.draw_year
        ) {
            return "Unknown month";
        }

        return new Date(
            Number(draw.draw_year),
            Number(draw.draw_month) - 1,
            1
        ).toLocaleDateString("en-IN", {
            month: "long",
            year: "numeric",
        });
    }

    // --------------------------------------------------
    // STATUS STYLE
    // --------------------------------------------------

    function getStatusClasses(status) {
        if (status === "published") {
            return "bg-emerald-500/10 text-emerald-400";
        }

        if (status === "simulated") {
            return "bg-cyan-500/10 text-[#356b56]";
        }

        if (status === "completed") {
            return "bg-purple-500/10 text-purple-400";
        }

        return "bg-yellow-500/10 text-yellow-400";
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
                            § 01 · Draw management
                        </p>

                        <h1 className="mt-6 text-5xl md:text-7xl font-semibold tracking-[-0.05em] leading-[0.92]">
                            Create the draw.
                            <span className="block text-[#47775f]">
                                Test it. Publish it.
                            </span>
                        </h1>

                        <p className="mt-8 text-[#687169] text-base md:text-lg leading-7 max-w-2xl">
                            Manage monthly draws from creation through
                            simulation, result calculation, prize
                            distribution and publication.
                        </p>

                    </div>

                    <div className="border-l border-[#cfd4c8] pl-6">

                        <p className="text-xs uppercase tracking-[0.16em] text-[#8a918b]">
                            Total draws
                        </p>

                        <p className="mt-3 text-5xl font-semibold tracking-[-0.04em] text-[#47775f]">
                            {loading ? "—" : draws.length}
                        </p>

                        <p className="mt-3 text-sm leading-6 text-[#687169]">
                            Monthly draws currently recorded
                            in the platform.
                        </p>

                    </div>

                </div>

            </section>

            {/* Create Draw */}
            <section className="max-w-7xl mx-auto px-6 lg:px-10 py-14 md:py-20">

                <div className="mb-10">

                    <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#47775f]">
                        § 02 · New draw
                    </p>

                    <h2 className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight">
                        Create a monthly draw.
                    </h2>

                </div>

                <div className="border border-[#cfd4c8] bg-[#dfe5da] p-7 md:p-8">

                    <div className="flex items-start justify-between gap-6">

                        <div>
                            <p className="text-xs uppercase tracking-[0.16em] text-[#8a918b]">
                                Draw configuration
                            </p>

                            <p className="mt-2 text-sm text-[#687169]">
                                Each month can have one draw.
                            </p>
                        </div>

                        <span className="text-xl text-[#47775f]">
                            +
                        </span>

                    </div>

                    <form
                        onSubmit={createDrawHandler}
                        className="grid md:grid-cols-4 gap-px bg-[#cfd4c8] border border-[#cfd4c8] mt-8"
                    >

                        {/* Month */}
                        <div className="bg-[#f8f7f1] p-5">

                            <label className="block text-xs uppercase tracking-[0.14em] font-semibold text-[#687169] mb-3">
                                Draw month
                            </label>

                            <input
                                type="month"
                                value={drawMonth}
                                onChange={(e) =>
                                    setDrawMonth(e.target.value)
                                }
                                className="w-full bg-[#f8f7f1] border border-[#cfd4c8] px-4 py-3 text-sm text-[#101813] outline-none focus:border-[#47775f] transition"
                            />

                        </div>

                        {/* Draw Type */}
                        <div className="bg-[#f8f7f1] p-5">

                            <label className="block text-xs uppercase tracking-[0.14em] font-semibold text-[#687169] mb-3">
                                Draw type
                            </label>

                            <select
                                value={drawType}
                                onChange={(e) =>
                                    setDrawType(e.target.value)
                                }
                                className="w-full bg-[#f8f7f1] border border-[#cfd4c8] px-4 py-3 text-sm text-[#101813] outline-none focus:border-[#47775f] transition"
                            >
                                <option value="random">
                                    Random
                                </option>

                                <option value="algorithmic">
                                    Algorithmic
                                </option>
                            </select>

                        </div>

                        {/* Prize Pool */}
                        <div className="bg-[#f8f7f1] p-5">

                            <label className="block text-xs uppercase tracking-[0.14em] font-semibold text-[#687169] mb-3">
                                Prize pool
                            </label>

                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={prizePool}
                                onChange={(e) =>
                                    setPrizePool(e.target.value)
                                }
                                placeholder="50000"
                                className="w-full bg-[#f8f7f1] border border-[#cfd4c8] px-4 py-3 text-sm text-[#101813] placeholder:text-[#9a9f98] outline-none focus:border-[#47775f] transition"
                            />

                            <p className="text-[11px] text-[#8a918b] mt-2">
                                Demo / testing value
                            </p>

                        </div>

                        {/* Create */}
                        <div className="bg-[#f8f7f1] p-5 flex items-end">

                            <button
                                type="submit"
                                disabled={creating}
                                className="w-full bg-[#47775f] hover:bg-[#38644f] disabled:opacity-50 text-white font-semibold px-4 py-3 text-sm transition"
                            >
                                {creating
                                    ? "Creating..."
                                    : "Create Draw →"}
                            </button>

                        </div>

                    </form>

                </div>

            </section>

            {/* Draw List */}
            <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-16 md:pb-24">

                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-10">

                    <div>

                        <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#47775f]">
                            § 03 · Draw history
                        </p>

                        <h2 className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight">
                            All monthly draws.
                        </h2>

                    </div>

                    <p className="text-sm text-[#8a918b]">
                        {draws.length} {draws.length === 1 ? "draw" : "draws"}
                    </p>

                </div>

                {loading ? (

                    <div className="border border-[#cfd4c8] bg-[#f8f7f1] px-6 py-16 text-center">

                        <p className="text-sm text-[#687169]">
                            Loading draws...
                        </p>

                    </div>

                ) : draws.length === 0 ? (

                    <div className="border border-[#cfd4c8] bg-[#f8f7f1] px-6 py-16 text-center">

                        <p className="text-xs uppercase tracking-[0.16em] text-[#8a918b]">
                            Draw history empty
                        </p>

                        <h3 className="mt-3 text-xl font-semibold">
                            No draws created yet.
                        </h3>

                        <p className="mt-2 text-sm text-[#687169]">
                            Create the first monthly draw above.
                        </p>

                    </div>

                ) : (

                    <div className="space-y-px bg-[#cfd4c8] border border-[#cfd4c8]">

                        {draws.map((draw, index) => {

                            const drawResults =
                                results[draw.id];

                            const canCalculate =
                                draw.status === "simulated";

                            const canPublish =
                                draw.status === "simulated" &&
                                drawResults;

                            return (

                                <div
                                    key={draw.id}
                                    className="bg-[#f8f7f1] p-7 md:p-8 hover:bg-[#e7ebe3] transition"
                                >

                                    {/* Draw Header */}
                                    <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-8">

                                        <div className="flex gap-5">

                                            <span className="text-xs tracking-[0.16em] text-[#8a918b] pt-1">
                                                {String(index + 1).padStart(2, "0")}
                                            </span>

                                            <div>

                                                <p className="text-xs uppercase tracking-[0.16em] text-[#8a918b]">
                                                    Draw month
                                                </p>

                                                <h3 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight">
                                                    {formatDrawMonth(draw)}
                                                </h3>

                                                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#687169]">

                                                    <span>
                                                        Type:{" "}
                                                        <strong className="text-[#101813] capitalize">
                                                            {draw.draw_type}
                                                        </strong>
                                                    </span>

                                                    <span>
                                                        Prize pool:{" "}
                                                        <strong className="text-[#101813]">
                                                            ₹
                                                            {Number(
                                                                draw.prize_pool || 0
                                                            ).toLocaleString(
                                                                "en-IN"
                                                            )}
                                                        </strong>
                                                    </span>

                                                </div>

                                                {draw.jackpot_amount > 0 && (

                                                    <p className="mt-3 text-sm text-[#8a6d35]">
                                                        Jackpot rollover: ₹
                                                        {Number(
                                                            draw.jackpot_amount
                                                        ).toLocaleString(
                                                            "en-IN"
                                                        )}
                                                    </p>

                                                )}

                                            </div>

                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-wrap items-center gap-3 xl:max-w-xl xl:justify-end">

                                            <span
                                                className={`px-3 py-2 text-[10px] uppercase tracking-[0.12em] font-semibold ${
                                                    draw.status === "published"
                                                        ? "bg-[#dfe5da] text-[#47775f]"
                                                        : draw.status === "simulated"
                                                        ? "bg-[#e2ebe5] text-[#47775f]"
                                                        : draw.status === "completed"
                                                        ? "bg-[#e5e1ea] text-[#6e617d]"
                                                        : "bg-[#eee9d8] text-[#856f36]"
                                                }`}
                                            >
                                                {draw.status}
                                            </span>

                                            {draw.status === "draft" && (

                                                <button
                                                    onClick={() =>
                                                        simulateDraw(draw)
                                                    }
                                                    disabled={
                                                        simulating === draw.id
                                                    }
                                                    className="px-4 py-2.5 border border-[#47775f] text-[#47775f] text-sm font-semibold hover:bg-[#dfe5da] disabled:opacity-50 transition"
                                                >
                                                    {simulating === draw.id
                                                        ? "Simulating..."
                                                        : "Simulate"}
                                                </button>

                                            )}

                                            {canCalculate && (

                                                <button
                                                    onClick={() =>
                                                        calculateResults(draw)
                                                    }
                                                    disabled={
                                                        calculating === draw.id
                                                    }
                                                    className="px-4 py-2.5 bg-[#47775f] hover:bg-[#38644f] disabled:opacity-50 text-white text-sm font-semibold transition"
                                                >
                                                    {calculating === draw.id
                                                        ? "Calculating..."
                                                        : "Calculate Results"}
                                                </button>

                                            )}

                                            {drawResults && (

                                                <button
                                                    onClick={() =>
                                                        saveResults(draw)
                                                    }
                                                    disabled={
                                                        savingResults === draw.id
                                                    }
                                                    className="px-4 py-2.5 border border-[#cfd4c8] bg-[#e7ebe3] hover:bg-[#dfe5da] disabled:opacity-50 text-[#101813] text-sm font-semibold transition"
                                                >
                                                    {savingResults === draw.id
                                                        ? "Saving..."
                                                        : "Save Results"}
                                                </button>

                                            )}

                                            {canPublish && (

                                                <button
                                                    onClick={() =>
                                                        handlePublish(draw)
                                                    }
                                                    disabled={
                                                        publishing === draw.id
                                                    }
                                                    className="px-4 py-2.5 bg-[#47775f] hover:bg-[#38644f] disabled:opacity-50 text-white text-sm font-semibold transition"
                                                >
                                                    {publishing === draw.id
                                                        ? "Publishing..."
                                                        : "Publish Draw →"}
                                                </button>

                                            )}

                                        </div>

                                    </div>

                                    {/* Winning Numbers */}
                                    {draw.winning_numbers?.length > 0 && (

                                        <div className="mt-8 pt-7 border-t border-[#cfd4c8]">

                                            <div className="flex flex-col md:flex-row md:items-center gap-5">

                                                <div className="min-w-[150px]">

                                                    <p className="text-xs uppercase tracking-[0.16em] text-[#8a918b]">
                                                        Winning numbers
                                                    </p>

                                                </div>

                                                <div className="flex flex-wrap gap-2">

                                                    {draw.winning_numbers.map(
                                                        (number) => (

                                                            <span
                                                                key={number}
                                                                className="w-11 h-11 border border-[#47775f] bg-[#dfe5da] text-[#47775f] flex items-center justify-center font-semibold"
                                                            >
                                                                {number}
                                                            </span>

                                                        )
                                                    )}

                                                </div>

                                            </div>

                                        </div>

                                    )}

                                    {/* Results */}
                                    {drawResults && (

                                        <div className="mt-8 pt-7 border-t border-[#cfd4c8]">

                                            <div className="flex items-end justify-between gap-5 mb-5">

                                                <div>

                                                    <p className="text-xs uppercase tracking-[0.16em] text-[#8a918b]">
                                                        Qualifying winners
                                                    </p>

                                                    <h4 className="mt-2 text-xl font-semibold">
                                                        Results
                                                    </h4>

                                                </div>

                                                <span className="text-2xl font-semibold text-[#47775f]">
                                                    {drawResults.length}
                                                </span>

                                            </div>

                                            {drawResults.length === 0 ? (

                                                <div className="border border-[#cfd4c8] bg-[#e7ebe3] p-5">

                                                    <p className="text-sm text-[#687169]">
                                                        No subscribers matched
                                                        3 or more numbers.
                                                    </p>

                                                </div>

                                            ) : (

                                                <div className="grid md:grid-cols-2 gap-px bg-[#cfd4c8] border border-[#cfd4c8]">

                                                    {drawResults.map(
                                                        (winner) => (

                                                            <div
                                                                key={
                                                                    winner.user_id
                                                                }
                                                                className="bg-[#f8f7f1] p-5 flex items-center justify-between gap-5"
                                                            >

                                                                <div className="min-w-0">

                                                                    <p className="text-[10px] uppercase tracking-[0.14em] text-[#8a918b]">
                                                                        User
                                                                    </p>

                                                                    <p className="mt-2 text-sm font-medium truncate">
                                                                        {
                                                                            winner.user_id
                                                                        }
                                                                    </p>

                                                                </div>

                                                                <div className="text-right shrink-0">

                                                                    <p className="text-[10px] uppercase tracking-[0.14em] text-[#8a918b]">
                                                                        Matches
                                                                    </p>

                                                                    <p className="mt-1 text-2xl font-semibold text-[#47775f]">
                                                                        {
                                                                            winner.match_count
                                                                        }
                                                                        <span className="text-sm text-[#8a918b]">
                                                                            /5
                                                                        </span>
                                                                    </p>

                                                                </div>

                                                            </div>

                                                        )
                                                    )}

                                                </div>

                                            )}

                                        </div>

                                    )}

                                </div>

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
                                § 04 · Draw process
                            </p>

                        </div>

                        <div className="max-w-4xl">

                            <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.04em] leading-tight">
                                Configure.
                                <span className="text-[#47775f]">
                                    {" "}Simulate. Calculate. Publish.
                                </span>
                            </h2>

                            <p className="mt-6 text-[#687169] text-base md:text-lg leading-7 max-w-2xl">
                                Every draw moves through a controlled
                                workflow before its winning numbers and
                                results become visible to subscribers.
                            </p>

                        </div>

                    </div>

                </div>

            </section>

        </main>

    

    </div>
);
}