import { useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="bg-[#101813] text-[#f3f1e8] mt-24">

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 py-16 lg:py-20">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

          {/* Brand / Statement */}
          <div className="lg:col-span-7">

            <button
              onClick={() => navigate("/")}
              className="text-left group"
            >
              <div className="text-3xl font-bold tracking-tight">
                digital.
              </div>

              <div className="text-[10px] uppercase tracking-[0.3em] text-[#8fb39d] mt-1">
                Heroes
              </div>
            </button>

            <div className="mt-10 max-w-2xl">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#8a918b] mb-5">
                Performance with purpose
              </p>

              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.04em] leading-[0.95]">
                Play better.
                <br />
                Give more.
                <br />
                <span className="text-[#8fb39d]">Make an impact.</span>
              </h2>
            </div>

            <p className="mt-8 max-w-lg text-sm leading-7 text-[#aeb6af]">
              Digital Heroes connects golf performance with charitable giving,
              creating a simple way to turn participation into meaningful
              impact.
            </p>

          </div>


          {/* Navigation */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-10">

            {/* Explore */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#8a918b] mb-6">
                Explore
              </p>

              <div className="flex flex-col items-start gap-4">

                <button
                  onClick={() => navigate("/")}
                  className="text-sm text-[#f3f1e8] hover:text-[#8fb39d] transition"
                >
                  Home
                </button>

                <button
                  onClick={() => navigate("/how-it-works")}
                  className="text-sm text-[#f3f1e8] hover:text-[#8fb39d] transition"
                >
                  How it works
                </button>

                <button
                  onClick={() => navigate("/charities")}
                  className="text-sm text-[#f3f1e8] hover:text-[#8fb39d] transition"
                >
                  Charities
                </button>

              </div>
            </div>


            {/* Account */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#8a918b] mb-6">
                Account
              </p>

              <div className="flex flex-col items-start gap-4">

                <button
                  onClick={() => navigate("/login")}
                  className="text-sm text-[#f3f1e8] hover:text-[#8fb39d] transition"
                >
                  Login
                </button>

                <button
                  onClick={() => navigate("/signup")}
                  className="text-sm text-[#f3f1e8] hover:text-[#8fb39d] transition"
                >
                  Join Digital Heroes
                </button>

              </div>
            </div>

          </div>

        </div>


        {/* CTA */}
        <div className="mt-16 pt-8 border-t border-[#303a33] flex flex-col md:flex-row md:items-center md:justify-between gap-6">

          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#8a918b] mb-2">
              Ready to make a difference?
            </p>

            <p className="text-lg text-[#f3f1e8]">
              Your performance can support something bigger.
            </p>
          </div>

          <button
            onClick={() => navigate("/signup")}
            className="self-start md:self-auto px-7 py-3.5 bg-[#47745f] text-white rounded-full text-sm font-semibold hover:bg-[#56856d] transition"
          >
            Join Digital Heroes →
          </button>

        </div>


        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-[#303a33] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <p className="text-xs text-[#7f8981]">
            © {new Date().getFullYear()} Digital Heroes. All rights reserved.
          </p>

          <div className="flex items-center gap-6">

            <span className="text-xs text-[#7f8981]">
              Performance with purpose.
            </span>

            <span className="hidden sm:block w-1 h-1 rounded-full bg-[#47745f]" />

            <span className="text-xs text-[#7f8981]">
              Built for impact.
            </span>

          </div>

        </div>

      </div>

    </footer>
  );
}