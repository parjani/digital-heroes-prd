import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  /*
   * Handle CORS preflight request.
   */
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  /*
   * Only allow POST requests.
   */
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Method not allowed.",
      }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }

  try {
    /*
     * Get data sent from PaymentSuccess.jsx.
     */
    const {
      razorpay_payment_id,
      razorpay_payment_link_id,
      razorpay_payment_link_reference_id,
    } = await req.json();

    /*
     * Payment ID is required.
     */
    if (!razorpay_payment_id) {
      throw new Error("Razorpay payment ID is missing.");
    }

    /*
     * Payment Link ID is required.
     */
    if (!razorpay_payment_link_id) {
      throw new Error(
        "Razorpay payment link ID is missing."
      );
    }

    /*
     * Razorpay credentials.
     *
     * These are stored in Supabase Edge Function secrets.
     * NEVER put RAZORPAY_KEY_SECRET in React/Vite.
     */
    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    const keySecret = Deno.env.get(
      "RAZORPAY_KEY_SECRET"
    );

    if (!keyId || !keySecret) {
      throw new Error(
        "Razorpay credentials are not configured."
      );
    }

    /*
     * Supabase server-side credentials.
     *
     * SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
     * are used only inside this Edge Function.
     */
    const supabaseUrl =
      Deno.env.get("SUPABASE_URL");

    const supabaseServiceRoleKey =
      Deno.env.get(
        "SUPABASE_SERVICE_ROLE_KEY"
      );

    if (
      !supabaseUrl ||
      !supabaseServiceRoleKey
    ) {
      throw new Error(
        "Supabase server credentials are not configured."
      );
    }

    /*
     * Create Supabase admin client.
     *
     * This bypasses normal RLS policies.
     * It must NEVER be exposed to the frontend.
     */
    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    /*
     * Razorpay Basic Authentication.
     */
    const auth = btoa(
      `${keyId}:${keySecret}`
    );

    /*
     * ---------------------------------------------------
     * STEP 1
     * Fetch the Payment Link from Razorpay.
     * ---------------------------------------------------
     *
     * We do NOT trust userId or plan from the frontend.
     *
     * Instead, we get them from the Payment Link notes
     * that were created by create-razorpay-payment-link.
     */
    const paymentLinkResponse =
      await fetch(
        `https://api.razorpay.com/v1/payment_links/${razorpay_payment_link_id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Basic ${auth}`,
          },
        }
      );

    const paymentLinkData =
      await paymentLinkResponse.json();

    if (!paymentLinkResponse.ok) {
      console.error(
        "Razorpay Payment Link error:",
        paymentLinkData
      );

      throw new Error(
        paymentLinkData?.error?.description ||
          "Unable to verify Razorpay Payment Link."
      );
    }

    /*
     * Make sure the Payment Link belongs to
     * the payment link ID received by our app.
     */
    if (
      paymentLinkData.id !==
      razorpay_payment_link_id
    ) {
      throw new Error(
        "Payment Link verification failed."
      );
    }

    /*
     * ---------------------------------------------------
     * STEP 2
     * Payment Link must be PAID.
     * ---------------------------------------------------
     */
    if (
      paymentLinkData.status !== "paid"
    ) {
      throw new Error(
        `Payment Link is not paid. Current status: ${paymentLinkData.status}`
      );
    }

    /*
     * ---------------------------------------------------
     * STEP 3
     * Verify currency.
     * ---------------------------------------------------
     */
    if (
      paymentLinkData.currency !== "INR"
    ) {
      throw new Error(
        "Payment currency is not INR."
      );
    }

    /*
     * ---------------------------------------------------
     * STEP 4
     * Get user ID and plan from Razorpay notes.
     *
     * These notes were created here:
     *
     * notes: {
     *   plan,
     *   user_id: userId,
     *   source: "digital-heroes"
     * }
     * ---------------------------------------------------
     */
    const notes =
      paymentLinkData.notes || {};

    const userId =
      notes.user_id;

    const plan =
      notes.plan;

    const source =
      notes.source;

    if (!userId) {
      throw new Error(
        "User ID was not found in the Razorpay Payment Link."
      );
    }

    if (
      !plan ||
      !["monthly", "yearly"].includes(
        plan
      )
    ) {
      throw new Error(
        "Invalid subscription plan in Razorpay Payment Link."
      );
    }

    /*
     * Make sure this Payment Link was created
     * by our Digital Heroes application.
     */
    if (
      source !== "digital-heroes"
    ) {
      throw new Error(
        "Invalid Payment Link source."
      );
    }

    /*
     * ---------------------------------------------------
     * STEP 5
     * Verify expected amount.
     *
     * Razorpay uses paise:
     *
     * ₹499  = 49900
     * ₹4999 = 499900
     * ---------------------------------------------------
     */
    const expectedAmount =
      plan === "monthly"
        ? 49900
        : 499900;

    if (
      Number(paymentLinkData.amount) !==
      expectedAmount
    ) {
      throw new Error(
        "Payment Link amount does not match the subscription plan."
      );
    }

    /*
     * ---------------------------------------------------
     * STEP 6
     * Make sure the payment ID received from
     * the callback actually belongs to this Payment Link.
     *
     * Razorpay returns captured payments inside
     * the Payment Link's payments array.
     * ---------------------------------------------------
     */
    const payments =
      Array.isArray(
        paymentLinkData.payments
      )
        ? paymentLinkData.payments
        : [];

    const linkedPayment =
      payments.find(
        (payment: any) =>
          payment.id ===
          razorpay_payment_id
      );

    if (!linkedPayment) {
      throw new Error(
        "Payment does not belong to this Payment Link."
      );
    }

    /*
     * ---------------------------------------------------
     * STEP 7
     * Fetch the actual payment directly from Razorpay.
     *
     * This gives us an additional backend verification.
     * ---------------------------------------------------
     */
    const paymentResponse =
      await fetch(
        `https://api.razorpay.com/v1/payments/${razorpay_payment_id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Basic ${auth}`,
          },
        }
      );

    const paymentData =
      await paymentResponse.json();

    if (!paymentResponse.ok) {
      console.error(
        "Razorpay payment verification error:",
        paymentData
      );

      throw new Error(
        paymentData?.error?.description ||
          "Unable to verify Razorpay payment."
      );
    }

    /*
     * Payment must be captured.
     */
    if (
      paymentData.status !== "captured"
    ) {
      throw new Error(
        `Payment is not captured. Current status: ${paymentData.status}`
      );
    }

    /*
     * ---------------------------------------------------
     * STEP 8
     * Verify payment amount again using the
     * actual payment object.
     * ---------------------------------------------------
     */
    if (
      Number(paymentData.amount) !==
      expectedAmount
    ) {
      throw new Error(
        "Actual payment amount does not match the subscription plan."
      );
    }

    /*
     * Verify currency again.
     */
    if (
      paymentData.currency !== "INR"
    ) {
      throw new Error(
        "Actual payment currency is not INR."
      );
    }

    /*
     * ---------------------------------------------------
     * STEP 9
     * Check whether the user already has
     * an active subscription.
     * ---------------------------------------------------
     */
    const {
      data: existingSubscription,
      error: existingSubscriptionError,
    } = await supabaseAdmin
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle();

    if (existingSubscriptionError) {
      console.error(
        "Existing subscription lookup error:",
        existingSubscriptionError
      );

      throw existingSubscriptionError;
    }

    /*
     * If the subscription is already active,
     * don't create another one.
     *
     * This makes the function safer if the user
     * refreshes the success page.
     */
    if (existingSubscription) {
      return new Response(
        JSON.stringify({
          success: true,
          alreadyActive: true,
          message:
            "Subscription is already active.",
          subscription:
            existingSubscription,
          paymentId:
            razorpay_payment_id,
          paymentLinkId:
            razorpay_payment_link_id,
          plan,
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        }
      );
    }

    /*
     * ---------------------------------------------------
     * STEP 10
     * Calculate subscription dates.
     * ---------------------------------------------------
     */
    const now = new Date();

    const endDate =
      new Date(now);

    if (plan === "monthly") {
      endDate.setMonth(
        endDate.getMonth() + 1
      );
    } else {
      endDate.setFullYear(
        endDate.getFullYear() + 1
      );
    }

    /*
     * ---------------------------------------------------
     * STEP 11
     * Create the ACTIVE subscription.
     *
     * THIS is the part that actually changes the
     * subscription status to "active".
     * ---------------------------------------------------
     */
    const {
      data: subscription,
      error: subscriptionError,
    } = await supabaseAdmin
      .from("subscriptions")
      .insert({
        user_id: userId,

        plan: plan,

        amount:
          plan === "monthly"
            ? 499
            : 4999,

        currency: "INR",

        status: "active",

        start_date:
          now.toISOString(),

        renewal_date:
          endDate.toISOString(),

        current_period_start:
          now.toISOString(),

        current_period_end:
          endDate.toISOString(),

        cancel_at_period_end:
          false,
      })
      .select()
      .single();

    if (subscriptionError) {
      console.error(
        "Subscription creation error:",
        subscriptionError
      );

      throw subscriptionError;
    }

    /*
     * ---------------------------------------------------
     * SUCCESS
     * ---------------------------------------------------
     */
    return new Response(
      JSON.stringify({
        success: true,
        message:
          "Payment verified and subscription activated successfully.",

        paymentId:
          razorpay_payment_id,

        paymentLinkId:
          razorpay_payment_link_id,

        referenceId:
          razorpay_payment_link_reference_id ||
          paymentLinkData.reference_id ||
          null,

        userId,

        plan,

        amount:
          paymentData.amount,

        currency:
          paymentData.currency,

        subscription,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json",
        },
      }
    );
  } catch (error) {
    console.error(
      "Verify Razorpay payment error:",
      error
    );

    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Payment verification failed.",
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json",
        },
      }
    );
  }
});