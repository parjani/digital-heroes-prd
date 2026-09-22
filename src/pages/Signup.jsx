import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    charityId: "",
    charityPercentage: 10,
  });

  const [charities, setCharities] = useState([]);
  const [charitiesLoading, setCharitiesLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch active charities
  useEffect(() => {
    async function fetchCharities() {
      setCharitiesLoading(true);

      const { data, error } = await supabase
        .from("charities")
        .select("id, name, description")
        .eq("active", true)
        .order("name");

      if (error) {
        console.error("Fetch charities error:", error);
        setError("Unable to load charities. Please try again.");
      } else {
        setCharities(data || []);

        // Automatically select first charity
        if (data?.length > 0) {
          setForm((prev) => ({
            ...prev,
            charityId: prev.charityId || data[0].id,
          }));
        }
      }

      setCharitiesLoading(false);
    }

    fetchCharities();
  }, []);

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

  if (
    !form.fullName ||
    !form.email ||
    !form.password ||
    !form.charityId
  ) {
    setError("Please fill all fields and select a charity.");
    setLoading(false);
    return;
  }

  if (form.password.length < 6) {
    setError("Password must be at least 6 characters.");
    setLoading(false);
    return;
  }

  if (
    Number(form.charityPercentage) < 10 ||
    Number(form.charityPercentage) > 100
  ) {
    setError("Charity contribution must be between 10% and 100%.");
    setLoading(false);
    return;
  }

  try {
    // 1. Create Supabase account
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
      throw error;
    }

    if (!data.user) {
      throw new Error("Unable to create account.");
    }

    // 2. Save charity using the SAME RPC
    const { error: charityError } = await supabase.rpc(
      "update_my_charity_preferences",
      {
        p_charity_id: form.charityId,
        p_charity_percentage: Number(form.charityPercentage),
      }
    );

    if (charityError) {
      console.error("Charity preference error:", charityError);

      throw new Error(
        "Account was created, but charity preference could not be saved."
      );
    }

    // 3. Success
    setSuccess(
      "Account created and charity preference saved successfully."
    );

    setTimeout(() => {
      navigate("/login");
    }, 2500);

  } catch (error) {
    console.error("Signup error:", error);
    setError(error.message || "Unable to create account.");
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="min-h-screen bg-[#f3f1e8] flex items-center justify-center px-5 py-8 md:py-12">

      <div className="w-full max-w-6xl overflow-hidden rounded-[2rem] bg-[#f8f7f1] border border-[#d5d9d0] shadow-[0_30px_80px_rgba(16,24,19,0.10)]">

        <div className="grid lg:grid-cols-2">

          {/* ===================================================== */}
          {/* LEFT — BRAND / MESSAGE */}
          {/* ===================================================== */}

          <div className="relative hidden lg:flex min-h-[850px] overflow-hidden bg-[#0d2117] text-white p-12 xl:p-16 flex-col justify-between">

            <div className="absolute -top-40 -right-32 w-[500px] h-[500px] rounded-full bg-[#8ee276]/10 blur-3xl pointer-events-none" />

            <div className="absolute -bottom-40 -left-32 w-[480px] h-[480px] rounded-full bg-[#47775f]/20 blur-3xl pointer-events-none" />

            <div className="absolute right-[-100px] bottom-[100px] w-[300px] h-[300px] rounded-full border-[45px] border-white/[0.03] pointer-events-none" />

            {/* Brand */}
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
                  Join the movement
                </span>

              </div>

              <h2 className="text-5xl xl:text-6xl font-semibold tracking-[-0.06em] leading-[0.9]">

                Your game.

                <br />

                <span className="text-[#8ee276]">
                  Your impact.
                </span>

                <br />

                <span className="text-white/45">
                  Something bigger.
                </span>

              </h2>

              <p className="mt-8 max-w-md text-sm leading-7 text-white/50">
                Create your Digital Heroes account and connect your golf
                performance with charitable giving and the monthly draw.
              </p>

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

            {/* Bottom */}
            <div className="relative z-10 flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-white/35">

              <span className="w-2 h-2 rounded-full bg-[#8ee276] shadow-[0_0_12px_rgba(142,226,118,0.6)]" />

              Play with purpose

            </div>

          </div>

          {/* ===================================================== */}
          {/* RIGHT — SIGNUP */}
          {/* ===================================================== */}

          <div className="p-7 sm:p-10 lg:p-12 xl:p-16">

            {/* Mobile brand */}
            <div className="lg:hidden mb-10">

              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-3"
              >

                <div className="w-10 h-10 rounded-full bg-[#0d2117] text-[#8ee276] flex items-center justify-center font-black italic text-sm">
                  DH
                </div>

                <div className="text-left leading-none">

                  <div className="text-lg font-bold">
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
                  Create your account
                </span>

                <span className="w-8 h-px bg-[#47775f]/40" />

                <span className="text-[10px] text-[#8a918b]">
                  01
                </span>

              </div>

              <h1 className="text-4xl sm:text-5xl font-semibold tracking-[-0.055em] leading-[0.95]">

                Become a

                <span className="block text-[#47775f]">
                  Digital Hero.
                </span>

              </h1>

              <p className="mt-5 text-sm md:text-base leading-7 text-[#687169] max-w-md">
                Start tracking your game, choose a cause and play with
                purpose.
              </p>

            </div>

            {/* ================================================= */}
            {/* FORM */}
            {/* ================================================= */}

            <form
              onSubmit={handleSignup}
              className="space-y-5"
            >

              {/* Full name */}
              <div>

                <label
                  htmlFor="fullName"
                  className="block mb-2 text-xs uppercase tracking-[0.12em] font-semibold text-[#303a34]"
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
                  className="w-full rounded-2xl border border-[#d0d6cd] bg-[#f3f1e8] px-4 py-3.5 text-sm text-[#101813] placeholder:text-[#9a9f99] outline-none transition focus:border-[#47775f] focus:ring-4 focus:ring-[#47775f]/10"
                />

              </div>

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
                  placeholder="Minimum 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-[#d0d6cd] bg-[#f3f1e8] px-4 py-3.5 text-sm text-[#101813] placeholder:text-[#9a9f99] outline-none transition focus:border-[#47775f] focus:ring-4 focus:ring-[#47775f]/10"
                />

                <div className="mt-2 flex items-center gap-2">

                  <span className="w-1.5 h-1.5 rounded-full bg-[#8ee276]" />

                  <p className="text-[11px] text-[#8a918b]">
                    Use at least 6 characters.
                  </p>

                </div>

              </div>

              {/* ================================================= */}
              {/* CHARITY */}
              {/* ================================================= */}

              <div className="pt-2">

                <div className="mb-4">

                  <label
                    htmlFor="charityId"
                    className="block mb-2 text-xs uppercase tracking-[0.12em] font-semibold text-[#303a34]"
                  >
                    Choose your charity
                  </label>

                  <p className="mb-3 text-xs leading-5 text-[#8a918b]">
                    Select the cause you want your subscription contribution
                    to support.
                  </p>

                  <select
                    id="charityId"
                    name="charityId"
                    value={form.charityId}
                    onChange={handleChange}
                    disabled={charitiesLoading || charities.length === 0}
                    className="w-full rounded-2xl border border-[#d0d6cd] bg-[#f3f1e8] px-4 py-3.5 text-sm text-[#101813] outline-none transition focus:border-[#47775f] focus:ring-4 focus:ring-[#47775f]/10 disabled:opacity-60"
                  >

                    {charitiesLoading ? (
                      <option value="">
                        Loading charities...
                      </option>
                    ) : charities.length === 0 ? (
                      <option value="">
                        No charities available
                      </option>
                    ) : (
                      <>
                        <option value="">
                          Select a charity
                        </option>

                        {charities.map((charity) => (
                          <option
                            key={charity.id}
                            value={charity.id}
                          >
                            {charity.name}
                          </option>
                        ))}
                      </>
                    )}

                  </select>

                </div>

                {/* Charity percentage */}
                <div>

                  <div className="flex items-center justify-between mb-2">

                    <label
                      htmlFor="charityPercentage"
                      className="text-xs uppercase tracking-[0.12em] font-semibold text-[#303a34]"
                    >
                      Charity contribution
                    </label>

                    <span className="text-sm font-bold text-[#47775f]">
                      {form.charityPercentage}%
                    </span>

                  </div>

                  <p className="mb-4 text-xs leading-5 text-[#8a918b]">
                    Minimum contribution is 10% of your subscription fee.
                  </p>

                  <input
                    id="charityPercentage"
                    type="range"
                    name="charityPercentage"
                    min="10"
                    max="100"
                    step="5"
                    value={form.charityPercentage}
                    onChange={handleChange}
                    className="w-full accent-[#47775f]"
                  />

                  <div className="flex justify-between mt-2 text-[10px] text-[#8a918b]">
                    <span>10%</span>
                    <span>100%</span>
                  </div>

                  {/* Quick percentages */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-4">

                    {[10, 20, 30, 50, 75, 100].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            charityPercentage: value,
                          }))
                        }
                        className={`rounded-xl px-2 py-2 text-xs font-semibold transition ${
                          Number(form.charityPercentage) === value
                            ? "bg-[#0d2117] text-white"
                            : "bg-[#f3f1e8] text-[#47775f] border border-[#d0d6cd] hover:border-[#47775f]"
                        }`}
                      >
                        {value}%
                      </button>
                    ))}

                  </div>

                </div>

              </div>

              {/* Info */}
              <div className="rounded-2xl border border-[#d5d9d0] bg-[#f3f1e8] px-4 py-3.5">

                <div className="flex gap-3">

                  <div className="w-7 h-7 shrink-0 rounded-full bg-[#dcebdc] text-[#47775f] flex items-center justify-center font-bold text-xs">
                    ✓
                  </div>

                  <div>

                    <p className="text-xs font-semibold text-[#303a34]">
                      Your choice matters
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-[#8a918b]">
                      You can update your charity preference later from
                      your dashboard.
                    </p>

                  </div>

                </div>

              </div>

              {/* Error */}
              {error && (

                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700">
                  {error}
                </div>

              )}

              {/* Success */}
              {success && (

                <div className="rounded-2xl border border-[#a9c5b3] bg-[#e7f0e9] px-4 py-3.5 text-sm leading-6 text-[#356b56]">
                  {success}
                </div>

              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || charitiesLoading}
                className="group w-full rounded-2xl bg-[#0d2117] px-5 py-4 text-white font-semibold hover:bg-[#173c28] disabled:cursor-not-allowed disabled:opacity-50 transition-all"
              >

                <span className="flex items-center justify-center gap-3">

                  {loading
                    ? "Creating account..."
                    : "Create Digital Heroes account"}

                  {!loading && (

                    <span className="w-7 h-7 rounded-full bg-[#8ee276] text-[#103523] flex items-center justify-center group-hover:translate-x-1 transition-transform">
                      →
                    </span>

                  )}

                </span>

              </button>

            </form>

            {/* ================================================= */}
            {/* LOGIN */}
            {/* ================================================= */}

            <div className="flex items-center gap-4 my-8">

              <div className="h-px flex-1 bg-[#d7dbd3]" />

              <span className="text-[9px] uppercase tracking-[0.16em] text-[#9a9f99] whitespace-nowrap">
                Already a member?
              </span>

              <div className="h-px flex-1 bg-[#d7dbd3]" />

            </div>

            <p className="text-center text-sm text-[#687169]">

              Already have an account?{" "}

              <Link
                to="/login"
                className="font-semibold text-[#47775f] hover:text-[#315b46] transition"
              >
                Login →
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

export default Signup;