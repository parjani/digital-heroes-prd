import { supabase } from "../lib/supabaseClient";

// --------------------------------------------------
// GENERATE RANDOM WINNING NUMBERS
// --------------------------------------------------

// --------------------------------------------------
// RANDOM WINNING NUMBERS
// --------------------------------------------------

export function generateWinningNumbers() {
    const numbers = [];

    while (numbers.length < 5) {
        const number =
            Math.floor(Math.random() * 45) + 1;

        if (!numbers.includes(number)) {
            numbers.push(number);
        }
    }

    return numbers.sort((a, b) => a - b);
}

// --------------------------------------------------
// ALGORITHMIC WINNING NUMBERS
// --------------------------------------------------

export async function generateAlgorithmicWinningNumbers() {
    const { data, error } = await supabase
        .from("scores")
        .select("score");

    if (error) {
        throw error;
    }

    if (!data || data.length === 0) {
        // No score history available.
        // Fall back to a random draw.
        return generateWinningNumbers();
    }

    // Count how frequently each score appears.
    const frequency = {};

    for (const item of data) {
        const score = Number(item.score);

        if (
            score >= 1 &&
            score <= 45
        ) {
            frequency[score] =
                (frequency[score] || 0) + 1;
        }
    }

    const weightedNumbers = [];

    // Higher-frequency scores get more
    // entries in the weighted pool.
    for (let score = 1; score <= 45; score++) {
        const count = frequency[score] || 0;

        // Give every valid score at least
        // one chance.
        const weight = Math.max(
            1,
            count
        );

        for (let i = 0; i < weight; i++) {
            weightedNumbers.push(score);
        }
    }

    const selected = [];

    while (selected.length < 5) {
        const randomIndex =
            Math.floor(
                Math.random() *
                weightedNumbers.length
            );

        const selectedNumber =
            weightedNumbers[randomIndex];

        if (
            !selected.includes(
                selectedNumber
            )
        ) {
            selected.push(
                selectedNumber
            );
        }
    }

    return selected.sort(
        (a, b) => a - b
    );
}

// --------------------------------------------------
// CALCULATE MATCH COUNT
// --------------------------------------------------

export function calculateMatchCount(
    userScores,
    winningNumbers
) {
    return userScores.filter((score) =>
        winningNumbers.includes(Number(score))
    ).length;
}

// --------------------------------------------------
// GET USER'S LATEST 5 SCORES
// --------------------------------------------------

export async function getLatestFiveScores(userId) {
    console.log("===== getLatestFiveScores START =====");
    console.log("USER ID RECEIVED:", userId);

    const { data, error } = await supabase
        .from("scores")
        .select("id, user_id, score, score_date")
        .eq("user_id", userId)
        .order("score_date", { ascending: false })
        .limit(5);

    console.log("SCORES QUERY DATA:", data);
    console.log("SCORES QUERY ERROR:", error);

    if (error) {
        console.error("getLatestFiveScores ERROR:", error);
        return [];
    }

    console.log("SCORES COUNT:", data?.length || 0);
    console.log("===== getLatestFiveScores END =====");

    return data || [];
}

// --------------------------------------------------
// CREATE DRAW
// --------------------------------------------------

