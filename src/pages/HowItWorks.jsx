import { useNavigate } from "react-router-dom";

function HowItWorks() {
  const navigate = useNavigate();

  const steps = [
    {
      number: "01",
      label: "START",
      title: "Become a member",
      description:
        "Create your Digital Heroes account and choose a membership plan. An active membership gives you access to the monthly draw.",
    },
    {
      number: "02",
      label: "TRACK",
      title: "Add your latest scores",
      description:
        "Keep your five most recent Stableford scores in your profile. Each score is recorded with the date it was played.",
    },
    {
      number: "03",
      label: "CHOOSE",
      title: "Choose your charity",
      description:
        "Select a charity that matters to you. You can choose how much of your winnings you want to direct towards your chosen cause.",
    },
    {
      number: "04",
      label: "PARTICIPATE",
      title: "Take part in the monthly draw",
      description:
        "Your latest scores are used to generate your draw entries. Each monthly draw gives your performance a chance to create something bigger.",
    },
    {
      number: "05",
      label: "WIN",
      title: "Verify and receive your prize",
      description:
        "If you win, submit the required proof through your account. An administrator verifies the result before the payout is processed.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f3f1e8] text-[#101813]">

      <main>

        {/* ========================================================= */}
        {/* HERO */}
        {/* ========================================================= */}

        <section className="relative overflow-hidden bg-[#0d2117] text-white">

          {/* Background glow */}
          <div className="absolute -top-40 right-[-10%] w-[520px] h-[520px] rounded-full bg-[#8ee276]/10 blur-3xl pointer-events-none" />

          <div className="absolute bottom-[-180px] left-[-10%] w-[420px] h-[420px] rounded-full bg-[#47775f]/20 blur-3xl pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-32 pb-24 md:pt-40 md:pb-32">

            <div className="grid lg:grid-cols-12 gap-12 items-end">

              {/* Main heading */}
              <div className="lg:col-span-8">

                <div className="flex items-center gap-3 mb-8">

                  <span className="w-8 h-px bg-[#8ee276]" />

                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#8ee276] font-semibold">
                    How Digital Heroes works
                  </span>

                </div>

                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold tracking-[-0.065em] leading-[0.88]">

                  Your game.

                  <br />

                  <span className="text-[#8ee276]">
                    Your cause.
                  </span>

                  <br />

                  Your chance.

                </h1>

              </div>


              {/* Intro */}
              <div className="lg:col-span-4 lg:pb-2">

                <p className="text-base leading-7 text-white/55 max-w-md">
                  Digital Heroes connects your golf performance with
                  charitable giving and a monthly prize draw — turning
                  participation into something bigger than the game itself.
                </p>

                <div className="mt-8 flex items-center gap-3">

                  <div className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-[#8ee276]">
                    ↓
                  </div>

                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                    Discover the journey
                  </span>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* ========================================================= */}
        {/* INTRO */}
        {/* ========================================================= */}

        <section className="max-w-7xl mx-auto px-6 lg:px-10 py-20 md:py-28">

          <div className="grid lg:grid-cols-12 gap-10 lg:gap-20">

            <div className="lg:col-span-4">

              <div className="flex items-center gap-3">

                <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#47775f]">
                  01
                </span>

                <span className="w-10 h-px bg-[#47775f]/40" />

                <span className="text-[10px] uppercase tracking-[0.25em] text-[#687169]">
                  The journey
                </span>

              </div>

              <h2 className="mt-6 text-3xl md:text-4xl font-semibold tracking-[-0.04em] leading-tight">
                Five simple steps.
                <span className="block text-[#47775f]">
                  One bigger purpose.
                </span>
              </h2>

            </div>


            <div className="lg:col-span-8">

              <p className="text-lg md:text-xl leading-8 text-[#687169] max-w-3xl">
                From recording your latest round to supporting a cause you
                care about, Digital Heroes keeps the journey simple and
                connected.
              </p>

            </div>

          </div>

        </section>


        {/* ========================================================= */}
        {/* STEPS */}
        {/* ========================================================= */}

        <section className="px-6 lg:px-10 pb-24 md:pb-32">

          <div className="max-w-7xl mx-auto">

            <div className="border-t border-[#cfd4c8]">

              {steps.map((step, index) => (
                <div
                  key={step.number}
                  className="group grid md:grid-cols-[110px_170px_1fr] lg:grid-cols-[130px_190px_1fr] gap-6 md:gap-8 lg:gap-12 py-10 md:py-12 border-b border-[#cfd4c8] hover:bg-[#e8ebe2] transition-colors px-2 md:px-5"
                >

                  {/* Number */}
                  <div className="text-4xl md:text-5xl font-semibold tracking-[-0.05em] text-[#47775f] group-hover:text-[#315b46] transition-colors">
                    {step.number}
                  </div>


                  {/* Label */}
                  <div className="flex items-start">

                    <span className="px-3 py-1.5 rounded-full bg-[#dfe7dc] text-[9px] uppercase tracking-[0.2em] font-semibold text-[#47775f]">
                      {step.label}
                    </span>

                  </div>


                  {/* Content */}
                  <div className="max-w-3xl">

                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-[-0.035em]">
                      {step.title}
                    </h3>

                    <p className="mt-4 text-sm md:text-base leading-7 text-[#687169] max-w-2xl">
                      {step.description}
                    </p>

                  </div>

                </div>
              ))}

            </div>

          </div>

        </section>


        {/* ========================================================= */}
        {/* THREE PART MODEL */}
        {/* ========================================================= */}

        <section className="bg-[#0d2117] text-white">

          <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20 md:py-28">

            <div className="grid lg:grid-cols-12 gap-12 mb-14">

              <div className="lg:col-span-7">

                <div className="flex items-center gap-3 mb-6">

                  <span className="w-8 h-px bg-[#8ee276]" />

                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#8ee276] font-semibold">
                    The Digital Heroes model
                  </span>

                </div>

                <h2 className="text-4xl md:text-6xl font-semibold tracking-[-0.055em] leading-[0.92]">
                  Play.
                  <span className="text-white/45"> Participate.</span>
                  <br />
                  <span className="text-[#8ee276]">Give.</span>
                </h2>

              </div>


              <div className="lg:col-span-5 lg:pt-8">

                <p className="text-sm md:text-base leading-7 text-white/50 max-w-md">
                  Your membership connects three simple actions into one
                  experience — performance, participation and impact.
                </p>

              </div>

            </div>


            <div className="grid md:grid-cols-3 gap-px bg-white/10">

              {/* Play */}
              <div className="bg-[#122b1d] p-8 md:p-10 min-h-[300px] flex flex-col">

                <div className="flex items-center justify-between">

                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#8ee276] font-semibold">
                    01 · Play
                  </span>

                  <span className="text-2xl text-white/20">
                    ↗
                  </span>

                </div>

                <div className="mt-auto">

                  <h3 className="text-3xl font-semibold tracking-[-0.04em]">
                    Track performance
                  </h3>

                  <p className="mt-4 text-sm leading-6 text-white/45">
                    Record your latest Stableford scores and keep your
                    performance ready for participation.
                  </p>

                </div>

              </div>


              {/* Participate */}
              <div className="bg-[#122b1d] p-8 md:p-10 min-h-[300px] flex flex-col">

                <div className="flex items-center justify-between">

                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#8ee276] font-semibold">
                    02 · Participate
                  </span>

                  <span className="text-2xl text-white/20">
                    ↗
                  </span>

                </div>

                <div className="mt-auto">

                  <h3 className="text-3xl font-semibold tracking-[-0.04em]">
                    Enter the draw
                  </h3>

                  <p className="mt-4 text-sm leading-6 text-white/45">
                    An active membership connects your latest scores with
                    the monthly draw.
                  </p>

                </div>

              </div>


              {/* Give */}
              <div className="bg-[#8ee276] text-[#103523] p-8 md:p-10 min-h-[300px] flex flex-col">

                <div className="flex items-center justify-between">

                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold">
                    03 · Give
                  </span>

                  <span className="text-2xl opacity-30">
                    ↗
                  </span>

                </div>

                <div className="mt-auto">

                  <h3 className="text-3xl font-semibold tracking-[-0.04em]">
                    Create impact
                  </h3>

                  <p className="mt-4 text-sm leading-6 text-[#315b46]">
                    Choose a charity and decide how much of your winnings
                    you want to contribute.
                  </p>

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
                    Start playing with purpose
                  </span>

                </div>

                <h2 className="text-4xl md:text-6xl font-semibold tracking-[-0.055em] leading-[0.92]">

                  Ready to become a

                  <span className="text-[#47775f]">
                    {" "}Digital Hero?
                  </span>

                </h2>

                <p className="mt-6 text-[#687169] max-w-xl leading-7">
                  Create your account, choose your cause and start turning
                  your game into meaningful impact.
                </p>

              </div>


              <div className="lg:col-span-4 lg:flex lg:justify-end">

                <button
                  onClick={() => navigate("/signup")}
                  className="group inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-[#0d2117] text-white text-sm font-bold hover:bg-[#173c28] hover:-translate-y-0.5 transition-all"
                >
                  Become a Digital Hero

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

export default HowItWorks;