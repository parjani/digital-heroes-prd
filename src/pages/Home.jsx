import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f1f0e8] text-[#101813]">

      {/* ================= NAVBAR ================= */}
     


      {/* ================= HERO ================= */}
      <main>

        <section className="relative overflow-hidden">

          {/* Decorative background */}
          <div className="absolute -left-20 top-20 text-[220px] md:text-[360px] font-black leading-none text-[#47745f]/10 select-none pointer-events-none">
            DH
          </div>

          <div className="absolute right-[-150px] top-40 w-[500px] h-[500px] rounded-full bg-[#5c896f]/15 blur-2xl pointer-events-none" />


          <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-24 pb-20 md:pt-32 md:pb-28">

            <div className="grid lg:grid-cols-12 gap-12 items-center">

              {/* Left */}
              <div className="lg:col-span-7">

                <p className="text-xs uppercase tracking-[0.3em] text-[#47745f] font-semibold mb-8">
                  Digital Heroes · Play with purpose
                </p>


                <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-[105px] font-semibold tracking-[-0.07em] leading-[0.88]">
                  Your game.
                  <br />

                  <span className="text-[#101813]">
                    Your impact.
                  </span>

                  <br />

                  <span className="text-[#6f8d7b]">
                    Something bigger.
                  </span>
                </h1>


                <p className="mt-10 max-w-2xl text-lg md:text-xl leading-relaxed text-[#4f5953]">
                  We connect your golf performance with charitable giving
                  and a monthly prize draw. Track your game, support a cause
                  and become part of something bigger.
                </p>


                <div className="mt-9 flex flex-col sm:flex-row gap-3">

                  <button
                    onClick={() => navigate("/signup")}
                    className="px-7 py-4 rounded-full bg-[#47745f] text-white font-semibold hover:bg-[#3c654f] transition shadow-sm"
                  >
                    Become a Digital Hero →
                  </button>

                  <button
                    onClick={() => navigate("/how-it-works")}
                    className="px-7 py-4 rounded-full border border-[#b9c3b9] bg-[#f6f4ed] text-[#25312a] font-semibold hover:bg-white transition"
                  >
                    See how it works
                  </button>

                </div>


                <div className="mt-8 flex items-center gap-3 text-sm text-[#69736c]">

                  <div className="w-2 h-2 rounded-full bg-[#47745f]" />

                  Built around golf, giving and community.

                </div>

              </div>


              {/* Right visual */}
              <div className="lg:col-span-5">

                <div className="relative min-h-[480px] flex items-center justify-center">

                  {/* Green circle */}
                  <div className="absolute w-[360px] h-[360px] md:w-[440px] md:h-[440px] rounded-full bg-[#6d967d]" />

                  {/* Main card */}
                  <div className="relative w-full max-w-[470px]">

                    <div className="bg-[#e9e7dd] border border-[#c4cbc1] rounded-[28px] p-4 shadow-[0_30px_70px_rgba(30,50,40,0.16)] rotate-[2deg]">

                      <div className="rounded-[20px] bg-[#47745f] p-7 md:p-9 min-h-[330px] flex flex-col justify-between">

                        <div className="flex items-start justify-between">

                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-white/60">
                              Digital Heroes
                            </p>

                            <p className="text-2xl font-semibold text-white mt-2">
                              Play with purpose.
                            </p>
                          </div>

                          <div className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center text-white font-bold">
                            DH
                          </div>

                        </div>


                        <div>

                          <div className="flex gap-3 mb-7">

                            {[18, 22, 16, 24, 20].map((score, index) => (
                              <div
                                key={index}
                                className="w-12 h-12 rounded-full bg-[#dbe4d7] text-[#203229] flex items-center justify-center font-semibold"
                              >
                                {score}
                              </div>
                            ))}

                          </div>

                          <p className="text-white/70 text-sm">
                            Your latest five Stableford scores
                            become part of your monthly draw entry.
                          </p>

                        </div>

                      </div>

                    </div>


                    {/* Floating badge */}
                    <div className="absolute -left-5 top-10 px-5 py-3 rounded-full bg-[#f6f4ed] border border-[#c4cbc1] shadow-md text-xs font-semibold tracking-wider">
                      PLAY
                    </div>


                    <div className="absolute -right-5 bottom-8 px-5 py-3 rounded-full bg-[#f6f4ed] border border-[#c4cbc1] shadow-md text-xs font-semibold tracking-wider">
                      GIVE BACK
                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* ================= NUMBERS ================= */}
        <section className="border-y border-[#c8cec5] bg-[#e8e7de]">

          <div className="max-w-7xl mx-auto px-6 lg:px-10">

            <div className="grid grid-cols-2 md:grid-cols-4">

              <Stat
                number="5"
                text="latest scores tracked"
              />

              <Stat
                number="1×"
                text="monthly draw"
              />

              <Stat
                number="10%"
                text="minimum contribution"
              />

              <Stat
                number="100%"
                text="purpose driven"
                last
              />

            </div>

          </div>

        </section>


        {/* ================= INTRO ================= */}
        <section>

          <div className="max-w-7xl mx-auto px-6 lg:px-10 py-28 md:py-36">

            <div className="grid lg:grid-cols-12 gap-12">

              <div className="lg:col-span-4">

                <p className="text-xs uppercase tracking-[0.25em] text-[#6c776f]">
                  01 · The idea
                </p>

                <div className="mt-8 w-16 h-[2px] bg-[#47745f]" />

              </div>


              <div className="lg:col-span-7 lg:col-start-6">

                <h2 className="text-4xl md:text-6xl font-semibold tracking-[-0.04em] leading-[1.05]">
                  Golf is more than
                  <br />
                  a score.
                  <br />

                  <span className="text-[#6f8d7b]">
                    It can give back.
                  </span>
                </h2>

                <p className="mt-8 text-lg md:text-xl text-[#56615a] leading-relaxed max-w-2xl">
                  Digital Heroes turns your golf performance into
                  participation, charitable contribution and the chance
                  to win a monthly prize.
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* ================= HOW IT WORKS ================= */}
        <section className="bg-[#e6e5dc] border-y border-[#c8cec5]">

          <div className="max-w-7xl mx-auto px-6 lg:px-10 py-28 md:py-36">

            <div className="grid lg:grid-cols-12 gap-12 mb-16">

              <div className="lg:col-span-7">

                <p className="text-xs uppercase tracking-[0.25em] text-[#6c776f]">
                  02 · The process
                </p>

                <h2 className="text-5xl md:text-7xl font-semibold tracking-[-0.06em] leading-[0.95] mt-6">
                  Three steps.
                  <br />

                  <span className="text-[#6f8d7b]">
                    One simple idea.
                  </span>
                </h2>

              </div>


              <div className="lg:col-span-4 lg:col-start-9 flex items-end">

                <p className="text-[#56615a] leading-relaxed">
                  Your performance creates your entry.
                  Your participation supports a cause.
                  The draw brings everyone together.
                </p>

              </div>

            </div>


            <div className="grid md:grid-cols-3 border-t border-[#c3cac2]">

              <ProcessCard
                number="01"
                title="Track your game"
                description="Add your latest Stableford scores and keep your performance history up to date."
              />

              <ProcessCard
                number="02"
                title="Choose your cause"
                description="Select a participating charity and decide where your contribution should go."
              />

              <ProcessCard
                number="03"
                title="Enter the draw"
                description="Your latest scores generate your monthly draw numbers and your chance to win."
                last
              />

            </div>

          </div>

        </section>


        {/* ================= CHARITY ================= */}
        <section>

          <div className="max-w-7xl mx-auto px-6 lg:px-10 py-28 md:py-36">

            <div className="grid lg:grid-cols-2 gap-16 items-center">

              <div>

                <p className="text-xs uppercase tracking-[0.25em] text-[#6c776f]">
                  03 · Impact
                </p>

                <h2 className="text-5xl md:text-7xl font-semibold tracking-[-0.06em] leading-[0.95] mt-6">
                  You choose
                  <br />
                  where the
                  <br />

                  <span className="text-[#6f8d7b]">
                    impact goes.
                  </span>
                </h2>

                <p className="mt-8 text-lg text-[#56615a] leading-relaxed max-w-xl">
                  Choose a charity you care about and dedicate a
                  percentage of your winnings to their work.
                  Your participation becomes a simple way to turn
                  performance into positive change.
                </p>

                <button
                  onClick={() => navigate("/charities")}
                  className="mt-8 px-7 py-3.5 rounded-full border border-[#aeb9ae] bg-[#f6f4ed] font-semibold hover:bg-white transition"
                >
                  Explore charities →
                </button>

              </div>


              {/* Stats card */}
              <div className="relative">

                <div className="absolute -inset-5 rounded-full bg-[#6d967d]/15 blur-2xl" />

                <div className="relative bg-[#47745f] rounded-[30px] p-7 md:p-10 text-white shadow-[0_30px_60px_rgba(55,85,65,0.2)]">

                  <p className="text-xs uppercase tracking-[0.25em] text-white/60">
                    Your participation
                  </p>

                  <div className="grid grid-cols-2 mt-10">

                    <ImpactStat
                      number="10%"
                      text="minimum contribution"
                    />

                    <ImpactStat
                      number="5"
                      text="scores tracked"
                    />

                    <ImpactStat
                      number="1×"
                      text="monthly draw"
                    />

                    <ImpactStat
                      number="∞"
                      text="potential impact"
                    />

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* ================= CTA ================= */}
        <section className="bg-[#dce4d8] border-y border-[#c2ccc1]">

          <div className="max-w-7xl mx-auto px-6 lg:px-10 py-28 md:py-36">

            <div className="max-w-4xl">

              <p className="text-xs uppercase tracking-[0.25em] text-[#47745f] font-semibold">
                04 · Join Digital Heroes
              </p>

              <h2 className="text-5xl md:text-8xl font-semibold tracking-[-0.07em] leading-[0.9] mt-6">
                Ready to play
                <br />
                with purpose?
              </h2>

              <p className="mt-8 text-lg text-[#56615a] max-w-xl">
                Join Digital Heroes and make every month count.
                Play your game, support a cause and become part
                of something bigger.
              </p>

              <button
                onClick={() => navigate("/signup")}
                className="mt-9 px-8 py-4 rounded-full bg-[#47745f] text-white font-semibold hover:bg-[#3c654f] transition shadow-sm"
              >
                Become a Digital Hero →
              </button>

            </div>

          </div>

        </section>

      </main>




    </div>
  );
}


