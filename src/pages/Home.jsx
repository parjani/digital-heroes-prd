import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f4f7ed] text-[#10291f] overflow-hidden">

      {/* =====================================================
          NAVBAR + HERO
      ===================================================== */}
      <section className="relative bg-[#063d2b] text-white overflow-hidden">

        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 left-[35%] w-[600px] h-[600px] rounded-full bg-[#62b86d]/20 blur-[120px]" />
          <div className="absolute top-[30%] right-[25%] w-[400px] h-[400px] rounded-full bg-[#9ae66f]/10 blur-[100px]" />
        </div>

      


        {/* ================= HERO ================= */}
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-16 md:pt-20 pb-32 mt-20 md:mt-24">

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-4 items-center">

            {/* LEFT */}
            <div className="relative z-10">

              <p className="text-[11px] md:text-xs uppercase tracking-[0.28em] text-[#8ee276] font-semibold">
                Digital Heroes · Play with purpose
              </p>

              <h1 className="mt-7 text-[58px] sm:text-[70px] md:text-[82px] lg:text-[88px] xl:text-[96px] font-semibold tracking-[-0.07em] leading-[0.9]">

                Your game.

                <br />

                Your impact.

                <br />

                <span className="text-[#8ee276]">
                  Something bigger.
                </span>

              </h1>

              <p className="mt-8 max-w-xl text-base md:text-lg leading-7 text-white/70">
                We connect your golf performance with charitable
                giving and a monthly prize draw. Track your game,
                support a cause and become part of something bigger.
              </p>


              {/* Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3">

                <button
                  onClick={() => navigate("/signup")}
                  className="group px-7 py-4 rounded-full bg-[#8ee276] text-[#103523] font-bold hover:bg-[#a0ed89] hover:-translate-y-0.5 transition-all shadow-[0_12px_35px_rgba(142,226,118,0.18)]"
                >
                  Become a Digital Hero

                  <span className="ml-2 inline-block group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </button>

                <button
                  onClick={() => navigate("/how-it-works")}
                  className="px-7 py-4 rounded-full border border-white/35 text-white font-semibold hover:bg-white/10 transition"
                >
                  See how it works
                </button>

              </div>


              <div className="mt-7 flex items-center gap-2 text-xs text-white/55">

                <span className="w-2 h-2 rounded-full bg-[#8ee276]" />

                Built around golf, giving and community.

              </div>

            </div>


            {/* RIGHT VISUAL */}
            <div className="relative min-h-[470px] lg:min-h-[560px]">

              {/* Green shape */}
              <div className="absolute -right-32 top-[-80px] w-[580px] h-[580px] rounded-[45%] bg-[#194e38] rotate-[-18deg]" />

              {/* Golf image */}
              <div
                className="absolute right-[-30px] top-4 w-[520px] h-[500px] md:w-[610px] md:h-[540px] bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&w=1200&q=85')",
                  clipPath:
                    "ellipse(72% 62% at 65% 50%)",
                }}
              />

              {/* Dark overlay */}
              <div
                className="absolute right-[-30px] top-4 w-[520px] h-[500px] md:w-[610px] md:h-[540px] bg-[#063d2b]/15"
                style={{
                  clipPath:
                    "ellipse(72% 62% at 65% 50%)",
                }}
              />


              {/* Score floating card */}
              <div className="absolute right-2 md:right-8 bottom-12 md:bottom-20 z-10 w-[250px] rounded-2xl bg-[#0d563b]/90 backdrop-blur-xl border border-white/15 p-5 shadow-[0_25px_60px_rgba(0,0,0,0.25)]">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-white/50">
                      Your latest five
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      Stableford scores
                    </p>
                  </div>

                  <div className="w-9 h-9 rounded-full bg-[#8ee276] text-[#123b2a] flex items-center justify-center text-[10px] font-black italic">
                    DH
                  </div>

                </div>


                <div className="grid grid-cols-5 gap-2 mt-5">

                  {[18, 22, 16, 24, 20].map(
                    (score, index) => (
                      <div
                        key={index}
                        className="aspect-square rounded-full bg-[#8ee276] text-[#173c29] flex items-center justify-center text-xs font-bold"
                      >
                        {score}
                      </div>
                    )
                  )}

                </div>

              </div>

            </div>

          </div>


          {/* ================= STATS ================= */}
          <div className="relative z-20 -mb-20 mt-14">

            <div className="rounded-3xl bg-[#124d38]/90 backdrop-blur-xl border border-white/15 shadow-[0_25px_70px_rgba(0,0,0,0.2)]">

              <div className="grid grid-cols-2 md:grid-cols-4">

                <HeroStat
                  icon="◒"
                  number="5"
                  text="latest scores tracked"
                />

                <HeroStat
                  icon="♕"
                  number="1×"
                  text="monthly draw"
                />

                <HeroStat
                  icon="♡"
                  number="10%"
                  text="minimum contribution"
                />

                <HeroStat
                  icon="⌁"
                  number="100%"
                  text="purpose driven"
                  last
                />

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          IDEA SECTION
      ===================================================== */}
      <section className="bg-[#f4f7ed] pt-40 pb-28 md:pb-32">

        <div className="max-w-7xl mx-auto px-6 lg:px-10">

          <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">

            {/* Text */}
            <div>

              <SectionLabel number="01" text="THE IDEA" />

              <h2 className="mt-7 text-5xl md:text-6xl lg:text-7xl font-semibold tracking-[-0.06em] leading-[0.92]">

                Golf is more than
                <br />

                a score.

                <br />

                <span className="text-[#43a55e]">
                  It can give back.
                </span>

              </h2>

              <p className="mt-8 max-w-lg text-base md:text-lg leading-7 text-[#627069]">
                Digital Heroes turns your golf performance into
                participation, charitable contribution and the chance
                to win a monthly prize.
              </p>

            </div>


            {/* Image */}
            <div className="relative">

              <div className="absolute -left-8 -bottom-8 w-40 h-40 rounded-full bg-[#dcebd2]" />

              <div
                className="relative h-[350px] md:h-[440px] rounded-[30px] bg-cover bg-center shadow-[0_25px_60px_rgba(30,60,40,0.12)]"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1200&q=85')",
                }}
              >

                <div className="absolute inset-0 rounded-[30px] bg-gradient-to-t from-[#063d2b]/45 via-transparent to-transparent" />

                <div className="absolute right-7 bottom-7 max-w-[210px] text-right text-white">

                  <p className="text-2xl font-semibold leading-tight italic">
                    Better golf.
                    <br />
                    Brighter futures.
                  </p>

                  <div className="mt-3 ml-auto w-14 h-px bg-[#8ee276]" />

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          PROCESS
      ===================================================== */}
      <section className="relative bg-[#063d2b] text-white overflow-hidden">

        {/* Background pattern */}
        <div className="absolute right-[-100px] top-[-100px] w-[500px] h-[500px] rounded-full border border-white/5" />

        <div className="absolute right-[-40px] top-[-40px] w-[380px] h-[380px] rounded-full border border-white/5" />

        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-28 md:py-32">

          <div className="grid lg:grid-cols-2 gap-12 mb-14">

            <div>

              <SectionLabel
                number="02"
                text="THE PROCESS"
                light
              />

              <h2 className="mt-7 text-5xl md:text-6xl lg:text-7xl font-semibold tracking-[-0.06em] leading-[0.92]">

                Three steps.

                <br />

                <span className="text-[#8ee276]">
                  One simple idea.
                </span>

              </h2>

            </div>


            <div className="lg:flex lg:items-end">

              <p className="max-w-md text-white/60 leading-7">
                Your performance creates your entry.
                Your participation supports a cause.
                The draw brings everyone together.
              </p>

            </div>

          </div>


          <div className="grid md:grid-cols-3 gap-5">

            <ProcessCard
              number="01"
              title="Track your game"
              description="Add your latest Stableford scores and keep your performance history up to date."
              icon="◒"
            />

            <ProcessCard
              number="02"
              title="Choose your cause"
              description="Select a participating charity and decide where your contribution should go."
              icon="♡"
            />

            <ProcessCard
              number="03"
              title="Enter the draw"
              description="Your latest scores generate your monthly draw numbers and your chance to win."
              icon="♕"
            />

          </div>

        </div>

      </section>


      {/* =====================================================
          IMPACT
      ===================================================== */}
      <section className="bg-[#f4f7ed] py-28 md:py-32">

        <div className="max-w-7xl mx-auto px-6 lg:px-10">

          <div className="grid lg:grid-cols-[0.85fr_1fr] gap-16 items-center">

            <div>

              <SectionLabel number="03" text="IMPACT" />

              <h2 className="mt-7 text-5xl md:text-6xl lg:text-7xl font-semibold tracking-[-0.06em] leading-[0.92]">

                You choose
                <br />

                where the
                <br />

                <span className="text-[#43a55e]">
                  impact goes.
                </span>

              </h2>

              <p className="mt-8 max-w-md text-[#65736b] leading-7">
                Choose a charity you care about and dedicate a
                percentage of your winnings to their work.
                Your participation becomes a simple way to turn
                performance into positive change.
              </p>

              <button
                onClick={() => navigate("/charities")}
                className="group mt-8 px-6 py-3.5 rounded-full bg-[#43a55e] text-white font-semibold hover:bg-[#348d4d] transition"
              >
                Explore charities

                <span className="ml-2 inline-block group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </button>

            </div>


            <div className="relative">

              {/* Impact card */}
              <div className="relative z-10 rounded-[30px] bg-[#0b5338] text-white p-7 md:p-10 shadow-[0_30px_70px_rgba(20,65,40,0.18)]">

                <p className="text-xs uppercase tracking-[0.22em] text-white/50">
                  Your participation
                </p>

                <div className="grid grid-cols-2 mt-8">

                  <ImpactStat
                    icon="♡"
                    number="10%"
                    text="minimum contribution"
                  />

                  <ImpactStat
                    icon="◒"
                    number="5"
                    text="scores tracked"
                  />

                  <ImpactStat
                    icon="♕"
                    number="1×"
                    text="monthly draw"
                  />

                  <ImpactStat
                    icon="∞"
                    number="∞"
                    text="potential impact"
                    last
                  />

                </div>

              </div>


              {/* Golf ball decoration */}
              <div className="absolute -right-8 -bottom-14 w-44 h-44 rounded-full bg-[#dcebd2] flex items-center justify-center">

                <div
                  className="w-28 h-28 rounded-full bg-cover bg-center rounded-full"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&w=500&q=80')",
                  }}
                />

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          FINAL CTA
      ===================================================== */}
      <section
        className="relative text-white overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(3,48,34,0.96), rgba(3,48,34,0.72), rgba(3,48,34,0.55)), url('https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&w=1800&q=85')",
        }}
      >

        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-28 md:py-32">

          <div className="grid lg:grid-cols-2 gap-12 items-center">

            <div>

              <SectionLabel
                number="04"
                text="JOIN DIGITAL HEROES"
                light
              />

              <h2 className="mt-7 text-5xl md:text-7xl font-semibold tracking-[-0.06em] leading-[0.9]">

                Ready to play

                <br />

                <span className="text-[#8ee276]">
                  with purpose?
                </span>

              </h2>

            </div>


            <div>

              <p className="max-w-md text-white/65 leading-7">
                Join Digital Heroes and make every month count.
                Play your game, support a cause and become part
                of something bigger.
              </p>

              <button
                onClick={() => navigate("/signup")}
                className="group mt-8 px-7 py-4 rounded-full bg-[#8ee276] text-[#103523] font-bold hover:bg-[#a0ed89] transition"
              >
                Become a Digital Hero

                <span className="ml-2 inline-block group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </button>

            </div>

          </div>


          {/* Bottom branding */}
          <div className="mt-20 pt-6 border-t border-white/15 flex items-center justify-between">

            <div className="flex items-center gap-3">

              <span className="text-2xl font-black italic">
                DH
              </span>

              <span className="text-xs uppercase tracking-[0.2em] text-white/60">
                Digital Heroes
              </span>

            </div>

            <p className="text-xs text-white/40">
              Play with purpose.
            </p>

          </div>

        </div>

      </section>

    </div>
  );
}


