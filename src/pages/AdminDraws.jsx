import { useEffect, useMemo, useState } from "react";
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
                alert("A draw already exists for this month.");
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
            alert("Only draft draws can be simulated.");
            return;
        }

        setSimulating(draw.id);

        try {
            const simulatedDraw = await simulateDrawService(
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
            console.error("Simulate draw error:", error);
            alert(error.message);
        } finally {
            setSimulating(null);
        }
    }

    // --------------------------------------------------
    // CALCULATE RESULTS
    // --------------------------------------------------

    async function calculateResults(draw) {
        console.log("========== CALCULATE RESULTS START ==========");
        console.log("DRAW RECEIVED:", draw);
        console.log("DRAW ID:", draw?.id);
        console.log("DRAW STATUS:", draw?.status);
        console.log("DRAW WINNING NUMBERS:", draw?.winning_numbers);

        if (draw.status !== "simulated") {
            alert("Only simulated draws can be calculated.");
            return;
        }

        if (!draw.winning_numbers?.length) {
            alert("Simulate the draw first.");
            return;
        }

        setCalculating(draw.id);

        try {
            const drawResults = await calculateDrawResults(draw);

            console.log("========== DRAW RESULTS ==========");
            console.log("Qualifying results:", drawResults);
            console.log(
                "Number of qualifying winners:",
                drawResults.length
            );

            setResults((previous) => ({
                ...previous,
                [draw.id]: drawResults,
            }));

            alert(
                `Calculation complete.\n\nQualifying winners: ${drawResults.length}`
            );
        } catch (error) {
            console.error("Calculate results error:", error);
            console.error("Error message:", error?.message);
            console.error("Error stack:", error?.stack);

            alert(error.message);
        } finally {
            setCalculating(null);
            console.log("========== CALCULATE RESULTS END ==========");
        }
    }

    // --------------------------------------------------
    // SAVE RESULTS
    // --------------------------------------------------

    async function saveResults(draw) {
        const drawResults = results[draw.id];

        if (!drawResults) {
            alert("Calculate the results first.");
            return;
        }

        if (draw.status !== "simulated") {
            alert("Only simulated draws can have results saved.");
            return;
        }

        setSavingResults(draw.id);

        try {
            const distribution = await saveDrawResults(
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
            console.error("Save results error:", error);
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
            alert("Only simulated draws can be published.");
            return;
        }

        if (!draw.winning_numbers?.length) {
            alert("This draw has no winning numbers.");
            return;
        }

        if (!results[draw.id]) {
            alert("Please calculate the draw results first.");
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

            alert("Draw published successfully.");

            await fetchDraws();
        } catch (error) {
            console.error("Publish draw error:", error);
            alert(error.message);
        } finally {
            setPublishing(null);
        }
    }

    // --------------------------------------------------
    // HELPERS
    // --------------------------------------------------

    function formatDrawMonth(draw) {
        if (!draw.draw_month || !draw.draw_year) {
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

    function formatCurrency(value) {
        return `₹${Number(value || 0).toLocaleString("en-IN")}`;
    }

    const stats = useMemo(() => {
        return {
            total: draws.length,
            drafts: draws.filter((draw) => draw.status === "draft").length,
            simulated: draws.filter(
                (draw) => draw.status === "simulated"
            ).length,
            published: draws.filter(
                (draw) => draw.status === "published"
            ).length,
        };
    }, [draws]);

    return (
        <div className="min-h-screen bg-[#f3f1e8] text-[#101813]">

            {/* ==================================================
                TOP OPERATIONS HEADER
            ================================================== */}

            <section className="relative overflow-hidden bg-[#102019] text-white">

                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-40 right-0 w-[500px] h-[500px] rounded-full bg-[#8ee276]/8 blur-3xl" />
                    <div className="absolute bottom-[-180px] left-[30%] w-[420px] h-[420px] rounded-full bg-[#47775f]/20 blur-3xl" />
                </div>

                <div className="relative max-w-[1500px] mx-auto px-5 sm:px-7 lg:px-10 py-10 lg:py-14">

                    <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-10">

                        <div className="max-w-3xl">

                            <div className="flex items-center gap-3 mb-5">
                                <span className="w-8 h-[2px] bg-[#8ee276]" />

                                <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#8ee276]">
                                    Draw operations
                                </span>
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.055em] leading-[0.95]">
                                Monthly draw
                                <span className="block text-[#8ee276]">
                                    control center.
                                </span>
                            </h1>

                            <p className="mt-6 max-w-2xl text-sm sm:text-base leading-7 text-white/55">
                                Create, simulate, calculate and publish
                                monthly draws through one controlled
                                operational workflow.
                            </p>

                        </div>

                        <div className="flex items-center gap-3">

                            <div className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2.5">
                                <span className="relative flex w-2 h-2">
                                    <span className="absolute inset-0 rounded-full bg-[#8ee276] animate-ping opacity-40" />
                                    <span className="relative w-2 h-2 rounded-full bg-[#8ee276]" />
                                </span>

                                <span className="text-[10px] uppercase tracking-[0.16em] text-white/65 font-semibold">
                                    Draw system active
                                </span>
                            </div>

                        </div>

                    </div>

                    {/* Stats */}

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-10">

                        <HeaderStat
                            label="Total draws"
                            value={loading ? "—" : stats.total}
                        />

                        <HeaderStat
                            label="Draft"
                            value={loading ? "—" : stats.drafts}
                            accent="yellow"
                        />

                        <HeaderStat
                            label="Simulated"
                            value={loading ? "—" : stats.simulated}
                            accent="blue"
                        />

                        <HeaderStat
                            label="Published"
                            value={loading ? "—" : stats.published}
                            accent="lime"
                        />

                    </div>

                </div>
            </section>

            {/* ==================================================
    CREATE DRAW
================================================== */}

            <section className="max-w-[1500px] mx-auto px-5 sm:px-7 lg:px-10 py-8 lg:py-10">

                <div className="rounded-2xl border border-[#cfd4c8] bg-[#f8f7f1] overflow-hidden shadow-[0_12px_40px_rgba(16,24,19,0.05)]">

                    {/* Header */}

                    <div className="px-6 sm:px-8 py-6 border-b border-[#cfd4c8] bg-[#f3f1e8]">

                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                            <div className="flex items-center gap-4">

                                <div className="w-11 h-11 rounded-xl bg-[#103523] text-[#8ee276] flex items-center justify-center text-lg font-bold">
                                    +
                                </div>

                                <div>

                                    <div className="flex items-center gap-2">

                                        <span className="w-1.5 h-1.5 rounded-full bg-[#8ee276]" />

                                        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#47775f]">
                                            New draw
                                        </p>

                                    </div>

                                    <h2 className="mt-1 text-xl sm:text-2xl font-bold tracking-[-0.04em]">
                                        Configure monthly draw
                                    </h2>

                                </div>

                            </div>

                            {/* Workflow */}

                            <div className="flex items-center gap-2">

                                <span className="text-[9px] uppercase tracking-[0.15em] font-bold text-[#8a918b] mr-1">
                                    Workflow
                                </span>

                                <span className="px-3 py-1.5 rounded-full bg-[#dfe7dc] text-[#47775f] text-[10px] font-bold">
                                    Draft
                                </span>

                                <span className="text-[#a1a69f] text-xs">
                                    →
                                </span>

                                <span className="px-3 py-1.5 rounded-full bg-[#e7ebe3] text-[#687169] text-[10px] font-bold">
                                    Simulate
                                </span>

                                <span className="text-[#a1a69f] text-xs">
                                    →
                                </span>

                                <span className="px-3 py-1.5 rounded-full bg-[#e7ebe3] text-[#687169] text-[10px] font-bold">
                                    Publish
                                </span>

                            </div>

                        </div>

                    </div>

                    {/* Form */}

                    <form
                        onSubmit={createDrawHandler}
                        className="p-6 sm:p-8"
                    >

                        {/* Desktop: everything in one horizontal row */}

                        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-[1fr_1fr_1fr_180px] gap-4">

                            {/* --------------------------------------------
                    DRAW MONTH
                -------------------------------------------- */}

                            <div>

                                <label className="flex items-center justify-between mb-2">

                                    <span className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#687169]">
                                        Draw month
                                    </span>

                                    <span className="text-[9px] text-[#9a9f98]">
                                        Required
                                    </span>

                                </label>

                                <div className="relative">

                                    <input
                                        type="month"
                                        value={drawMonth}
                                        onChange={(e) =>
                                            setDrawMonth(e.target.value)
                                        }
                                        className="admin-input"
                                    />

                                </div>

                                <p className="mt-2 text-[10px] text-[#9a9f98]">
                                    Select the month for this draw.
                                </p>

                            </div>

                            {/* --------------------------------------------
                    DRAW TYPE
                -------------------------------------------- */}

                            <div>

                                <label className="flex items-center justify-between mb-2">

                                    <span className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#687169]">
                                        Draw type
                                    </span>

                                    <span className="text-[9px] text-[#9a9f98]">
                                        Method
                                    </span>

                                </label>

                                <select
                                    value={drawType}
                                    onChange={(e) =>
                                        setDrawType(e.target.value)
                                    }
                                    className="admin-input"
                                >

                                    <option value="random">
                                        Random
                                    </option>

                                    <option value="algorithmic">
                                        Algorithmic
                                    </option>

                                </select>

                                <p className="mt-2 text-[10px] text-[#9a9f98]">
                                    Select how numbers will be generated.
                                </p>

                            </div>

                            {/* --------------------------------------------
                    PRIZE POOL
                -------------------------------------------- */}

                            <div>

                                <label className="flex items-center justify-between mb-2">

                                    <span className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#687169]">
                                        Prize pool
                                    </span>

                                    <span className="text-[9px] text-[#9a9f98]">
                                        INR
                                    </span>

                                </label>

                                <div className="relative">

                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#47775f] pointer-events-none">
                                        ₹
                                    </span>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={prizePool}
                                        onChange={(e) =>
                                            setPrizePool(e.target.value)
                                        }
                                        placeholder="50,000"
                                        className="admin-input pl-9"
                                    />

                                </div>

                                <p className="mt-2 text-[10px] text-[#9a9f98]">
                                    Total amount available for prizes.
                                </p>

                            </div>

                            {/* --------------------------------------------
                    CREATE BUTTON
                -------------------------------------------- */}

                            <div className="flex items-start pt-[24px]">
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="w-full h-[48px] rounded-xl bg-[#103523] text-[#8ee276] border border-[#103523] text-sm font-bold transition-all duration-200 hover:bg-[#47775f] hover:text-white hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(16,53,35,0.18)] disabled:opacity-50"
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        {creating ? (
                                            <>
                                                <span className="w-4 h-4 rounded-full border-2 border-[#8ee276]/30 border-t-[#8ee276] animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                Create draw
                                                <span className="text-base">→</span>
                                            </>
                                        )}
                                    </span>
                                </button>
                            </div>

                        </div>

                        {/* Bottom information strip */}

                        <div className="mt-7 pt-5 border-t border-[#cfd4c8] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                            <div className="flex items-center gap-2">

                                <span className="flex w-5 h-5 rounded-full bg-[#dfe7dc] text-[#47775f] items-center justify-center text-[10px] font-bold">
                                    ✓
                                </span>

                                <p className="text-[11px] text-[#687169]">
                                    Each month can have one draw.
                                </p>

                            </div>

                            <p className="text-[10px] uppercase tracking-[0.13em] text-[#9a9f98]">
                                Draw starts as draft
                            </p>

                        </div>

                    </form>

                </div>

            </section>

            {/* ==================================================
                DRAW HISTORY
            ================================================== */}

            <section className="max-w-[1500px] mx-auto px-5 sm:px-7 lg:px-10 pb-12 lg:pb-16">

                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">

                    <div>

                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#47775f]" />

                            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#47775f]">
                                Draw history
                            </p>
                        </div>

                        <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-[-0.04em]">
                            Operational queue
                        </h2>

                    </div>

                    <div className="rounded-full border border-[#cfd4c8] bg-[#f8f7f1] px-4 py-2">
                        <span className="text-xs font-semibold text-[#687169]">
                            {draws.length}{" "}
                            {draws.length === 1 ? "draw" : "draws"}
                        </span>
                    </div>

                </div>

                {loading ? (
                    <LoadingState />
                ) : draws.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="space-y-5">

                        {draws.map((draw, index) => {

                            const drawResults = results[draw.id];

                            return (
                                <DrawCard
                                    key={draw.id}
                                    draw={draw}
                                    index={index}
                                    drawResults={drawResults}
                                    simulating={simulating}
                                    calculating={calculating}
                                    savingResults={savingResults}
                                    publishing={publishing}
                                    onSimulate={simulateDraw}
                                    onCalculate={calculateResults}
                                    onSave={saveResults}
                                    onPublish={handlePublish}
                                    formatDrawMonth={formatDrawMonth}
                                    formatCurrency={formatCurrency}
                                />
                            );
                        })}

                    </div>
                )}

            </section>

            {/* ==================================================
                WORKFLOW FOOTER
            ================================================== */}

            <section className="bg-[#183126] text-white">

                <div className="max-w-[1500px] mx-auto px-5 sm:px-7 lg:px-10 py-12 lg:py-16">

                    <div className="grid lg:grid-cols-[0.8fr_2fr] gap-10 lg:gap-20">

                        <div>

                            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8ee276]">
                                Draw workflow
                            </p>

                            <p className="mt-3 text-sm text-white/45 max-w-xs leading-6">
                                Every draw passes through controlled
                                operational stages before subscribers
                                can see the result.
                            </p>

                        </div>

                        <div className="grid sm:grid-cols-4 gap-3">

                            <WorkflowStep
                                number="01"
                                title="Configure"
                                text="Create the monthly draw."
                                active
                            />

                            <WorkflowStep
                                number="02"
                                title="Simulate"
                                text="Generate winning numbers."
                            />

                            <WorkflowStep
                                number="03"
                                title="Calculate"
                                text="Match subscriber entries."
                            />

                            <WorkflowStep
                                number="04"
                                title="Publish"
                                text="Release the final result."
                            />

                        </div>

                    </div>

                </div>

            </section>

            <style>{`
                .admin-input {
                    width: 100%;
                    height: 48px;
                    border-radius: 12px;
                    border: 1px solid #cfd4c8;
                    background: #f3f1e8;
                    padding: 0 16px;
                    font-size: 14px;
                    color: #101813;
                    outline: none;
                    transition: all 0.2s ease;
                }

                .admin-input:focus {
                    border-color: #47775f;
                    box-shadow: 0 0 0 3px rgba(71,119,95,0.08);
                    background: #f8f7f1;
                }

                .admin-input::placeholder {
                    color: #9a9f98;
                }
            `}</style>

        </div>
    );
}