export async function createDraw(
    drawMonth,
    drawYear,
    drawType = "random",
    prizePool = 0
) {
    if (!drawMonth || !drawYear) {
        throw new Error(
            "Draw month and year are required."
        );
    }

    if (
        drawMonth < 1 ||
        drawMonth > 12
    ) {
        throw new Error(
            "Draw month must be between 1 and 12."
        );
    }

    const { data: existingDraw, error: checkError } =
        await supabase
            .from("draws")
            .select("id")
            .eq("draw_month", drawMonth)
            .eq("draw_year", drawYear)
            .maybeSingle();

    if (checkError) {
        throw checkError;
    }

    if (existingDraw) {
        throw new Error(
            "A draw already exists for this month."
        );
    }

    const { data, error } = await supabase
        .from("draws")
        .insert({
            draw_month: drawMonth,
            draw_year: drawYear,
            draw_type: drawType,
            status: "draft",
            prize_pool: Number(prizePool || 0),
            jackpot_amount: 0,
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}

// --------------------------------------------------
// SIMULATE DRAW
// --------------------------------------------------

export async function simulateDraw(
    drawId,
    drawType = "random"
) {
    if (!drawId) {
        throw new Error(
            "Draw ID is required."
        );
    }

    let winningNumbers;

    if (drawType === "algorithmic") {
        winningNumbers =
            await generateAlgorithmicWinningNumbers();
    } else {
        winningNumbers =
            generateWinningNumbers();
    }

    const { data, error } = await supabase
        .from("draws")
        .update({
            winning_numbers:
                winningNumbers,
            status: "simulated",
        })
        .eq("id", drawId)
        .eq("status", "draft")
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}

// --------------------------------------------------
// GET CURRENTLY ACTIVE SUBSCRIPTIONS
// --------------------------------------------------

async function getEligibleSubscriptions() {
    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from("subscriptions")
        .select(
            "id, user_id, status, current_period_end"
        )
        .eq("status", "active")
        .or(
            `current_period_end.is.null,current_period_end.gte.${now}`
        );

    if (error) {
        throw error;
    }

    return data || [];
}

// --------------------------------------------------
// CALCULATE DRAW RESULTS
// --------------------------------------------------

export async function calculateDrawResults(draw) {
    console.log("===== calculateDrawResults START =====");

    if (!draw?.id) {
        throw new Error("Invalid draw.");
    }

    if (!draw?.winning_numbers?.length) {
        throw new Error(
            "This draw does not have winning numbers."
        );
    }

    console.log(
        "Winning numbers:",
        draw.winning_numbers
    );

    const subscriptions =
        await getEligibleSubscriptions();

    console.log(
        "ELIGIBLE SUBSCRIPTIONS:",
        subscriptions
    );

    console.log(
        "ELIGIBLE SUBSCRIPTIONS COUNT:",
        subscriptions.length
    );

    if (!subscriptions.length) {
        console.warn(
            "NO ELIGIBLE SUBSCRIPTIONS"
        );
        return [];
    }

    const results = [];

    console.log(
        "STARTING SUBSCRIPTION LOOP"
    );

    for (const subscription of subscriptions) {

        console.log(
            "--------------------------------"
        );

        console.log(
            "CHECKING USER:",
            subscription.user_id
        );

        const scores =
            await getLatestFiveScores(
                subscription.user_id
            );

        console.log(
            "USER SCORES:",
            scores
        );

        console.log(
            "NUMBER OF SCORES:",
            scores.length
        );

        if (scores.length < 5) {
            console.warn(
                "USER SKIPPED - LESS THAN 5 SCORES:",
                subscription.user_id
            );
            continue;
        }

        const numbers = scores.map(
            (item) => Number(item.score)
        );

        console.log(
            "USER NUMBERS:",
            numbers
        );

        console.log(
            "DRAW NUMBERS:",
            draw.winning_numbers
        );

        const matchCount =
            calculateMatchCount(
                numbers,
                draw.winning_numbers
            );

        console.log(
            "MATCH COUNT:",
            matchCount
        );

        if (matchCount >= 3) {

            console.log(
                "✅ QUALIFIED:",
                subscription.user_id
            );

            results.push({
                user_id:
                    subscription.user_id,

                draw_id:
                    draw.id,

                numbers,

                match_count:
                    matchCount,
            });

        } else {

            console.log(
                "❌ NOT QUALIFIED:",
                subscription.user_id,
                "matches:",
                matchCount
            );
        }
    }

    console.log(
        "FINAL RESULTS:",
        results
    );

    console.log(
        "===== calculateDrawResults END ====="
    );

    return results;
}

// --------------------------------------------------
// PRIZE DISTRIBUTION
// --------------------------------------------------

export function calculatePrizeDistribution(
    winners,
    prizePool,
    previousJackpot = 0
) {
    const totalPool =
        Number(prizePool || 0) +
        Number(previousJackpot || 0);

    const fiveMatchWinners =
        winners.filter(
            (winner) =>
                winner.match_count === 5
        );

    const fourMatchWinners =
        winners.filter(
            (winner) =>
                winner.match_count === 4
        );

    const threeMatchWinners =
        winners.filter(
            (winner) =>
                winner.match_count === 3
        );

    // PRD distribution:
    // 40% → 5 matches
    // 35% → 4 matches
    // 25% → 3 matches

    const fivePool =
        totalPool * 0.40;

    const fourPool =
        totalPool * 0.35;

    const threePool =
        totalPool * 0.25;

    // If nobody gets all 5,
    // the 40% portion rolls into jackpot.
    const jackpotRollover =
        fiveMatchWinners.length === 0
            ? fivePool
            : 0;

    const fivePrize =
        fiveMatchWinners.length > 0
            ? fivePool /
            fiveMatchWinners.length
            : 0;

    const fourPrize =
        fourMatchWinners.length > 0
            ? fourPool /
            fourMatchWinners.length
            : 0;

    const threePrize =
        threeMatchWinners.length > 0
            ? threePool /
            threeMatchWinners.length
            : 0;

    const distributedWinners =
        winners.map((winner) => {

            let prizeAmount = 0;

            if (
                winner.match_count === 5
            ) {
                prizeAmount = fivePrize;
            }

            if (
                winner.match_count === 4
            ) {
                prizeAmount = fourPrize;
            }

            if (
                winner.match_count === 3
            ) {
                prizeAmount = threePrize;
            }

            return {
                ...winner,
                prize_amount: Number(
                    prizeAmount.toFixed(2)
                ),
            };
        });

    return {
        winners: distributedWinners,

        jackpotRollover: Number(
            jackpotRollover.toFixed(2)
        ),

        totalPool: Number(
            totalPool.toFixed(2)
        ),
    };
}

// --------------------------------------------------
// SAVE DRAW RESULTS
// --------------------------------------------------

export async function saveDrawResults(
    draw,
    calculatedResults,
    prizePool
) {
    if (!draw?.id) {
        throw new Error(
            "Invalid draw."
        );
    }

    if (
        !draw?.winning_numbers?.length
    ) {
        throw new Error(
            "Draw has no winning numbers."
        );
    }

    const distribution =
        calculatePrizeDistribution(
            calculatedResults,
            prizePool,
            draw.jackpot_amount
        );

    // ----------------------------------------------
    // SAVE DRAW ENTRIES
    // ----------------------------------------------

    if (calculatedResults.length > 0) {

        const entries =
            calculatedResults.map(
                (result) => ({
                    draw_id: draw.id,
                    user_id: result.user_id,
                    numbers: result.numbers,
                    match_count:
                        result.match_count,
                })
            );

        const {
            error: entryError,
        } = await supabase
            .from("draw_entries")
            .upsert(entries, {
                onConflict:
                    "draw_id,user_id",
            });

        if (entryError) {
            throw entryError;
        }

        // ------------------------------------------
        // SAVE WINNERS
        // ------------------------------------------

        const winners =
            distribution.winners.map(
                (winner) => ({
                    draw_id: draw.id,
                    user_id:
                        winner.user_id,
                    match_count:
                        winner.match_count,
                    prize_amount:
                        winner.prize_amount,
                    verification_status:
                        "pending",
                    payment_status:
                        "pending",
                })
            );

        if (winners.length > 0) {

            const {
                error: winnerError,
            } = await supabase
                .from("winners")
                .upsert(winners, {
                    onConflict:
                        "draw_id,user_id",
                });

            if (winnerError) {
                throw winnerError;
            }
        }
    }

    // ----------------------------------------------
    // UPDATE DRAW
    // ----------------------------------------------

    const {
        error: drawError,
    } = await supabase
        .from("draws")
        .update({
            prize_pool:
                distribution.totalPool,

            jackpot_amount:
                distribution.jackpotRollover,
        })
        .eq("id", draw.id);

    if (drawError) {
        throw drawError;
    }

    return distribution;
}

// --------------------------------------------------
// PUBLISH DRAW
// --------------------------------------------------

export async function publishDraw(
    drawId
) {
    if (!drawId) {
        throw new Error(
            "Draw ID is required."
        );
    }

    const {
        data: draw,
        error: fetchError,
    } = await supabase
        .from("draws")
        .select("*")
        .eq("id", drawId)
        .single();

    if (fetchError) {
        throw fetchError;
    }

    if (
        draw.status !== "simulated"
    ) {
        throw new Error(
            "Only simulated draws can be published."
        );
    }

    if (
        !draw.winning_numbers?.length
    ) {
        throw new Error(
            "The draw does not have winning numbers."
        );
    }

    const {
        data,
        error,
    } = await supabase
        .from("draws")
        .update({
            status: "published",
            published_at:
                new Date().toISOString(),
        })
        .eq("id", drawId)
        .eq("status", "simulated")
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}