import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSignup(e) {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    if (!form.fullName || !form.email || !form.password) {
      setError("Please fill all fields.");
      setLoading(false);
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.fullName,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      setSuccess(
        "Account created successfully. Please check your email to verify your account."
      );

      setTimeout(() => {
        navigate("/login");
      }, 2500);
    }

    setLoading(false);
  }

 return (
  <div className="min-h-screen bg-[#f3f1e8] text-[#101813] flex items-center justify-center px-5 py-10">

    <div className="w-full max-w-5xl grid lg:grid-cols-2 bg-[#f8f7f1] border border-[#cfd4c8] rounded-[28px] overflow-hidden shadow-[0_20px_60px_rgba(16,24,19,0.08)]">

      {/* LEFT — BRAND / MESSAGE */}
      <div className="hidden lg:flex relative bg-[#dfe5da] p-12 xl:p-16 flex-col justify-between overflow-hidden">

        {/* Decorative shapes */}
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
            § 01 · Join the movement
          </p>

          <h2 className="text-5xl xl:text-6xl font-semibold tracking-[-0.04em] leading-[0.95]">
            Your game.
            <br />
            Your impact.
            <br />
            <span className="text-[#47775f]/55">
              Something bigger.
            </span>
          </h2>

          <p className="mt-7 max-w-sm text-[#4f5952] leading-relaxed">
            Create your Digital Heroes account and connect your golf
            performance with charitable giving and the monthly draw.
          </p>

        </div>

        <div className="relative z-10 flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-[#687169]">
          <span className="w-2 h-2 rounded-full bg-[#47775f]" />
          Play with purpose
        </div>

      </div>


      {/* RIGHT — SIGNUP FORM */}
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
            § 02 · Create your account
          </p>

          <h1 className="mt-4 text-4xl sm:text-5xl font-semibold tracking-[-0.035em] leading-tight">
            Become a
            <br />
            Digital Hero.
          </h1>

          <p className="mt-4 text-[#687169] leading-relaxed">
            Start tracking your game, choose a cause and play with purpose.
          </p>

        </div>


        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-5">

          {/* Full name */}
          <div>

            <label
              htmlFor="fullName"
              className="block mb-2 text-sm font-medium text-[#303a34]"
            >
              Full name
            </label>

            <input
              id="fullName"
              type="text"
              name="fullName"
              placeholder="Your full name"
              value={form.fullName}
              onChange={handleChange}
              className="w-full rounded-xl border border-[#c9d0c6] bg-[#f3f1e8] px-4 py-3.5 text-[#101813] placeholder:text-[#9a9f99] outline-none transition focus:border-[#47775f] focus:ring-4 focus:ring-[#47775f]/10"
            />

          </div>


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
              placeholder="Minimum 6 characters"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-xl border border-[#c9d0c6] bg-[#f3f1e8] px-4 py-3.5 text-[#101813] placeholder:text-[#9a9f99] outline-none transition focus:border-[#47775f] focus:ring-4 focus:ring-[#47775f]/10"
            />

            <p className="mt-2 text-xs text-[#8a918b]">
              Use at least 6 characters.
            </p>

          </div>


          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}


          {/* Success */}
          {success && (
            <div className="rounded-xl border border-[#a9c5b3] bg-[#e7f0e9] px-4 py-3 text-sm text-[#356b56]">
              {success}
            </div>
          )}


          {/* Create account */}
          <button
            type="submit"
            disabled={loading}
            className="group w-full rounded-xl bg-[#47775f] px-5 py-3.5 text-white font-semibold transition hover:bg-[#38644f] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="flex items-center justify-center gap-3">
              {loading ? "Creating account..." : "Create Account"}

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
            Already a member?
          </span>

          <div className="h-px flex-1 bg-[#d7dbd3]" />

        </div>


        {/* Login */}
        <p className="text-center text-sm text-[#687169]">

          Already have an account?{" "}

          <Link
            to="/login"
            className="font-semibold text-[#47775f] hover:text-[#38644f] transition"
          >
            Login →
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

export default Signup;