/* ================= COMPONENTS ================= */

function Stat({ number, text, last }) {
  return (
    <div
      className={`py-8 md:py-10 md:px-7 ${
        !last ? "border-r border-[#c5ccc3]" : ""
      }`}
    >
      <p className="text-4xl md:text-5xl font-semibold tracking-tight">
        {number}
      </p>

      <p className="mt-3 text-sm text-[#68736c]">
        {text}
      </p>
    </div>
  );
}


function ProcessCard({ number, title, description, last }) {
  return (
    <div
      className={`py-10 md:py-12 ${
        !last ? "md:border-r border-[#c3cac2]" : ""
      } ${
        number !== "01" ? "md:px-10" : "md:pr-10"
      }`}
    >
      <p className="text-sm font-medium text-[#789181]">
        {number}
      </p>

      <h3 className="text-2xl md:text-3xl font-semibold mt-8 tracking-tight">
        {title}
      </h3>

      <p className="mt-4 text-[#59645d] leading-relaxed max-w-sm">
        {description}
      </p>
    </div>
  );
}


function ImpactStat({ number, text }) {
  return (
    <div className="py-7 border-b border-white/15 last:border-b-0">
      <p className="text-4xl md:text-5xl font-semibold">
        {number}
      </p>

      <p className="mt-2 text-sm text-white/55">
        {text}
      </p>
    </div>
  );
}


export default Home;