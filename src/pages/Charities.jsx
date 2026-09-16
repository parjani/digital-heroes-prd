import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function Charities() {
  const navigate = useNavigate();

  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCharities();
  }, []);

  const fetchCharities = async () => {
    const { data, error } = await supabase
      .from("charities")
      .select("*")
      .eq("active", true)
      .order("name");

    if (error) {
      console.error(error);
    } else {
      setCharities(data || []);
    }

    setLoading(false);
  };

 return (
  <div className="min-h-screen bg-[#f3f1e8] text-[#101813]">

  

    <main>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-20 md:py-28 border-b border-[#cfd4c8]">

        <div className="grid lg:grid-cols-[1fr_320px] gap-12 lg:gap-20 items-end">

          <div className="max-w-4xl">

            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#47775f]">
              § 01 · Our causes
            </p>

            <h1 className="mt-6 text-5xl md:text-7xl font-semibold tracking-[-0.05em] leading-[0.92]">
              Choose a cause
              <span className="block text-[#47775f]">
                worth playing for.
              </span>
            </h1>

            <p className="mt-8 text-[#687169] text-base md:text-lg leading-7 max-w-2xl">
              Every member chooses where their charitable contribution goes.
              Explore the causes currently participating in Digital Heroes
              and find one that matters to you.
            </p>

          </div>

          <div className="border-l border-[#cfd4c8] pl-6">

            <p className="text-xs uppercase tracking-[0.16em] text-[#8a918b]">
              Member contribution
            </p>

            <p className="mt-3 text-5xl font-semibold tracking-[-0.04em] text-[#47775f]">
              10%+
            </p>

            <p className="mt-3 text-sm leading-6 text-[#687169]">
              Members can contribute at least 10% of eligible winnings
              to their chosen charity.
            </p>

          </div>

        </div>

      </section>

      {/* Charities */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16 md:py-20">

        <div className="mb-10">

          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#47775f]">
            § 02 · Participating charities
          </p>

          <h2 className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight">
            Causes currently in the community.
          </h2>

        </div>

        {loading ? (
          <div className="border border-[#cfd4c8] bg-[#f8f7f1] px-6 py-16 text-center">
            <p className="text-sm text-[#687169]">
              Loading charities...
            </p>
          </div>
        ) : charities.length === 0 ? (
          <div className="border border-[#cfd4c8] bg-[#f8f7f1] px-6 py-16 text-center">
            <p className="text-sm text-[#687169]">
              No charities are currently available.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#cfd4c8] border border-[#cfd4c8]">

            {charities.map((charity, index) => (
              <article
                key={charity.id}
                className="bg-[#f8f7f1] p-7 md:p-8 min-h-[330px] hover:bg-[#e7ebe3] transition flex flex-col"
              >

                <div className="flex items-start justify-between">

                  <span className="text-xs tracking-[0.16em] text-[#8a918b]">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span className="text-xl text-[#47775f]">
                    +
                  </span>

                </div>

                <div className="mt-auto pt-16">

                  <h3 className="text-2xl font-semibold tracking-tight">
                    {charity.name}
                  </h3>

                  <p className="mt-4 text-sm leading-6 text-[#687169]">
                    {charity.description ||
                      "A participating charity making a difference in the community."}
                  </p>

                  <div className="mt-7 pt-5 border-t border-[#cfd4c8] flex items-end justify-between">

                    <div>
                      <p className="text-[10px] uppercase tracking-[0.16em] text-[#8a918b]">
                        Minimum contribution
                      </p>

                      <p className="mt-1 text-xl font-semibold text-[#47775f]">
                        10%+
                      </p>
                    </div>

                    <span className="text-xs text-[#8a918b]">
                      Active cause
                    </span>

                  </div>

                </div>

              </article>
            ))}

          </div>
        )}

      </section>

      {/* Impact statement */}
      <section className="border-y border-[#cfd4c8] bg-[#dfe5da]">

        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 md:py-20">

          <div className="grid md:grid-cols-[220px_1fr] gap-10 md:gap-16">

            <div>
              <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#47775f]">
                § 03 · Impact
              </p>
            </div>

            <div className="max-w-4xl">

              <p className="text-3xl md:text-5xl font-semibold tracking-[-0.04em] leading-tight">
                Your membership is about more than entering a draw.
              </p>

              <p className="mt-7 text-[#687169] text-base md:text-lg leading-7 max-w-2xl">
                Choose a cause, decide your contribution and make your
                participation part of something meaningful.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-20 md:py-28">

        <div className="border-t border-b border-[#cfd4c8] py-14 md:py-18 flex flex-col md:flex-row md:items-end md:justify-between gap-10">

          <div className="max-w-3xl">

            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#47775f]">
              § 04 · Get involved
            </p>

            <h2 className="mt-5 text-4xl md:text-6xl font-semibold tracking-[-0.04em] leading-[0.95]">
              Found a cause
              <span className="block text-[#47775f]">
                you believe in?
              </span>
            </h2>

            <p className="mt-6 text-[#687169] max-w-xl leading-7">
              Join Digital Heroes, choose your charity and make it part
              of your journey.
            </p>

          </div>

          <button
            onClick={() => navigate("/signup")}
            className="shrink-0 px-7 py-4 bg-[#47775f] text-white text-sm font-semibold hover:bg-[#38644f] transition"
          >
            Join Digital Heroes →
          </button>

        </div>

      </section>

    </main>



  </div>
);
}

export default Charities;