/* =========================================================
   NAV LINK
========================================================= */

function NavLink({
  label,
  active,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={`relative text-sm transition ${
        active
          ? "text-white"
          : "text-white/65 hover:text-white"
      }`}
    >
      {label}

      {active && (
        <span className="absolute -bottom-4 left-0 right-0 mx-auto w-7 h-0.5 rounded-full bg-[#8ee276]" />
      )}
    </button>
  );
}


/* =========================================================
   HERO STAT
========================================================= */

function HeroStat({
  icon,
  number,
  text,
  last,
}) {
  return (
    <div
      className={`py-7 md:py-8 px-5 md:px-7 text-center ${
        !last
          ? "border-r border-white/10"
          : ""
      }`}
    >

      <div className="text-[#8ee276] text-xl mb-3">
        {icon}
      </div>

      <p className="text-3xl md:text-4xl font-semibold tracking-tight">
        {number}
      </p>

      <p className="mt-2 text-xs md:text-sm text-white/50">
        {text}
      </p>

    </div>
  );
}


/* =========================================================
   SECTION LABEL
========================================================= */

function SectionLabel({
  number,
  text,
  light = false,
}) {
  return (
    <div
      className={`flex items-center gap-3 text-[10px] md:text-xs font-semibold tracking-[0.25em] ${
        light
          ? "text-[#8ee276]"
          : "text-[#43a55e]"
      }`}
    >
      <span
        className={`w-7 h-px ${
          light
            ? "bg-[#8ee276]"
            : "bg-[#43a55e]"
        }`}
      />

      <span>
        {number} · {text}
      </span>
    </div>
  );
}


