import { useNavigate } from "react-router-dom";

function HowItWorks() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f3f1e8] text-[#101813]">



      <main>

        {/* Hero */}
        <section className="max-w-7xl mx-auto px-6 lg:px-10 py-20 md:py-28 border-b border-[#cfd4c8]">

          <div className="max-w-4xl">

            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#47775f]">
              § 01 · How it works
            </p>

            <h1 className="mt-6 text-5xl md:text-7xl font-semibold tracking-[-0.05em] leading-[0.92]">
              Your game.
              <span className="block text-[#47775f]">
                Your cause.
              </span>
              <span className="block">
                Your chance.
              </span>
            </h1>

            <p className="mt-8 text-[#687169] text-base md:text-lg leading-7 max-w-2xl">
              Digital Heroes connects your golf performance with charitable
              giving and a monthly prize draw — turning participation into
              something bigger than the game itself.
            </p>

          </div>

        </section>

        {/* Process */}
        <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16 md:py-20">

          <div className="grid lg:grid-cols-[280px_1fr] gap-12 lg:gap-20">

            {/* Section intro */}
            <div>

              <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#47775f]">
                § 02 · The journey
              </p>

              <p className="mt-5 text-sm leading-6 text-[#687169]">
                Five simple steps connect your performance, participation
                and charitable impact.
              </p>

            </div>

            {/* Steps */}
            <div className="border-t border-[#cfd4c8]">

              {/* Step 01 */}
              <div className="grid md:grid-cols-[100px_1fr] gap-6 md:gap-10 py-9 border-b border-[#cfd4c8]">

                <div className="text-3xl font-semibold text-[#47775f]">
                  01
                </div>

                <div>

                  <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                    Become a member
                  </h2>

                  <p className="mt-4 text-[#687169] leading-7 max-w-2xl">
                    Create your account and choose a subscription plan.
                    Your active subscription allows you to participate
                    in the monthly draw.
                  </p>

                </div>

              </div>

              {/* Step 02 */}
              <div className="grid md:grid-cols-[100px_1fr] gap-6 md:gap-10 py-9 border-b border-[#cfd4c8]">

                <div className="text-3xl font-semibold text-[#47775f]">
                  02
                </div>

                <div>

                  <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                    Add your latest scores
                  </h2>

                  <p className="mt-4 text-[#687169] leading-7 max-w-2xl">
                    Keep your five most recent Stableford scores in your
                    profile. Each score is recorded with the date it was played.
                  </p>

                </div>

              </div>

              {/* Step 03 */}
              <div className="grid md:grid-cols-[100px_1fr] gap-6 md:gap-10 py-9 border-b border-[#cfd4c8]">

                <div className="text-3xl font-semibold text-[#47775f]">
                  03
                </div>

                <div>

                  <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                    Choose your charity
                  </h2>

                  <p className="mt-4 text-[#687169] leading-7 max-w-2xl">
                    Select a charity that matters to you. At least 10% of
                    your winnings can be directed towards your chosen cause,
                    with the option to contribute more.
                  </p>

                </div>

              </div>

              {/* Step 04 */}
              <div className="grid md:grid-cols-[100px_1fr] gap-6 md:gap-10 py-9 border-b border-[#cfd4c8]">

                <div className="text-3xl font-semibold text-[#47775f]">
                  04
                </div>

                <div>

                  <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                    Take part in the monthly draw
                  </h2>

                  <p className="mt-4 text-[#687169] leading-7 max-w-2xl">
                    Your latest scores are used to generate your draw entries.
                    The monthly draw can reward matching numbers while
                    contributing to a larger charitable purpose.
                  </p>

                </div>

              </div>

              {/* Step 05 */}
              <div className="grid md:grid-cols-[100px_1fr] gap-6 md:gap-10 py-9 border-b border-[#cfd4c8]">

                <div className="text-3xl font-semibold text-[#47775f]">
                  05
                </div>

                <div>

                  <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                    Verify and receive your prize
                  </h2>

                  <p className="mt-4 text-[#687169] leading-7 max-w-2xl">
                    If you win, submit the required proof through your account.
                    An administrator verifies the result before the payout
                    is processed.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* Simple model */}
        <section className="border-y border-[#cfd4c8] bg-[#dfe5da]">

          <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 md:py-20">

            <div className="grid md:grid-cols-3 gap-px bg-[#cfd4c8] border border-[#cfd4c8]">

              <div className="bg-[#f8f7f1] p-7 md:p-9">

                <p className="text-xs uppercase tracking-[0.16em] text-[#47775f]">
                  01 · Play
                </p>

                <h3 className="mt-8 text-2xl font-semibold">
                  Track performance
                </h3>

                <p className="mt-4 text-sm leading-6 text-[#687169]">
                  Record your latest Stableford scores and keep your
                  performance ready for participation.
                </p>

              </div>

              <div className="bg-[#f8f7f1] p-7 md:p-9">

                <p className="text-xs uppercase tracking-[0.16em] text-[#47775f]">
                  02 · Participate
                </p>

                <h3 className="mt-8 text-2xl font-semibold">
                  Enter the draw
                </h3>

                <p className="mt-4 text-sm leading-6 text-[#687169]">
                  An active membership connects your latest scores with
                  the monthly draw.
                </p>

              </div>

              <div className="bg-[#f8f7f1] p-7 md:p-9">

                <p className="text-xs uppercase tracking-[0.16em] text-[#47775f]">
                  03 · Give
                </p>

                <h3 className="mt-8 text-2xl font-semibold">
                  Create impact
                </h3>

                <p className="mt-4 text-sm leading-6 text-[#687169]">
                  Choose a charity and decide how much of your winnings
                  you want to contribute.
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
                § 03 · Start playing with purpose
              </p>

              <h2 className="mt-5 text-4xl md:text-6xl font-semibold tracking-[-0.04em] leading-[0.95]">
                Ready to become a
                <span className="text-[#47775f]"> Digital Hero?</span>
              </h2>

              <p className="mt-6 text-[#687169] max-w-xl leading-7">
                Create your account, choose your cause and start turning
                your game into meaningful impact.
              </p>

            </div>

            <button
              onClick={() => navigate("/signup")}
              className="shrink-0 px-7 py-4 bg-[#47775f] text-white text-sm font-semibold hover:bg-[#38644f] transition"
            >
              Become a Digital Hero →
            </button>

          </div>

        </section>

      </main>



    </div>
  );
}

export default HowItWorks;