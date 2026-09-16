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

  const { data, error } =
    await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

  if (error) {
    setError(error.message);
    setLoading(false);
    return;
  }

  if (data.user) {
    const { data: profile, error: profileError } =
      await supabase
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
  <div className="min-h-screen bg-[#f3f1e8] text-[#101813] flex items-center justify-center px-5 py-10">

    <div className="w-full max-w-5xl grid lg:grid-cols-2 bg-[#f8f7f1] border border-[#cfd4c8] rounded-[28px] overflow-hidden shadow-[0_20px_60px_rgba(16,24,19,0.08)]">

      {/* LEFT — BRAND / MESSAGE */}
      <div className="hidden lg:flex relative bg-[#dfe5da] p-12 xl:p-16 flex-col justify-between overflow-hidden">

        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#47775f]/20" />
        <div className="absolute -bottom-32 -left-24 w-80 h-80 rounded-full bg-[#47775f]/10" />

        <div className="relative z-10">

          <button
            onClick={() => navigate("/")}
            className="text-2xl font-semibold tracking-tight text-[#101813]"
          >
            digital.
            <span className="block text-xs font-medium tracking-[0.25em] text-[#47775f] mt-1">
              HEROES
            </span>
          </button>

        </div>

        <div className="relative z-10">

          <p className="text-xs uppercase tracking-[0.25em] text-[#47775f] font-medium mb-6">
            Play with purpose
          </p>

          <h2 className="text-5xl xl:text-6xl font-semibold tracking-[-0.04em] leading-[0.95]">
            Welcome
            <br />
            back,
            <br />
            <span className="text-[#47775f]/55">
              Digital Hero.
            </span>
          </h2>

          <p className="mt-7 max-w-sm text-[#4f5952] leading-relaxed">
            Continue tracking your game, supporting causes you care about,
            and taking part in the monthly Digital Heroes draw.
          </p>

        </div>

        <div className="relative z-10 flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-[#687169]">
          <span className="w-2 h-2 rounded-full bg-[#47775f]" />
          Play with purpose
        </div>

      </div>


      {/* RIGHT — LOGIN FORM */}
      <div className="p-7 sm:p-10 lg:p-12 xl:p-16">

        {/* Mobile logo */}
        <div className="lg:hidden mb-10">

          <button
            onClick={() => navigate("/")}
            className="text-2xl font-semibold tracking-tight"
          >
            digital.
            <span className="text-[#47775f]">
              HEROES
            </span>
          </button>

        </div>


        {/* Header */}
        <div className="mb-9">

          <p className="text-xs uppercase tracking-[0.22em] text-[#47775f] font-medium">
            Member login
          </p>

          <h1 className="mt-4 text-4xl sm:text-5xl font-semibold tracking-[-0.035em] leading-tight">
            Welcome back.
          </h1>

          <p className="mt-4 text-[#687169] leading-relaxed">
            Sign in to continue your Digital Heroes journey.
          </p>

        </div>


        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">

          {/* Email */}
          <div>

            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-[#303a34]"
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
              className="w-full rounded-xl border border-[#c9d0c6] bg-[#f3f1e8] px-4 py-3.5 text-[#101813] placeholder:text-[#9a9f99] outline-none transition focus:border-[#47775f] focus:ring-4 focus:ring-[#47775f]/10"
            />

          </div>


          {/* Password */}
          <div>

            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-[#303a34]"
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
              className="w-full rounded-xl border border-[#c9d0c6] bg-[#f3f1e8] px-4 py-3.5 text-[#101813] placeholder:text-[#9a9f99] outline-none transition focus:border-[#47775f] focus:ring-4 focus:ring-[#47775f]/10"
            />

          </div>


          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}


          {/* Login */}
          <button
            type="submit"
            disabled={loading}
            className="group w-full rounded-xl bg-[#47775f] px-5 py-3.5 text-white font-semibold transition hover:bg-[#38644f] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="flex items-center justify-center gap-3">
              {loading ? "Logging in..." : "Login"}

              {!loading && (
                <span className="text-lg transition-transform group-hover:translate-x-1">
                  →
                </span>
              )}
            </span>
          </button>

        </form>


        {/* Divider */}
        <div className="flex items-center gap-4 my-8">

          <div className="h-px flex-1 bg-[#d7dbd3]" />

          <span className="text-xs uppercase tracking-[0.15em] text-[#9a9f99]">
            New here?
          </span>

          <div className="h-px flex-1 bg-[#d7dbd3]" />

        </div>


        {/* Signup */}
        <p className="text-center text-sm text-[#687169]">

          Don't have an account?{" "}

          <Link
            to="/signup"
            className="font-semibold text-[#47775f] hover:text-[#38644f] transition"
          >
            Create account →
          </Link>

        </p>


        {/* Bottom info */}
        <div className="mt-10 pt-6 border-t border-[#d7dbd3]">

          <div className="flex items-center justify-between text-xs text-[#8a918b]">

            <span>
              Digital Heroes
            </span>

            <span>
              Play with purpose.
            </span>

          </div>

        </div>

      </div>

    </div>

  </div>
);
}

export default Login;