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
      console.error("Error fetching charities:", error);
    } else {
      setCharities(data || []);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f3f1e8] text-[#101813]">

      <main>

        {/* ========================================================= */}
        {/* HERO */}
        {/* ========================================================= */}

        <section className="relative overflow-hidden bg-[#0d2117] text-white">

          {/* Decorative glow */}
          <div className="absolute -top-40 right-[-8%] w-[520px] h-[520px] rounded-full bg-[#8ee276]/10 blur-3xl pointer-events-none" />

          <div className="absolute bottom-[-180px] left-[-10%] w-[420px] h-[420px] rounded-full bg-[#47775f]/20 blur-3xl pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-32 pb-24 md:pt-40 md:pb-32">

            <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-end">

              {/* Main heading */}
              <div className="lg:col-span-8">

                <div className="flex items-center gap-3 mb-8">

                  <span className="w-8 h-px bg-[#8ee276]" />

                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#8ee276] font-semibold">
                    Our causes
                  </span>

                </div>

                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold tracking-[-0.065em] leading-[0.88]">

                  Choose a cause

                  <br />

                  <span className="text-[#8ee276]">
                    worth playing for.
                  </span>

                </h1>

              </div>


              {/* Intro */}
              <div className="lg:col-span-4 lg:pb-2">

                <p className="text-base leading-7 text-white/55 max-w-md">
                  Every member chooses where their charitable contribution
                  goes. Explore the causes currently participating in
                  Digital Heroes and find one that matters to you.
                </p>


                <div className="mt-8 pt-6 border-t border-white/10">

                  <div className="flex items-end gap-3">

                    <span className="text-5xl font-semibold tracking-[-0.05em] text-[#8ee276]">
                      10%+
                    </span>

                    <span className="pb-1 text-[10px] uppercase tracking-[0.18em] text-white/40">
                      minimum contribution
                    </span>

                  </div>

                  <p className="mt-3 text-xs leading-5 text-white/35">
                    Members can contribute at least 10% of eligible winnings
                    to their chosen charity.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* ========================================================= */}
        {/* CHARITY LIST */}
        {/* ========================================================= */}

        <section className="max-w-7xl mx-auto px-6 lg:px-10 py-20 md:py-28">

          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 mb-12">

            <div className="lg:col-span-5">

              <div className="flex items-center gap-3">

                <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#47775f]">
                  01
                </span>

                <span className="w-10 h-px bg-[#47775f]/40" />

                <span className="text-[10px] uppercase tracking-[0.25em] text-[#687169]">
                  Participating charities
                </span>

              </div>

              <h2 className="mt-6 text-3xl md:text-4xl font-semibold tracking-[-0.045em] leading-tight">
                Causes currently
                <span className="block text-[#47775f]">
                  in the community.
                </span>
              </h2>

            </div>


            <div className="lg:col-span-7 lg:pt-7">

              <p className="text-base md:text-lg leading-7 text-[#687169] max-w-2xl">
                Choose a charity that means something to you. Your
                participation can help connect your performance with
                meaningful support.
              </p>

            </div>

          </div>


          {/* Loading */}
          {loading ? (

            <div className="rounded-[1.5rem] border border-[#cfd4c8] bg-[#f8f7f1] px-6 py-20 text-center">

              <div className="mx-auto w-10 h-10 rounded-full border-2 border-[#cfd4c8] border-t-[#47775f] animate-spin" />

              <p className="mt-6 text-sm text-[#687169]">
                Loading charities...
              </p>

            </div>

          ) : charities.length === 0 ? (

            <div className="rounded-[1.5rem] border border-[#cfd4c8] bg-[#f8f7f1] px-6 py-20 text-center">

              <div className="mx-auto w-14 h-14 rounded-full bg-[#dfe7dc] flex items-center justify-center text-[#47775f] text-2xl">
                +
              </div>

              <h3 className="mt-6 text-xl font-semibold">
                No charities available
              </h3>

              <p className="mt-3 text-sm text-[#687169]">
                There are currently no active charities available.
              </p>

            </div>

          ) : (

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

              {charities.map((charity, index) => (

                <article
                  key={charity.id}
                  className="group relative overflow-hidden rounded-[1.5rem] bg-[#f8f7f1] border border-[#d5d9d0] p-7 md:p-8 min-h-[370px] flex flex-col hover:-translate-y-1 hover:border-[#aebcae] hover:shadow-[0_20px_45px_rgba(16,24,19,0.07)] transition-all duration-300"
                >

                  {/* Top */}
                  <div className="flex items-start justify-between">

                    <span className="w-10 h-10 rounded-full bg-[#dfe7dc] text-[#47775f] flex items-center justify-center text-xs font-bold">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    {/* <span className="w-9 h-9 rounded-full border border-[#d5d9d0] flex items-center justify-center text-[#47775f] group-hover:bg-[#47775f] group-hover:text-white group-hover:border-[#47775f] transition-all">
                      ↗
                    </span> */}

                  </div>


                  {/* Content */}
                  <div className="mt-auto">

                    <div className="mb-5">

                      <span className="inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-[#47775f] font-semibold">

                        <span className="w-1.5 h-1.5 rounded-full bg-[#8ee276]" />

                        Active cause

                      </span>

                    </div>


                    <h3 className="text-2xl md:text-3xl font-semibold tracking-[-0.04em] leading-tight">
                      {charity.name}
                    </h3>


                    <p className="mt-4 text-sm leading-6 text-[#687169]">
                      {charity.description ||
                        "A participating charity making a difference in the community."}
                    </p>


                    {/* Bottom */}
                    <div className="mt-7 pt-5 border-t border-[#d5d9d0] flex items-end justify-between">

                      <div>

                        <p className="text-[9px] uppercase tracking-[0.18em] text-[#8a918b]">
                          Minimum contribution
                        </p>

                        <p className="mt-1 text-xl font-semibold text-[#47775f]">
                          10%+
                        </p>

                      </div>

                      <span className="text-[10px] uppercase tracking-[0.16em] text-[#8a918b]">
                        Digital Heroes
                      </span>

                    </div>

                  </div>

                </article>

              ))}

            </div>

          )}

        </section>


        {/* ========================================================= */}
        {/* IMPACT SECTION */}
        {/* ========================================================= */}

        <section className="bg-[#0d2117] text-white">

          <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20 md:py-28">

            <div className="grid lg:grid-cols-12 gap-12">

              <div className="lg:col-span-4">

                <div className="flex items-center gap-3">

                  <span className="w-8 h-px bg-[#8ee276]" />

                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#8ee276] font-semibold">
                    02 · Impact
                  </span>

                </div>

              </div>


              <div className="lg:col-span-8">

                <h2 className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-[-0.055em] leading-[0.92]">
                  Your membership is about
                  <span className="text-[#8ee276]">
                    {" "}more than a draw.
                  </span>
                </h2>

                <p className="mt-8 text-base md:text-lg leading-7 text-white/50 max-w-2xl">
                  Choose a cause, decide your contribution and make your
                  participation part of something meaningful.
                </p>


                <div className="mt-12 grid sm:grid-cols-3 gap-8">

                  <ImpactItem
                    number="01"
                    title="Choose"
                    text="Select a charity that matters to you."
                  />

                  <ImpactItem
                    number="02"
                    title="Contribute"
                    text="Direct part of eligible winnings towards your cause."
                  />

                  <ImpactItem
                    number="03"
                    title="Impact"
                    text="Turn participation into meaningful support."
                  />

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* ========================================================= */}
        {/* CTA */}
        {/* ========================================================= */}

        <section className="max-w-7xl mx-auto px-6 lg:px-10 py-20 md:py-28">

          <div className="relative overflow-hidden rounded-[2rem] bg-[#dfe7dc] px-7 py-12 md:px-12 md:py-16 lg:px-16">

            {/* Decorative circle */}
            <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full border-[40px] border-[#47775f]/10 pointer-events-none" />

            <div className="relative grid lg:grid-cols-12 gap-10 items-end">

              <div className="lg:col-span-8">

                <div className="flex items-center gap-3 mb-6">

                  <span className="w-8 h-px bg-[#47775f]" />

                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#47775f] font-semibold">
                    03 · Get involved
                  </span>

                </div>

                <h2 className="text-4xl md:text-6xl font-semibold tracking-[-0.055em] leading-[0.92]">

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


              <div className="lg:col-span-4 lg:flex lg:justify-end">

                <button
                  onClick={() => navigate("/signup")}
                  className="group inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-[#0d2117] text-white text-sm font-bold hover:bg-[#173c28] hover:-translate-y-0.5 transition-all"
                >
                  Join Digital Heroes

                  <span className="w-7 h-7 rounded-full bg-[#8ee276] text-[#103523] flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    →
                  </span>

                </button>

              </div>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}


/* ========================================================= */
/* IMPACT ITEM */
/* ========================================================= */

function ImpactItem({ number, title, text }) {
  return (
    <div className="border-t border-white/10 pt-5">

      <div className="flex items-center justify-between">

        <span className="text-[10px] uppercase tracking-[0.18em] text-[#8ee276] font-semibold">
          {number}
        </span>

        <span className="w-1.5 h-1.5 rounded-full bg-[#8ee276]" />

      </div>

      <h3 className="mt-5 text-xl font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-white/40">
        {text}
      </p>

    </div>
  );
}

export default Charities;