/* =========================================================
   PROCESS CARD
========================================================= */

function ProcessCard({
  number,
  title,
  description,
  icon,
}) {
  return (
    <div className="group relative rounded-[24px] bg-[#0c4934] border border-white/10 p-7 md:p-8 hover:bg-[#10553d] hover:-translate-y-1 transition-all duration-300">

      <div className="flex items-center justify-between">

        <div className="w-12 h-12 rounded-full bg-[#8ee276] text-[#17412d] flex items-center justify-center text-lg">
          {icon}
        </div>

        <span className="text-xs font-semibold text-white/40">
          {number}
        </span>

      </div>

      <h3 className="mt-12 text-2xl font-semibold">
        {title}
      </h3>

      <p className="mt-4 text-sm leading-6 text-white/55">
        {description}
      </p>

   

    </div>
  );
}


/* =========================================================
   IMPACT STAT
========================================================= */

function ImpactStat({
  icon,
  number,
  text,
  last,
}) {
  return (
    <div
      className={`py-6 ${
        !last
          ? "border-b border-white/10"
          : ""
      }`}
    >

      <div className="flex items-center gap-3">

        <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-[#8ee276]">
          {icon}
        </div>

        <div>

          <p className="text-3xl md:text-4xl font-semibold">
            {number}
          </p>

          <p className="mt-1 text-xs text-white/45">
            {text}
          </p>

        </div>

      </div>

    </div>
  );
}


export default Home;