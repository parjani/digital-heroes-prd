import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

function Scores() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [scores, setScores] = useState([]);
  const [score, setScore] = useState("");
  const [scoreDate, setScoreDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      fetchScores();
    }
  }, [user]);

  const fetchScores = async () => {
    const { data, error } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", user.id)
      .order("score_date", { ascending: false })
      .limit(5);

    if (error) {
      console.error(error);
      setError("Unable to load your scores.");
    } else {
      setScores(data || []);
    }

    setLoading(false);
  };

  const handleAddScore = async (e) => {
    e.preventDefault();

    setError("");

    const numericScore = Number(score);

    if (!numericScore || numericScore < 1 || numericScore > 45) {
      setError("Stableford score must be between 1 and 45.");
      return;
    }

    if (!scoreDate) {
      setError("Please select a score date.");
      return;
    }

    setSaving(true);

    try {
      const { data: existingScore } = await supabase
        .from("scores")
        .select("id")
        .eq("user_id", user.id)
        .eq("score_date", scoreDate)
        .maybeSingle();

      if (existingScore) {
        setError("You already have a score for this date.");
        setSaving(false);
        return;
      }

      const { error: insertError } = await supabase
        .from("scores")
        .insert({
          user_id: user.id,
          score: numericScore,
          score_date: scoreDate,
        });

      if (insertError) {
        console.error(insertError);
        setError("Unable to save score.");
        setSaving(false);
        return;
      }

      const { data: allScores } = await supabase
        .from("scores")
        .select("*")
        .eq("user_id", user.id)
        .order("score_date", { ascending: false });

      if (allScores && allScores.length > 5) {
        const oldScores = allScores.slice(5);
        const oldIds = oldScores.map((item) => item.id);

        await supabase
          .from("scores")
          .delete()
          .in("id", oldIds);
      }

      setScore("");
      setScoreDate("");

      await fetchScores();
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
    }

    setSaving(false);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this score?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("scores")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      setError("Unable to delete score.");
      return;
    }

    fetchScores();
  };

  const averageScore =
    scores.length > 0
      ? (
          scores.reduce((total, item) => total + Number(item.score), 0) /
          scores.length
        ).toFixed(1)
      : "—";

  const bestScore =
    scores.length > 0
      ? Math.max(...scores.map((item) => Number(item.score)))
      : "—";

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-[#f3f1e8] flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto w-10 h-10 rounded-full border-2 border-[#cfd4c8] border-t-[#47775f] animate-spin" />
          <p className="mt-4 text-sm text-[#687169]">
            Loading your scores...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f1e8] text-[#101813]">
      <main className="max-w-7xl mx-auto px-5 sm:px-7 lg:px-10 py-8 lg:py-12">

        {/* HERO */}
        <section className="relative overflow-hidden rounded-[2rem] bg-[#0d2117] text-white">
          {/* Decorative glow */}
          <div className="absolute -top-32 -right-20 w-96 h-96 rounded-full bg-[#8ee276]/10 blur-3xl" />
          <div className="absolute -bottom-40 left-1/3 w-96 h-96 rounded-full bg-[#47775f]/20 blur-3xl" />

          <div className="relative px-6 sm:px-8 lg:px-12 py-9 sm:py-11 lg:py-14">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">

              <div className="max-w-3xl">
                <div className="flex items-center gap-2 mb-5">
                  <span className="w-7 h-[2px] bg-[#8ee276]" />
                  <span className="text-[9px] uppercase tracking-[0.25em] text-[#8ee276] font-semibold">
                    Performance
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.05em] leading-[0.98]">
                  Your Stableford
                  <br />
                  <span className="text-[#8ee276]">scores.</span>
                </h1>

                <p className="mt-6 max-w-2xl text-sm sm:text-base text-white/55 leading-relaxed">
                  Keep your latest five Stableford scores updated.
                  Your performance helps power your monthly Digital
                  Heroes draw.
                </p>
              </div>

              {/* SCORE COUNT */}
              <div className="shrink-0">
                <div className="rounded-2xl bg-white/[0.07] border border-white/10 px-6 py-5 min-w-[190px] backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-white/40">
                      Scores tracked
                    </p>

                    <span className="w-2 h-2 rounded-full bg-[#8ee276]" />
                  </div>

                  <p className="mt-3 text-4xl font-bold tracking-tight">
                    {scores.length}
                    <span className="text-lg text-white/30 font-medium">
                      {" "}
                      / 5
                    </span>
                  </p>

                  <div className="mt-4 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-[#8ee276] rounded-full transition-all duration-500"
                      style={{
                        width: `${(scores.length / 5) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">

          <StatCard
            label="Scores tracked"
            value={scores.length}
            suffix="/ 5"
            icon="◒"
          />

          <StatCard
            label="Average score"
            value={averageScore}
            suffix=""
            icon="≈"
          />

          <StatCard
            label="Best score"
            value={bestScore}
            suffix={bestScore !== "—" ? "/ 45" : ""}
            icon="↗"
            highlight
          />

        </section>

       {/* ADD SCORE */}
<section className="mt-10">
  <div className="rounded-[1.75rem] bg-[#103523] overflow-hidden shadow-[0_20px_60px_rgba(13,33,23,0.12)]">

    {/* SECTION HEADER */}
    <div className="px-6 sm:px-8 lg:px-9 pt-7 pb-6 border-b border-white/10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-[2px] bg-[#8ee276]" />

            <p className="text-[9px] uppercase tracking-[0.24em] text-[#8ee276] font-semibold">
              Add performance
            </p>
          </div>

          <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-[-0.04em] text-white">
            Record a new score
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs text-white/45">
          <span className="w-2 h-2 rounded-full bg-[#8ee276]" />
          Stableford · 1–45
        </div>

      </div>
    </div>


    {/* FORM */}
    <div className="p-5 sm:p-7 lg:p-8">

      <form
        onSubmit={handleAddScore}
        className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
      >

        {/* SCORE */}
        <div className="md:col-span-4">
          <label className="block mb-2 text-[9px] uppercase tracking-[0.18em] font-semibold text-white/45">
            Stableford score
          </label>

          <div className="relative">
            <input
              type="number"
              min="1"
              max="45"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="36"
              className="
                w-full h-14
                px-4 pr-16
                rounded-xl
                bg-white/[0.07]
                border border-white/10
                text-lg font-semibold text-white
                placeholder:text-white/20
                outline-none
                transition-all
                focus:bg-white/[0.1]
                focus:border-[#8ee276]
                focus:ring-4
                focus:ring-[#8ee276]/10
              "
            />

            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] uppercase tracking-[0.14em] text-white/30">
              / 45
            </span>
          </div>
        </div>


        {/* DATE */}
        <div className="md:col-span-4">
          <label className="block mb-2 text-[9px] uppercase tracking-[0.18em] font-semibold text-white/45">
            Score date
          </label>

          <input
            type="date"
            value={scoreDate}
            onChange={(e) => setScoreDate(e.target.value)}
            className="
              w-full h-14
              px-4
              rounded-xl
              bg-white/[0.07]
              border border-white/10
              text-sm font-medium text-white
              outline-none
              transition-all
              focus:bg-white/[0.1]
              focus:border-[#8ee276]
              focus:ring-4
              focus:ring-[#8ee276]/10
            "
          />
        </div>


        {/* BUTTON */}
        <div className="md:col-span-4">
          <button
            type="submit"
            disabled={saving}
            className="
              group
              w-full h-14
              rounded-xl
              bg-[#8ee276]
              text-[#103523]
              font-bold text-sm
              shadow-[0_10px_30px_rgba(142,226,118,0.12)]
              hover:bg-[#a0ed89]
              hover:-translate-y-0.5
              transition-all
              disabled:opacity-50
              disabled:cursor-not-allowed
              disabled:hover:translate-y-0
              flex items-center justify-center
            "
          >
            <span>
              {saving ? "Saving score..." : "Add score"}
            </span>

            {!saving && (
              <span className="ml-2 text-base group-hover:translate-x-1 transition-transform">
                →
              </span>
            )}
          </button>
        </div>

      </form>


      {/* HELPER TEXT */}
      <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

        <p className="text-[11px] text-white/30">
          Enter your Stableford points and the date you played.
        </p>

        <p className="text-[10px] uppercase tracking-[0.12em] text-white/25">
          One score per date
        </p>

      </div>


      {/* ERROR */}
      {error && (
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-red-300/20 bg-red-400/10 px-4 py-3.5 text-sm text-red-200">
          <span className="w-7 h-7 shrink-0 rounded-full bg-red-400/10 flex items-center justify-center font-semibold">
            !
          </span>

          <span>{error}</span>
        </div>
      )}

    </div>
  </div>
</section>

        {/* RECENT SCORES */}
        <section className="mt-12">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5">
            <div> 
              <div className="flex items-center gap-2">
                <span className="w-6 h-[2px] bg-[#47775f]" />
                <p className="text-[9px] uppercase tracking-[0.23em] text-[#47775f] font-semibold">
                  Recent performance
                </p>
              </div>

              <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-[-0.04em]">
                Latest five scores
              </h2>
            </div>

            <p className="text-xs uppercase tracking-[0.12em] text-[#8a918b]">
              Newest first
            </p>
          </div>

          {scores.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-[#cfd4c8] bg-white/60 px-6 py-16 text-center">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-[#dfe7dc] text-[#47775f] flex items-center justify-center text-xl">
                ◒
              </div>

              <h3 className="mt-5 text-lg font-semibold">
                No scores yet
              </h3>

              <p className="mt-2 text-sm text-[#8a918b]">
                Add your first Stableford score above.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {scores.map((item, index) => (
                <div
                  key={item.id}
                  className={`group rounded-2xl border p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 ${
                    index === 0
                      ? "bg-[#103523] border-[#103523] text-white shadow-[0_15px_40px_rgba(13,33,23,0.12)]"
                      : "bg-white border-[#d9ddd4] hover:border-[#b9c4b8] hover:shadow-[0_12px_35px_rgba(16,24,19,0.06)]"
                  }`}
                >
                  <div className="grid grid-cols-12 items-center gap-3">

                    {/* INDEX */}
                    <div className="col-span-2 sm:col-span-1">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          index === 0
                            ? "bg-[#8ee276] text-[#103523]"
                            : "bg-[#f0f2ed] text-[#687169]"
                        }`}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </div>
                    </div>

                    {/* SCORE */}
                    <div className="col-span-5 sm:col-span-4">
                      <div className="flex items-end gap-2">
                        <span className="text-3xl sm:text-4xl font-bold tracking-tight">
                          {item.score}
                        </span>

                        <span
                          className={`mb-1 text-[9px] uppercase tracking-[0.12em] ${
                            index === 0
                              ? "text-white/40"
                              : "text-[#8a918b]"
                          }`}
                        >
                          Stableford
                        </span>
                      </div>
                    </div>

                    {/* DATE */}
                    <div className="col-span-4 sm:col-span-5">
                      <p
                        className={`text-[9px] uppercase tracking-[0.14em] ${
                          index === 0
                            ? "text-white/35"
                            : "text-[#8a918b]"
                        }`}
                      >
                        Recorded
                      </p>

                      <p
                        className={`mt-1 text-sm font-medium ${
                          index === 0
                            ? "text-white/80"
                            : "text-[#303a34]"
                        }`}
                      >
                        {new Date(
                          item.score_date
                        ).toLocaleDateString(undefined, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    {/* DELETE */}
                    <div className="col-span-1 text-right">
                      <button
                        onClick={() => handleDelete(item.id)}
                        title="Delete score"
                        className={`w-9 h-9 rounded-full flex items-center justify-center ml-auto transition-all ${
                          index === 0
                            ? "text-white/40 hover:bg-white/10 hover:text-white"
                            : "text-[#a0a7a0] hover:bg-red-50 hover:text-red-600"
                        }`}
                      >
                        ×
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* HOW IT WORKS */}
        <section className="mt-12">
          <div className="rounded-[1.5rem] bg-[#dfe7dc] border border-[#cfd8cb] overflow-hidden">
            <div className="grid lg:grid-cols-12">

              <div className="lg:col-span-4 bg-[#103523] text-white p-7 sm:p-9">
                <div className="w-11 h-11 rounded-xl bg-[#8ee276] text-[#103523] flex items-center justify-center font-bold">
                  ?
                </div>

                <p className="mt-7 text-[9px] uppercase tracking-[0.22em] text-[#8ee276] font-semibold">
                  How it works
                </p>

                <h3 className="mt-3 text-2xl font-bold tracking-[-0.04em]">
                  Your scores fuel your draw.
                </h3>
              </div>

              <div className="lg:col-span-8 p-7 sm:p-9">
                <p className="max-w-2xl text-sm sm:text-base text-[#687169] leading-relaxed">
                  Your five most recent Stableford scores are used when
                  generating your monthly draw entries. When you add a
                  sixth score, your oldest score is automatically removed
                  from tracked performance.
                </p>

                <div className="mt-7 flex flex-wrap gap-2">
                  <InfoPill text="1–45 score range" />
                  <InfoPill text="5 scores maximum" />
                  <InfoPill text="Monthly draw" />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="mt-10 pb-6">
          <div className="rounded-[1.5rem] bg-[#f8f7f1] border border-[#d9ddd4] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-[#47775f] font-semibold">
                Keep playing
              </p>

              <h3 className="mt-2 text-xl font-bold tracking-[-0.03em]">
                Every score adds to your journey.
              </h3>
            </div>

            <button
              onClick={() => navigate("/dashboard")}
              className="group shrink-0 inline-flex items-center justify-center px-5 py-3 rounded-full bg-[#0d2117] text-white text-sm font-semibold hover:bg-[#103523] transition-all"
            >
              Back to dashboard
              <span className="ml-2 group-hover:translate-x-1 transition-transform">
                →
              </span>
            </button>
          </div>
        </section>

      </main>
    </div>
  );
}

function StatCard({ label, value, suffix, icon, highlight = false }) {
  return (
    <div
      className={`rounded-2xl border p-5 sm:p-6 transition-all hover:-translate-y-0.5 ${
        highlight
          ? "bg-[#dfe7dc] border-[#c7d2c4]"
          : "bg-white border-[#d9ddd4]"
      }`}
    >
      <div className="flex items-start justify-between">
        <p className="text-[9px] uppercase tracking-[0.18em] text-[#8a918b] font-semibold">
          {label}
        </p>

        <span
          className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm ${
            highlight
              ? "bg-[#8ee276] text-[#103523]"
              : "bg-[#eef1eb] text-[#47775f]"
          }`}
        >
          {icon}
        </span>
      </div>

      <div className="mt-5 flex items-baseline gap-1">
        <span className="text-3xl font-bold tracking-tight">
          {value}
        </span>

        {suffix && (
          <span className="text-sm font-medium text-[#8a918b]">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function InfoPill({ text }) {
  return (
    <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white border border-[#cfd8cb] text-[10px] uppercase tracking-[0.1em] text-[#687169]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#47775f]" />
      {text}
    </span>
  );
}

export default Scores;