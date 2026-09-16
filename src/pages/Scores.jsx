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

    // Validation
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
      // Check whether a score already exists for this date
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

      // Add score
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

      // Get all scores
      const { data: allScores } = await supabase
        .from("scores")
        .select("*")
        .eq("user_id", user.id)
        .order("score_date", { ascending: false });

      // Keep only latest 5
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f3ea] text-[#101813] flex items-center justify-center">
        Loading scores...
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-[#f3f1e8] text-[#101813]">

    


    <main className="max-w-7xl mx-auto px-6 lg:px-10 py-12 md:py-16">

      {/* HEADER */}
      <section className="border-b border-[#cfd4c8] pb-12">

        <p className="text-xs uppercase tracking-[0.25em] text-[#47775f]">
          § 01 · Performance
        </p>

        <div className="mt-5 grid lg:grid-cols-12 gap-10">

          <div className="lg:col-span-8">

            <h1 className="text-5xl md:text-6xl font-semibold tracking-[-0.045em] leading-[0.95]">
              Your Stableford
              <br />
              <span className="text-[#47775f]">scores.</span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg text-[#687169] leading-relaxed">
              Keep your five most recent scores updated. These scores
              are used for your monthly Digital Heroes draw.
            </p>

          </div>

          <div className="lg:col-span-4 lg:flex lg:justify-end lg:items-end">

            <div className="border border-[#cfd4c8] bg-[#dfe5da] px-7 py-6 min-w-[180px]">

              <p className="text-xs uppercase tracking-[0.18em] text-[#687169]">
                Scores tracked
              </p>

              <p className="mt-3 text-5xl font-semibold">
                {scores.length}
                <span className="text-2xl text-[#8a918b]"> / 5</span>
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* ADD SCORE */}
      <section className="border-b border-[#cfd4c8]">

        <div className="py-12">

          <div className="mb-8">

            <p className="text-xs uppercase tracking-[0.25em] text-[#8a918b]">
              § 02 · Add performance
            </p>

            <h2 className="text-2xl md:text-3xl font-semibold mt-3">
              Add a new score
            </h2>

          </div>


          <div className="border border-[#cfd4c8] bg-[#e7ebe3] p-6 md:p-8">

            <form
              onSubmit={handleAddScore}
              className="grid grid-cols-1 md:grid-cols-12 gap-5"
            >

              {/* SCORE */}
              <div className="md:col-span-4">

                <label className="block mb-2 text-sm font-medium text-[#303a34]">
                  Stableford score
                </label>

                <input
                  type="number"
                  min="1"
                  max="45"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="Example: 36"
                  className="w-full px-4 py-3.5 rounded-xl border border-[#c9d0c6] bg-[#f8f7f1] text-[#101813] placeholder:text-[#9a9f99] outline-none transition focus:border-[#47775f] focus:ring-4 focus:ring-[#47775f]/10"
                />

                <p className="text-xs text-[#8a918b] mt-2">
                  Enter a score between 1 and 45.
                </p>

              </div>


              {/* DATE */}
              <div className="md:col-span-4">

                <label className="block mb-2 text-sm font-medium text-[#303a34]">
                  Score date
                </label>

                <input
                  type="date"
                  value={scoreDate}
                  onChange={(e) => setScoreDate(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-[#c9d0c6] bg-[#f8f7f1] text-[#101813] outline-none transition focus:border-[#47775f] focus:ring-4 focus:ring-[#47775f]/10"
                />

                <p className="text-xs text-[#8a918b] mt-2">
                  One score can be recorded per date.
                </p>

              </div>


              {/* BUTTON */}
              <div className="md:col-span-4 flex items-end">

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full px-5 py-3.5 rounded-xl bg-[#47775f] text-white font-semibold hover:bg-[#38644f] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Add score →"}
                </button>

              </div>

            </form>


            {/* ERROR */}
            {error && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

          </div>

        </div>

      </section>


      {/* LATEST SCORES */}
      <section className="border-b border-[#cfd4c8]">

        <div className="py-12">

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">

            <div>

              <p className="text-xs uppercase tracking-[0.25em] text-[#47775f]">
                § 03 · Recent performance
              </p>

              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mt-3">
                Latest five scores
              </h2>

            </div>

            <p className="text-sm text-[#8a918b]">
              Newest first
            </p>

          </div>


          {scores.length === 0 ? (

            <div className="border border-[#cfd4c8] bg-[#e7ebe3] p-12 text-center">

              <p className="text-[#687169]">
                No scores added yet.
              </p>

              <p className="text-sm text-[#8a918b] mt-2">
                Add your first Stableford score above.
              </p>

            </div>

          ) : (

            <div className="border-t border-l border-[#cfd4c8]">

              {scores.map((item, index) => (

                <div
                  key={item.id}
                  className={`group grid grid-cols-12 items-center border-r border-b border-[#cfd4c8] ${
                    index === 0 ? "bg-[#dfe5da]" : "bg-[#f8f7f1]"
                  }`}
                >

                  {/* NUMBER */}
                  <div className="col-span-2 sm:col-span-1 p-5 md:p-7">

                    <p className="text-xs uppercase tracking-[0.15em] text-[#8a918b]">
                      {String(index + 1).padStart(2, "0")}
                    </p>

                  </div>


                  {/* SCORE */}
                  <div className="col-span-4 sm:col-span-3 p-5 md:p-7 border-l border-[#cfd4c8]">

                    <p className="text-4xl md:text-5xl font-semibold tracking-tight">
                      {item.score}
                    </p>

                    <p className="text-xs uppercase tracking-[0.12em] text-[#8a918b] mt-1">
                      Stableford
                    </p>

                  </div>


                  {/* DATE */}
                  <div className="col-span-4 sm:col-span-6 p-5 md:p-7 border-l border-[#cfd4c8]">

                    <p className="text-sm text-[#687169]">
                      Score recorded
                    </p>

                    <p className="mt-1 font-medium">
                      {new Date(
                        item.score_date
                      ).toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>

                  </div>


                  {/* DELETE */}
                  <div className="col-span-2 sm:col-span-2 p-5 md:p-7 border-l border-[#cfd4c8] text-right">

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-xs uppercase tracking-[0.12em] text-[#9a5c5c] hover:text-red-700 transition"
                    >
                      Delete
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </section>


      {/* INFORMATION */}
      <section>

        <div className="py-10">

          <div className="grid md:grid-cols-12 gap-8">

            <div className="md:col-span-3">

              <p className="text-xs uppercase tracking-[0.25em] text-[#8a918b]">
                § 04 · How it works
              </p>

            </div>

            <div className="md:col-span-7 md:col-start-5">

              <p className="text-[#687169] leading-relaxed">
                Your five most recent Stableford scores are used when
                generating your monthly draw entries. When you add a
                sixth score, the oldest score is automatically removed
                from your tracked performance.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">

                <span className="px-4 py-2 border border-[#cfd4c8] bg-[#f8f7f1] text-xs uppercase tracking-[0.12em] text-[#687169]">
                  1–45 score range
                </span>

                <span className="px-4 py-2 border border-[#cfd4c8] bg-[#f8f7f1] text-xs uppercase tracking-[0.12em] text-[#687169]">
                  5 scores maximum
                </span>

                <span className="px-4 py-2 border border-[#cfd4c8] bg-[#f8f7f1] text-xs uppercase tracking-[0.12em] text-[#687169]">
                  Monthly draw
                </span>

              </div>

            </div>

          </div>

        </div>

      </section>

    </main>


    

  </div>
);
}

export default Scores;