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

  const handleSave = async () => {
    if (!selectedCharity) {
        alert("Please select a charity.");
        return;
    }

    if (Number(percentage) < 10 || Number(percentage) > 100) {
        alert("Percentage must be between 10% and 100%.");
        return;
    }

    try {
        setSaving(true);

        const { error } = await supabase.rpc(
            "update_my_charity_preferences",
            {
                p_charity_id: selectedCharity,
                p_charity_percentage: Number(percentage),
            }
        );

        if (error) {
            throw error;
        }

        alert("Charity preference saved successfully.");

        navigate("/dashboard", {
            state: {
                refreshDashboard: true,
            },
        });
    } catch (error) {
        console.error("Save charity preference error:", error);
        alert(error.message || "Unable to save charity preference.");
    } finally {
        setSaving(false);
    }
};

  const selectedCharityData = charities.find(
    (charity) => charity.id === selectedCharity
  );

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-[#f3f1e8] flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto w-10 h-10 rounded-full border-2 border-[#cfd4c8] border-t-[#47775f] animate-spin" />

          <p className="mt-4 text-sm text-[#687169]">
            Loading charities...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f1e8] text-[#101813]">
      <main className="max-w-7xl mx-auto px-5 sm:px-7 lg:px-10 py-8 lg:py-12">

        {/* =====================================================
            HERO
        ====================================================== */}
        <section className="relative overflow-hidden rounded-[2rem] bg-[#0d2117] text-white">

          {/* Decorative glow */}
          <div className="absolute -top-32 -right-20 w-96 h-96 rounded-full bg-[#8ee276]/10 blur-3xl" />

          <div className="absolute -bottom-40 left-1/3 w-96 h-96 rounded-full bg-[#47775f]/20 blur-3xl" />

          <div className="relative px-6 sm:px-8 lg:px-12 py-10 sm:py-12 lg:py-14">

            <div className="grid lg:grid-cols-12 gap-10 items-end">

              {/* HERO TEXT */}
              <div className="lg:col-span-8">

                <div className="flex items-center gap-2 mb-5">
                  <span className="w-7 h-[2px] bg-[#8ee276]" />

                  <span className="text-[9px] uppercase tracking-[0.25em] text-[#8ee276] font-semibold">
                    Your impact
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.05em] leading-[0.98]">
                  Choose where your
                  <br />
                  <span className="text-[#8ee276]">
                    impact goes.
                  </span>
                </h1>

                <p className="mt-6 max-w-2xl text-sm sm:text-base text-white/55 leading-relaxed">
                  Choose a cause you care about and decide how much
                  of your eligible winnings you want to contribute.
                </p>

              </div>


              {/* MINIMUM CONTRIBUTION */}
              <div className="lg:col-span-4 lg:flex lg:justify-end">

                <div className="w-full sm:w-[220px] lg:w-[230px] rounded-2xl bg-white/[0.07] border border-white/10 p-5 backdrop-blur-sm">

                  <div className="flex items-center justify-between">

                    <p className="text-[9px] uppercase tracking-[0.2em] text-white/40">
                      Minimum
                    </p>

                    <span className="w-2 h-2 rounded-full bg-[#8ee276]" />

                  </div>

                  <p className="mt-4 text-4xl font-bold">
                    10%
                  </p>

                  <p className="mt-2 text-xs text-white/35 leading-relaxed">
                    of eligible winnings can be directed to your chosen charity.
                  </p>

                </div>

              </div>

            </div>

          </div>
        </section>


        <form onSubmit={handleSave}>

          {/* =====================================================
              CHARITY SELECTION
          ====================================================== */}
          <section className="mt-10">

            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-6">

              <div>

                <div className="flex items-center gap-2">

                  <span className="w-6 h-[2px] bg-[#47775f]" />

                  <p className="text-[9px] uppercase tracking-[0.23em] text-[#47775f] font-semibold">
                    Select a charity
                  </p>

                </div>

                <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-[-0.04em]">
                  Put your winnings behind a cause.
                </h2>

              </div>

              <p className="text-xs text-[#8a918b]">
                {charities.length} active{" "}
                {charities.length === 1 ? "charity" : "charities"}
              </p>

            </div>


            {/* CHARITY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

              {charities.map((charity, index) => {

                const isSelected =
                  selectedCharity === charity.id;

                return (
                  <button
                    type="button"
                    key={charity.id}
                    onClick={() =>
                      setSelectedCharity(charity.id)
                    }
                    className={`
                      group
                      relative
                      text-left
                      rounded-[1.5rem]
                      border
                      p-6
                      sm:p-7
                      min-h-[240px]
                      transition-all
                      duration-300
                      hover:-translate-y-1
                      ${isSelected
                        ? "bg-[#103523] border-[#103523] text-white shadow-[0_18px_45px_rgba(13,33,23,0.14)]"
                        : "bg-white border-[#d9ddd4] hover:border-[#b9c4b8] hover:shadow-[0_15px_40px_rgba(16,24,19,0.06)]"
                      }
                    `}
                  >

                    {/* TOP ROW */}
                    <div className="flex items-center justify-between">

                      <span
                        className={`
                          w-9 h-9 rounded-xl flex items-center justify-center
                          text-[10px] font-bold
                          ${isSelected
                            ? "bg-[#8ee276] text-[#103523]"
                            : "bg-[#eef1eb] text-[#47775f]"
                          }
                        `}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>


                      {/* SELECT INDICATOR */}
                      <span
                        className={`
                          w-6 h-6 rounded-full border flex items-center justify-center transition-all
                          ${isSelected
                            ? "border-[#8ee276] bg-[#8ee276]"
                            : "border-[#c9d0c6] bg-transparent group-hover:border-[#47775f]"
                          }
                        `}
                      >
                        {isSelected && (
                          <span className="text-[#103523] text-xs font-bold">
                            ✓
                          </span>
                        )}
                      </span>

                    </div>


                    {/* CONTENT */}
                    <div className="mt-9">

                      <h3
                        className={`
                          text-xl font-bold tracking-[-0.03em]
                          ${isSelected
                            ? "text-white"
                            : "text-[#101813]"
                          }
                        `}
                      >
                        {charity.name}
                      </h3>

                      <p
                        className={`
                          mt-3 text-sm leading-6
                          ${isSelected
                            ? "text-white/50"
                            : "text-[#687169]"
                          }
                        `}
                      >
                        {charity.description ||
                          "Supporting meaningful community impact."}
                      </p>

                    </div>


                    {/* SELECTED */}
                    <div className="absolute left-6 bottom-6">

                      {isSelected && (
                        <span className="inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.16em] font-semibold text-[#8ee276]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#8ee276]" />
                          Selected
                        </span>
                      )}

                    </div>

                  </button>
                );
              })}

            </div>

          </section>


          {/* =====================================================
              CONTRIBUTION
          ====================================================== */}
          <section className="mt-12">

            <div className="grid lg:grid-cols-12 gap-5">

              {/* LEFT */}
              <div className="lg:col-span-8 rounded-[1.75rem] bg-white border border-[#d9ddd4] p-6 sm:p-8">

                <div className="flex items-center gap-2">

                  <span className="w-6 h-[2px] bg-[#47775f]" />

                  <p className="text-[9px] uppercase tracking-[0.23em] text-[#47775f] font-semibold">
                    Contribution
                  </p>

                </div>

                <h2 className="mt-3 text-2xl sm:text-3xl font-bold tracking-[-0.04em]">
                  Decide how much you give.
                </h2>

                <p className="mt-3 max-w-xl text-sm text-[#687169] leading-relaxed">
                  Choose the percentage of your eligible winnings
                  that should go towards your selected charity.
                </p>


                {/* RANGE */}
                <div className="mt-9">

                  <div className="flex items-end justify-between mb-4">

                    <span className="text-[9px] uppercase tracking-[0.16em] font-semibold text-[#8a918b]">
                      Contribution level
                    </span>

                    <span className="text-sm font-bold text-[#47775f]">
                      {percentage}%
                    </span>

                  </div>


                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={percentage}
                    onChange={(e) =>
                      setPercentage(e.target.value)
                    }
                    className="w-full h-2 rounded-full accent-[#47775f] cursor-pointer"
                  />


                  <div className="flex justify-between mt-3 text-[10px] text-[#9aa19a]">
                    <span>10% minimum</span>
                    <span>100%</span>
                  </div>

                </div>


                {/* QUICK SELECT */}
                <div className="mt-7">

                  <p className="text-[9px] uppercase tracking-[0.15em] text-[#8a918b] font-semibold mb-3">
                    Quick select
                  </p>

                  <div className="flex flex-wrap gap-2">

                    {[10, 20, 30, 50, 75, 100].map(
                      (value) => (
                        <button
                          type="button"
                          key={value}
                          onClick={() =>
                            setPercentage(value)
                          }
                          className={`
                            px-4 py-2.5 rounded-full text-xs font-semibold
                            border transition-all
                            ${Number(percentage) === value
                              ? "bg-[#103523] border-[#103523] text-white"
                              : "bg-[#f8f7f1] border-[#d4d9d1] text-[#687169] hover:border-[#47775f] hover:text-[#47775f]"
                            }
                          `}
                        >
                          {value}%
                        </button>
                      )
                    )}

                  </div>

                </div>

              </div>


              {/* RIGHT CONTRIBUTION DISPLAY */}
              <div className="lg:col-span-4 rounded-[1.75rem] bg-[#dfe7dc] border border-[#cbd6c9] p-6 sm:p-8 flex flex-col justify-between min-h-[330px]">

                <div>

                  <div className="flex items-center justify-between">

                    <p className="text-[9px] uppercase tracking-[0.2em] text-[#687169] font-semibold">
                      Your contribution
                    </p>

                    <span className="w-9 h-9 rounded-xl bg-[#8ee276] text-[#103523] flex items-center justify-center font-bold">
                      %
                    </span>

                  </div>


                  <p className="mt-8 text-7xl sm:text-8xl font-bold tracking-[-0.07em] text-[#103523]">
                    {percentage}%
                  </p>

                </div>


                <div>

                  <div className="h-2 rounded-full bg-[#c7d2c4] overflow-hidden">

                    <div
                      className="h-full rounded-full bg-[#47775f] transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />

                  </div>

                  <p className="mt-4 text-xs text-[#687169] leading-relaxed">
                    of eligible winnings directed to{" "}
                    <span className="font-semibold text-[#47775f]">
                      {selectedCharityData?.name ||
                        "your selected charity"}
                    </span>
                    .
                  </p>

                </div>

              </div>

            </div>

          </section>


          {/* =====================================================
              MESSAGE
          ====================================================== */}
          {error && (
            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">

              <span className="w-8 h-8 shrink-0 rounded-full bg-red-100 flex items-center justify-center font-bold">
                !
              </span>

              <span>{error}</span>

            </div>
          )}


          {message && (
            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-[#b8cbbd] bg-[#e4eee6] px-5 py-4 text-sm text-[#38644f]">

              <span className="w-8 h-8 shrink-0 rounded-full bg-[#d1e3d5] flex items-center justify-center font-bold">
                ✓
              </span>

              <span>{message}</span>

            </div>
          )}


          {/* =====================================================
              SAVE
          ====================================================== */}
          <section className="mt-8 mb-6 rounded-[1.75rem] bg-[#0d2117] text-white p-6 sm:p-7">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">

              <div>

                <div className="flex items-center gap-2">

                  <span className="w-6 h-[2px] bg-[#8ee276]" />

                  <p className="text-[9px] uppercase tracking-[0.22em] text-[#8ee276] font-semibold">
                    Final step
                  </p>

                </div>

                <h3 className="mt-2 text-xl sm:text-2xl font-bold tracking-[-0.03em]">
                  Ready to make an impact?
                </h3>

                <p className="mt-2 text-xs sm:text-sm text-white/40">
                  Your charity preference will be saved to your profile.
                </p>

              </div>


              <button
                type="submit"
                disabled={saving}
                className="
                  group
                  shrink-0
                  min-w-[190px]
                  h-13
                  px-6
                  py-3.5
                  rounded-xl
                  bg-[#8ee276]
                  text-[#103523]
                  text-sm
                  font-bold
                  shadow-[0_10px_30px_rgba(142,226,118,0.12)]
                  hover:bg-[#a0ed89]
                  hover:-translate-y-0.5
                  transition-all
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                  disabled:hover:translate-y-0
                "
              >
                {saving ? (
                  "Saving..."
                ) : (
                  <>
                    Save preferences
                    <span className="ml-2 inline-block group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </>
                )}
              </button>

            </div>

          </section>

        </form>

      </main>
    </div>
  );
}

export default Charity;