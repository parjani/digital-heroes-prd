import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleLogin(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    if (!form.email || !form.password) {
      setError("Please enter your email and password.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profileError) {
        console.error("Profile error:", profileError);
        setError("Unable to load your account profile.");
        setLoading(false);
        return;
      }

      if (profile?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#f3f1e8] flex items-center justify-center px-5 py-8 md:py-12">

      <div className="w-full max-w-6xl overflow-hidden rounded-[2rem] bg-[#f8f7f1] border border-[#d5d9d0] shadow-[0_30px_80px_rgba(16,24,19,0.10)]">

        <div className="grid lg:grid-cols-2">

          {/* ========================================================= */}
          {/* LEFT — BRAND / MESSAGE */}
          {/* ========================================================= */}

          <div className="relative hidden lg:flex min-h-[720px] overflow-hidden bg-[#0d2117] text-white p-12 xl:p-16 flex-col justify-between">

            {/* Decorative glow */}
            <div className="absolute -top-40 -right-32 w-[500px] h-[500px] rounded-full bg-[#8ee276]/10 blur-3xl pointer-events-none" />

            <div className="absolute -bottom-40 -left-32 w-[480px] h-[480px] rounded-full bg-[#47775f]/20 blur-3xl pointer-events-none" />

            {/* Decorative circle */}
            <div className="absolute right-[-110px] bottom-[90px] w-[340px] h-[340px] rounded-full border-[48px] border-white/[0.03] pointer-events-none" />

            {/* Logo */}
            <div className="relative z-10">

              <button
                onClick={() => navigate("/")}
                className="group flex items-center gap-3"
              >
                <div className="w-11 h-11 rounded-full bg-[#8ee276] text-[#103523] flex items-center justify-center font-black italic tracking-[-0.08em] text-sm group-hover:scale-105 transition-transform">
                  DH
                </div>

                <div className="text-left leading-none">
                  <div className="text-lg font-bold tracking-[-0.03em]">
                    digital.
                  </div>

                  <div className="mt-1 text-[9px] uppercase tracking-[0.24em] text-[#8ee276] font-semibold">
                    Heroes
                  </div>
                </div>
              </button>

            </div>

            {/* Main message */}
            <div className="relative z-10">

              <div className="flex items-center gap-3 mb-7">
                <span className="w-8 h-px bg-[#8ee276]" />

                <span className="text-[10px] uppercase tracking-[0.25em] text-[#8ee276] font-semibold">
                  Welcome back
                </span>
              </div>

              <h2 className="text-5xl xl:text-6xl font-semibold tracking-[-0.06em] leading-[0.9]">

                Your game.

                <br />

                <span className="text-[#8ee276]">
                  Your impact.
                </span>

                <br />

                <span className="text-white/40">
                  Keep going.
                </span>

              </h2>

              <p className="mt-8 max-w-md text-sm leading-7 text-white/50">
                Sign in to keep tracking your golf performance, support the
                causes you care about and stay connected to the Digital Heroes
                community.
              </p>

              {/* Stats */}
              <div className="mt-10 flex gap-8">

                <div>
                  <p className="text-2xl font-semibold text-white">
                    5
                  </p>

                  <p className="mt-1 text-[9px] uppercase tracking-[0.18em] text-white/35">
                    Latest scores
                  </p>
                </div>

                <div className="w-px bg-white/10" />

                <div>
                  <p className="text-2xl font-semibold text-[#8ee276]">
                    10%+
                  </p>

                  <p className="mt-1 text-[9px] uppercase tracking-[0.18em] text-white/35">
                    Charity contribution
                  </p>
                </div>

                <div className="w-px bg-white/10" />

                <div>
                  <p className="text-2xl font-semibold text-white">
                    01
                  </p>

                  <p className="mt-1 text-[9px] uppercase tracking-[0.18em] text-white/35">
                    Monthly draw
                  </p>
                </div>

              </div>

            </div>

            {/* Bottom label */}
            <div className="relative z-10 flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-white/35">

              <span className="w-2 h-2 rounded-full bg-[#8ee276] shadow-[0_0_12px_rgba(142,226,118,0.6)]" />

              Play with purpose

            </div>

          </div>


          {/* ========================================================= */}
          {/* RIGHT — LOGIN FORM */}
          {/* ========================================================= */}

          <div className="p-7 sm:p-10 lg:p-12 xl:p-16">

            {/* Mobile logo */}
            <div className="lg:hidden mb-10">

              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-3"
              >

                <div className="w-10 h-10 rounded-full bg-[#0d2117] text-[#8ee276] flex items-center justify-center font-black italic text-sm">
                  DH
                </div>

                <div className="text-left leading-none">

                  <div className="text-lg font-bold tracking-[-0.03em]">
                    digital.
                  </div>

                  <div className="mt-1 text-[9px] uppercase tracking-[0.24em] text-[#47775f] font-semibold">
                    Heroes
                  </div>

                </div>

              </button>

            </div>


            {/* Header */}
            <div className="mb-9">

              <div className="flex items-center gap-3 mb-5">

                <span className="text-[10px] uppercase tracking-[0.25em] text-[#47775f] font-semibold">
                  Member login
                </span>

                <span className="w-8 h-px bg-[#47775f]/40" />

                <span className="text-[10px] text-[#8a918b]">
                  02
                </span>

              </div>

              <h1 className="text-4xl sm:text-5xl font-semibold tracking-[-0.055em] leading-[0.95]">

                Welcome
                <span className="block text-[#47775f]">
                  back.
                </span>

              </h1>

              <p className="mt-5 text-sm md:text-base leading-7 text-[#687169] max-w-md">
                Sign in to continue your Digital Heroes journey.
              </p>

            </div>


            {/* ========================================================= */}
            {/* FORM */}
            {/* ========================================================= */}

            <form onSubmit={handleLogin} className="space-y-5">

              {/* Email */}
              <div>

                <label
                  htmlFor="email"
                  className="block mb-2 text-xs uppercase tracking-[0.12em] font-semibold text-[#303a34]"
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  className="w-full rounded-2xl border border-[#d0d6cd] bg-[#f3f1e8] px-4 py-3.5 text-sm text-[#101813] placeholder:text-[#9a9f99] outline-none transition focus:border-[#47775f] focus:ring-4 focus:ring-[#47775f]/10"
                />

              </div>


              {/* Password */}
              <div>

                <label
                  htmlFor="password"
                  className="block mb-2 text-xs uppercase tracking-[0.12em] font-semibold text-[#303a34]"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  className="w-full rounded-2xl border border-[#d0d6cd] bg-[#f3f1e8] px-4 py-3.5 text-sm text-[#101813] placeholder:text-[#9a9f99] outline-none transition focus:border-[#47775f] focus:ring-4 focus:ring-[#47775f]/10"
                />

                <div className="mt-2 flex items-center gap-2">

                  <span className="w-1.5 h-1.5 rounded-full bg-[#8ee276]" />

                  <p className="text-[11px] text-[#8a918b]">
                    Your account password is securely handled by Supabase.
                  </p>

                </div>

              </div>


              {/* Error */}
              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm leading-6 text-red-700">
                  {error}
                </div>
              )}


              {/* Login button */}
              <button
                type="submit"
                disabled={loading}
                className="group w-full rounded-2xl bg-[#0d2117] px-5 py-4 text-white font-semibold hover:bg-[#173c28] disabled:cursor-not-allowed disabled:opacity-50 transition-all"
              >

                <span className="flex items-center justify-center gap-3">

                  {loading
                    ? "Signing in..."
                    : "Sign in to Digital Heroes"}

                  {!loading && (
                    <span className="w-7 h-7 rounded-full bg-[#8ee276] text-[#103523] flex items-center justify-center group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  )}

                </span>

              </button>

            </form>


            {/* Divider */}
            <div className="flex items-center gap-4 my-8">

              <div className="h-px flex-1 bg-[#d7dbd3]" />

              <span className="text-[9px] uppercase tracking-[0.16em] text-[#9a9f99] whitespace-nowrap">
                New here?
              </span>

              <div className="h-px flex-1 bg-[#d7dbd3]" />

            </div>


            {/* Signup */}
            <p className="text-center text-sm text-[#687169]">

              Don't have an account?{" "}

              <Link
                to="/signup"
                className="font-semibold text-[#47775f] hover:text-[#315b46] transition"
              >
                Create Digital Heroes account →
              </Link>

            </p>


            {/* Bottom info */}
            <div className="mt-10 pt-6 border-t border-[#d7dbd3]">

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[10px] uppercase tracking-[0.14em] text-[#8a918b]">

                <span>
                  Digital Heroes
                </span>

                <span>
                  Performance with purpose.
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;