/* ============================================================
   DRAW CARD
============================================================ */

function DrawCard({
    draw,
    index,
    drawResults,
    simulating,
    calculating,
    savingResults,
    publishing,
    onSimulate,
    onCalculate,
    onSave,
    onPublish,
    formatDrawMonth,
    formatCurrency,
}) {
    const canCalculate = draw.status === "simulated";
    const canPublish =
        draw.status === "simulated" && drawResults;

    return (
        <article className="rounded-2xl border border-[#cfd4c8] bg-[#f8f7f1] overflow-hidden shadow-[0_8px_30px_rgba(16,24,19,0.035)]">

            {/* --------------------------------------------
                CARD HEADER
            -------------------------------------------- */}

            <div className="p-5 sm:p-7">

                <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-7">

                    <div className="flex gap-4 sm:gap-5 min-w-0">

                        <div className="hidden sm:flex w-11 h-11 rounded-xl bg-[#dfe7dc] text-[#47775f] items-center justify-center text-xs font-bold shrink-0">
                            {String(index + 1).padStart(2, "0")}
                        </div>

                        <div className="min-w-0">

                            <div className="flex flex-wrap items-center gap-2">

                                <span className="text-[10px] uppercase tracking-[0.16em] text-[#8a918b]">
                                    Monthly draw
                                </span>

                                <StatusBadge status={draw.status} />

                            </div>

                            <h3 className="mt-2 text-2xl sm:text-3xl font-bold tracking-[-0.045em]">
                                {formatDrawMonth(draw)}
                            </h3>

                            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs sm:text-sm text-[#687169]">

                                <span>
                                    Type{" "}
                                    <strong className="text-[#101813] capitalize">
                                        {draw.draw_type}
                                    </strong>
                                </span>

                                <span>
                                    Pool{" "}
                                    <strong className="text-[#101813]">
                                        {formatCurrency(
                                            draw.prize_pool
                                        )}
                                    </strong>
                                </span>

                                {Number(draw.jackpot_amount || 0) >
                                    0 && (
                                        <span className="text-[#856f36]">
                                            Rollover{" "}
                                            <strong>
                                                {formatCurrency(
                                                    draw.jackpot_amount
                                                )}
                                            </strong>
                                        </span>
                                    )}

                            </div>

                        </div>

                    </div>

                    {/* Actions */}

                    <div className="flex flex-wrap gap-2 xl:justify-end">

                        {draw.status === "draft" && (
                            <ActionButton
                                variant="outline"
                                disabled={simulating === draw.id}
                                onClick={() => onSimulate(draw)}
                            >
                                {simulating === draw.id
                                    ? "Simulating..."
                                    : "Simulate"}
                            </ActionButton>
                        )}

                        {canCalculate && (
                            <ActionButton
                                variant="primary"
                                disabled={calculating === draw.id}
                                onClick={() => onCalculate(draw)}
                            >
                                {calculating === draw.id
                                    ? "Calculating..."
                                    : "Calculate results"}
                            </ActionButton>
                        )}

                        {drawResults && (
                            <ActionButton
                                variant="soft"
                                disabled={savingResults === draw.id}
                                onClick={() => onSave(draw)}
                            >
                                {savingResults === draw.id
                                    ? "Saving..."
                                    : "Save results"}
                            </ActionButton>
                        )}

                        {canPublish && (
                            <ActionButton
                                variant="primary"
                                disabled={publishing === draw.id}
                                onClick={() => onPublish(draw)}
                            >
                                {publishing === draw.id
                                    ? "Publishing..."
                                    : "Publish →"}
                            </ActionButton>
                        )}

                    </div>

                </div>

                {/* --------------------------------------------
                    WORKFLOW STATUS
                -------------------------------------------- */}

                <div className="mt-7 pt-6 border-t border-[#cfd4c8]">

                    <WorkflowProgress status={draw.status} />

                </div>

            </div>

            {/* --------------------------------------------
                WINNING NUMBERS
            -------------------------------------------- */}

            {draw.winning_numbers?.length > 0 && (
                <div className="px-5 sm:px-7 py-6 bg-[#dfe7dc] border-t border-[#cfd4c8]">

                    <div className="flex flex-col md:flex-row md:items-center gap-5">

                        <div className="shrink-0">
                            <p className="text-[10px] uppercase tracking-[0.17em] font-bold text-[#47775f]">
                                Winning numbers
                            </p>

                            <p className="mt-1 text-xs text-[#687169]">
                                Simulated draw result
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">

                            {draw.winning_numbers.map(
                                (number, numberIndex) => (
                                    <div
                                        key={`${number}-${numberIndex}`}
                                        className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#103523] text-[#8ee276] flex items-center justify-center text-sm font-bold shadow-sm"
                                    >
                                        {number}
                                    </div>
                                )
                            )}

                        </div>

                    </div>

                </div>
            )}

            {/* --------------------------------------------
                RESULTS
            -------------------------------------------- */}

            {drawResults && (
                <div className="p-5 sm:p-7 border-t border-[#cfd4c8]">

                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">

                        <div>

                            <p className="text-[10px] uppercase tracking-[0.17em] font-bold text-[#47775f]">
                                Calculated results
                            </p>

                            <h4 className="mt-1 text-xl font-bold tracking-[-0.03em]">
                                Qualifying subscribers
                            </h4>

                        </div>

                        <div className="flex items-baseline gap-2">

                            <span className="text-3xl font-bold tracking-[-0.05em] text-[#47775f]">
                                {drawResults.length}
                            </span>

                            <span className="text-xs text-[#8a918b]">
                                qualifying
                            </span>

                        </div>

                    </div>

                    {drawResults.length === 0 ? (

                        <div className="rounded-xl bg-[#e7ebe3] border border-[#cfd4c8] p-5">

                            <div className="flex items-center gap-3">

                                <div className="w-9 h-9 rounded-lg bg-[#dfe7dc] flex items-center justify-center text-[#47775f]">
                                    —
                                </div>

                                <div>
                                    <p className="text-sm font-semibold">
                                        No qualifying subscribers
                                    </p>

                                    <p className="mt-0.5 text-xs text-[#687169]">
                                        No subscriber matched three or more
                                        numbers.
                                    </p>
                                </div>

                            </div>

                        </div>

                    ) : (

                        <div className="grid md:grid-cols-2 gap-3">

                            {drawResults.map((winner, winnerIndex) => (

                                <div
                                    key={
                                        winner.user_id ||
                                        winnerIndex
                                    }
                                    className="rounded-xl border border-[#cfd4c8] bg-[#f3f1e8] p-4 sm:p-5"
                                >

                                    <div className="flex items-center justify-between gap-4">

                                        <div className="min-w-0">

                                            <p className="text-[9px] uppercase tracking-[0.16em] text-[#8a918b]">
                                                Subscriber
                                            </p>

                                            <p className="mt-2 text-xs sm:text-sm font-semibold truncate">
                                                {winner.user_id}
                                            </p>

                                        </div>

                                        <div className="shrink-0 text-right">

                                            <p className="text-[9px] uppercase tracking-[0.16em] text-[#8a918b]">
                                                Matches
                                            </p>

                                            <p className="mt-1 text-2xl font-bold text-[#47775f]">
                                                {winner.match_count}
                                                <span className="text-xs text-[#8a918b]">
                                                    /5
                                                </span>
                                            </p>

                                        </div>

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </div>
            )}

        </article>
    );
}

/* ============================================================
   WORKFLOW
============================================================ */

function WorkflowProgress({ status }) {
    const steps = [
        {
            key: "draft",
            label: "Draft",
        },
        {
            key: "simulated",
            label: "Simulated",
        },
        {
            key: "results",
            label: "Results",
        },
        {
            key: "published",
            label: "Published",
        },
    ];

    let activeIndex = 0;

    if (status === "simulated") {
        activeIndex = 1;
    }

    if (status === "completed") {
        activeIndex = 2;
    }

    if (status === "published") {
        activeIndex = 3;
    }

    return (
        <div className="flex items-center">

            {steps.map((step, index) => {

                const completed = index <= activeIndex;

                return (
                    <div
                        key={step.key}
                        className={`flex items-center ${index !== steps.length - 1
                                ? "flex-1"
                                : ""
                            }`}
                    >

                        <div className="flex items-center gap-2">

                            <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition ${completed
                                        ? "bg-[#47775f] text-white"
                                        : "bg-[#e7ebe3] text-[#8a918b]"
                                    }`}
                            >
                                {completed ? "✓" : index + 1}
                            </div>

                            <span
                                className={`hidden sm:block text-[10px] uppercase tracking-[0.1em] font-semibold ${completed
                                        ? "text-[#47775f]"
                                        : "text-[#9a9f98]"
                                    }`}
                            >
                                {step.label}
                            </span>

                        </div>

                        {index !== steps.length - 1 && (
                            <div className="flex-1 h-px mx-3 sm:mx-5 bg-[#cfd4c8]">
                                <div
                                    className={`h-full transition-all ${index < activeIndex
                                            ? "bg-[#47775f]"
                                            : "bg-transparent"
                                        }`}
                                />
                            </div>
                        )}

                    </div>
                );
            })}

        </div>
    );
}

/* ============================================================
   STATUS
============================================================ */

function StatusBadge({ status }) {
    const config = {
        draft: {
            label: "Draft",
            className:
                "bg-[#eee9d8] text-[#856f36]",
        },

        simulated: {
            label: "Simulated",
            className:
                "bg-[#e2ebe5] text-[#47775f]",
        },

        completed: {
            label: "Completed",
            className:
                "bg-[#e7e1ec] text-[#6e617d]",
        },

        published: {
            label: "Published",
            className:
                "bg-[#dfe7dc] text-[#356b56]",
        },
    };

    const item =
        config[status] || config.draft;

    return (
        <span
            className={`px-2.5 py-1 rounded-full text-[9px] uppercase tracking-[0.12em] font-bold ${item.className}`}
        >
            {item.label}
        </span>
    );
}

/* ============================================================
   HEADER STAT
============================================================ */

function HeaderStat({
    label,
    value,
    accent,
}) {
    const accentClass =
        accent === "lime"
            ? "text-[#8ee276]"
            : accent === "yellow"
                ? "text-[#d8c77a]"
                : accent === "blue"
                    ? "text-[#8dc8b0]"
                    : "text-white";

    return (
        <div className="rounded-xl border border-white/10 bg-white/[0.045] px-4 sm:px-5 py-4">

            <p className="text-[9px] uppercase tracking-[0.17em] text-white/40 font-semibold">
                {label}
            </p>

            <p
                className={`mt-2 text-2xl sm:text-3xl font-bold tracking-[-0.05em] ${accentClass}`}
            >
                {value}
            </p>

        </div>
    );
}

/* ============================================================
   FORM FIELD
============================================================ */

function FormField({
    label,
    hint,
    children,
}) {
    return (
        <div>

            <label className="block text-[10px] uppercase tracking-[0.16em] font-bold text-[#687169] mb-2">
                {label}
            </label>

            {children}

            <p className="mt-2 text-[10px] text-[#9a9f98]">
                {hint}
            </p>

        </div>
    );
}

/* ============================================================
   ACTION BUTTON
============================================================ */

function ActionButton({
    children,
    variant = "primary",
    disabled,
    onClick,
}) {
    const classes = {
        primary:
            "bg-[#47775f] text-white hover:bg-[#38644f] shadow-sm",

        outline:
            "border border-[#47775f] text-[#47775f] hover:bg-[#dfe7dc]",

        soft:
            "border border-[#cfd4c8] bg-[#e7ebe3] text-[#101813] hover:bg-[#dfe7dc]",
    };

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all disabled:opacity-50 ${classes[variant]}`}
        >
            {children}
        </button>
    );
}

/* ============================================================
   LOADING
============================================================ */

function LoadingState() {
    return (
        <div className="rounded-2xl border border-[#cfd4c8] bg-[#f8f7f1] py-20 text-center">

            <div className="mx-auto w-9 h-9 rounded-full border-2 border-[#cfd4c8] border-t-[#47775f] animate-spin" />

            <p className="mt-5 text-sm font-semibold">
                Loading draw operations...
            </p>

            <p className="mt-1 text-xs text-[#8a918b]">
                Retrieving monthly draw records.
            </p>

        </div>
    );
}

/* ============================================================
   EMPTY
============================================================ */

function EmptyState() {
    return (
        <div className="rounded-2xl border border-[#cfd4c8] bg-[#f8f7f1] px-6 py-20 text-center">

            <div className="mx-auto w-14 h-14 rounded-2xl bg-[#dfe7dc] text-[#47775f] flex items-center justify-center text-2xl">
                +
            </div>

            <p className="mt-5 text-[10px] uppercase tracking-[0.17em] font-bold text-[#47775f]">
                No draw records
            </p>

            <h3 className="mt-2 text-xl font-bold tracking-[-0.03em]">
                No monthly draws yet.
            </h3>

            <p className="mt-2 text-sm text-[#687169]">
                Configure the first draw using the panel above.
            </p>

        </div>
    );
}

/* ============================================================
   WORKFLOW FOOTER STEP
============================================================ */

function WorkflowStep({
    number,
    title,
    text,
    active,
}) {
    return (
        <div
            className={`rounded-xl border p-5 ${active
                    ? "border-[#8ee276]/30 bg-[#8ee276]/10"
                    : "border-white/10 bg-white/[0.035]"
                }`}
        >

            <div
                className={`text-[10px] uppercase tracking-[0.15em] font-bold ${active
                        ? "text-[#8ee276]"
                        : "text-white/30"
                    }`}
            >
                {number}
            </div>

            <h3 className="mt-5 text-sm font-bold">
                {title}
            </h3>

            <p className="mt-2 text-xs leading-5 text-white/40">
                {text}
            </p>

        </div>
    );
}