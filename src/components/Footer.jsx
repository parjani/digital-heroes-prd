import { useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="bg-[#0d2117] text-white overflow-hidden">

      {/* ================= TOP CTA ================= */}
      <section className="relative px-6 pt-20 pb-16 lg:pt-28 lg:pb-24">

        {/* Decorative glow */}
        <div className="absolute -top-32 right-[-10%] w-[420px] h-[420px] rounded-full bg-[#8ee276]/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative">

          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-end">

            {/* Main statement */}
            <div className="lg:col-span-8">

              <div className="flex items-center gap-3 mb-7">
                <span className="w-8 h-px bg-[#8ee276]" />

                <span className="text-[10px] uppercase tracking-[0.25em] text-[#8ee276] font-semibold">
                  Performance with purpose
                </span>
              </div>

              <h2 className="text-5xl sm:text-6xl lg:text-8xl font-semibold tracking-[-0.06em] leading-[0.9]">
                Play better.
                <br />
                <span className="text-white/90">Give more.</span>
                <br />
                <span className="text-[#8ee276]">Make an impact.</span>
              </h2>

            </div>


            {/* CTA */}
            <div className="lg:col-span-4 lg:pb-2">

              <p className="text-sm leading-7 text-white/55 max-w-sm mb-7">
                Turn your golf performance into meaningful support for
                charities and communities that matter.
              </p>

              <button
                onClick={() => navigate("/signup")}
                className="group inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-[#8ee276] text-[#103523] text-sm font-bold hover:bg-[#a0ed89] hover:-translate-y-0.5 transition-all shadow-[0_12px_35px_rgba(142,226,118,0.12)]"
              >
                Join Digital Heroes

                <span className="w-7 h-7 rounded-full bg-[#103523] text-[#8ee276] flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </button>

            </div>

          </div>

        </div>
      </section>


      {/* ================= DIVIDER ================= */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-px bg-white/10" />
      </div>


      {/* ================= MAIN FOOTER ================= */}
      <section className="px-6 py-14 lg:py-16">

        <div className="max-w-7xl mx-auto">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-12">

            {/* Brand */}
            <div className="lg:col-span-6">

              <button
                onClick={() => navigate("/")}
                className="group text-left"
              >
                <div className="flex items-center gap-3">

                  <div className="w-11 h-11 rounded-full bg-[#8ee276] text-[#103523] flex items-center justify-center font-black italic tracking-[-0.08em] text-sm shadow-[0_8px_25px_rgba(142,226,118,0.12)] group-hover:scale-105 transition-transform">
                    DH
                  </div>

                  <div className="leading-none">
                    <div className="text-lg font-bold tracking-[-0.03em]">
                      digital.
                    </div>

                    <div className="mt-1 text-[9px] uppercase tracking-[0.24em] text-[#8ee276] font-semibold">
                      Heroes
                    </div>
                  </div>

                </div>
              </button>


              <p className="mt-8 max-w-md text-sm leading-7 text-white/45">
                Digital Heroes connects golf performance with charitable
                giving, creating a simple way to turn participation into
                meaningful impact.
              </p>


              {/* Small impact badge */}
              <div className="mt-8 inline-flex items-center gap-3 px-4 py-2.5 rounded-full border border-white/10 bg-white/[0.03]">

                <span className="w-2 h-2 rounded-full bg-[#8ee276] shadow-[0_0_12px_rgba(142,226,118,0.7)]" />

                <span className="text-[10px] uppercase tracking-[0.18em] text-white/55">
                  Golf • Community • Impact
                </span>

              </div>

            </div>


            {/* Explore */}
            <div className="lg:col-span-2">

              <p className="text-[10px] uppercase tracking-[0.22em] text-white/35 mb-6">
                Explore
              </p>

              <div className="flex flex-col items-start gap-4">

                <FooterLink
                  label="Home"
                  onClick={() => navigate("/")}
                />

                <FooterLink
                  label="How it works"
                  onClick={() => navigate("/how-it-works")}
                />

                <FooterLink
                  label="Charities"
                  onClick={() => navigate("/charities")}
                />

              </div>

            </div>


            {/* Account */}
            <div className="lg:col-span-2">

              <p className="text-[10px] uppercase tracking-[0.22em] text-white/35 mb-6">
                Account
              </p>

              <div className="flex flex-col items-start gap-4">

                <FooterLink
                  label="Login"
                  onClick={() => navigate("/login")}
                />

                <FooterLink
                  label="Join Digital Heroes"
                  onClick={() => navigate("/signup")}
                />

              </div>

            </div>


            {/* Contact / statement */}
            <div className="lg:col-span-2">

              <p className="text-[10px] uppercase tracking-[0.22em] text-white/35 mb-6">
                Our purpose
              </p>

              <p className="text-sm leading-6 text-white/55">
                Better performance.
                <br />
                Bigger impact.
                <br />
                <span className="text-[#8ee276]">
                  One round at a time.
                </span>
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* ================= BOTTOM BAR ================= */}
      <div className="px-6 pb-7">

        <div className="max-w-7xl mx-auto">

          <div className="h-px bg-white/10 mb-6" />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <p className="text-[11px] text-white/30">
              © {new Date().getFullYear()} Digital Heroes. All rights reserved.
            </p>

            <div className="flex items-center gap-4">

              <span className="text-[10px] uppercase tracking-[0.16em] text-white/30">
                Performance with purpose
              </span>

              <span className="w-1 h-1 rounded-full bg-[#8ee276]" />

              <span className="text-[10px] uppercase tracking-[0.16em] text-white/30">
                Built for impact
              </span>

            </div>

          </div>

        </div>

      </div>

    </footer>
  );
}


/* ================= FOOTER LINK ================= */

function FooterLink({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-2 text-sm text-white/65 hover:text-white transition-colors"
    >
      <span>{label}</span>

      <span className="text-[#8ee276] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
        →
      </span>
    </button>
  );
}