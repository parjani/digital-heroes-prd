import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/*
 * Convert bytes to hexadecimal string.
 */
function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((byte) =>
      byte.toString(16).padStart(2, "0")
    )
    .join("");
}

/*
 * Generate Razorpay Payment Link callback signature.
 *
 * Razorpay signature payload:
 *
 * payment_link_id
 * |
 * payment_link_reference_id
 * |
 * payment_link_status
 * |
 * payment_id
 *
 * HMAC SHA256 using Razorpay Key Secret.
 */
async function generatePaymentLinkSignature(
  paymentLinkId: string,
  paymentLinkReferenceId: string,
  paymentLinkStatus: string,
  paymentId: string,
  secret: string
) {
  const payload =
    `${paymentLinkId}|${paymentLinkReferenceId}|${paymentLinkStatus}|${paymentId}`;

  const encoder =
    new TextEncoder();

  const keyData =
    encoder.encode(secret);

  const messageData =
    encoder.encode(payload);

  const cryptoKey =
    await crypto.subtle.importKey(
      "raw",
      keyData,
      {
        name: "HMAC",
        hash: "SHA-256",
      },
      false,
      ["sign"]
    );

  const signature =
    await crypto.subtle.sign(
      "HMAC",
      cryptoKey,
      messageData
    );

  return bytesToHex(
    new Uint8Array(signature)
  );
}

/*
 * Compare signatures safely.
 */
function signaturesMatch(
  actual: string,
  expected: string
) {
  if (
    actual.length !==
    expected.length
  ) {
    return false;
  }

  let result = 0;

  for (
    let i = 0;
    i < actual.length;
    i++
  ) {
    result |=
      actual.charCodeAt(i) ^
      expected.charCodeAt(i);
  }

  return result === 0;
}

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
          "Content-Type":
            "application/json",
        },
      }
    );
  }

  try {
    /*
     * ---------------------------------------------------
     * STEP 1
     * Get Razorpay callback data.
     * ---------------------------------------------------
     */
    const {
      razorpay_payment_id,
      razorpay_payment_link_id,
      razorpay_payment_link_reference_id,
      razorpay_payment_link_status,
      razorpay_signature,
    } = await req.json();

    /*
     * ---------------------------------------------------
     * STEP 2
     * Validate required callback parameters.
     * ---------------------------------------------------
     */

    if (!razorpay_payment_id) {
      throw new Error(
        "Razorpay payment ID is missing."
      );
    }

    if (!razorpay_payment_link_id) {
      throw new Error(
        "Razorpay payment link ID is missing."
      );
    }

    if (
      !razorpay_payment_link_reference_id
    ) {
      throw new Error(
        "Razorpay payment link reference ID is missing."
      );
    }

    if (!razorpay_payment_link_status) {
      throw new Error(
        "Razorpay payment link status is missing."
      );
    }

    if (!razorpay_signature) {
      throw new Error(
        "Razorpay signature is missing."
      );
    }

    /*
     * ---------------------------------------------------
     * STEP 3
     * Get Razorpay credentials.
     *
     * These MUST remain in Supabase secrets.
     * ---------------------------------------------------
     */
    const keyId =
      Deno.env.get(
        "RAZORPAY_KEY_ID"
      );

    const keySecret =
      Deno.env.get(
        "RAZORPAY_KEY_SECRET"
      );

    if (!keyId || !keySecret) {
      throw new Error(
        "Razorpay credentials are not configured."
      );
    }

    /*
     * ---------------------------------------------------
     * STEP 4
     * Verify Razorpay callback signature.
     *
     * This is extremely important.
     *
     * We do NOT trust the payment information simply
     * because it came through the browser URL.
     * ---------------------------------------------------
     */
    const expectedSignature =
      await generatePaymentLinkSignature(
        razorpay_payment_link_id,
        razorpay_payment_link_reference_id,
        razorpay_payment_link_status,
        razorpay_payment_id,
        keySecret
      );

    const signatureIsValid =
      signaturesMatch(
        razorpay_signature,
        expectedSignature
      );

    if (!signatureIsValid) {
      throw new Error(
        "Invalid Razorpay payment signature."
      );
    }

    /*
     * Signature is valid.
     */
    console.log(
      "Razorpay payment signature verified."
    );

    /*
     * ---------------------------------------------------
     * STEP 5
     * Create Supabase admin client.
     * ---------------------------------------------------
     */
    const supabaseUrl =
      Deno.env.get(
        "SUPABASE_URL"
      );

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

    const supabaseAdmin =
      createClient(
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
     * ---------------------------------------------------
     * STEP 6
     * Razorpay Basic Authentication.
     * ---------------------------------------------------
     */
    const auth =
      btoa(
        `${keyId}:${keySecret}`
      );

    /*
     * ---------------------------------------------------
     * STEP 7
     * Fetch Payment Link directly from Razorpay.
     * ---------------------------------------------------
     */
    const paymentLinkResponse =
      await fetch(
        `https://api.razorpay.com/v1/payment_links/${razorpay_payment_link_id}`,
        {
          method: "GET",
          headers: {
            Authorization:
              `Basic ${auth}`,
          },
        }
      );

    const paymentLinkData =
      await paymentLinkResponse.json();

    if (
      !paymentLinkResponse.ok
    ) {
      console.error(
        "Razorpay Payment Link error:",
        paymentLinkData
      );

      throw new Error(
        paymentLinkData?.error
          ?.description ||
          "Unable to verify Razorpay Payment Link."
      );
    }

    /*
     * Make sure the returned Payment Link ID
     * matches the callback Payment Link ID.
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
     * STEP 8
     * Verify Payment Link status.
     * ---------------------------------------------------
     */
    if (
      paymentLinkData.status !==
      "paid"
    ) {
      throw new Error(
        `Payment Link is not paid. Current status: ${paymentLinkData.status}`
      );
    }

    /*
     * Also make sure the status that Razorpay
     * signed matches the actual Payment Link status.
     */
    if (
      razorpay_payment_link_status !==
      paymentLinkData.status
    ) {
      throw new Error(
        "Payment Link status does not match Razorpay."
      );
    }

    /*
     * ---------------------------------------------------
     * STEP 9
     * Verify Payment Link currency.
     * ---------------------------------------------------
     */
    if (
      paymentLinkData.currency !==
      "INR"
    ) {
      throw new Error(
        "Payment currency is not INR."
      );
    }

    /*
     * ---------------------------------------------------
     * STEP 10
     * Get application data from Payment Link notes.
     *
     * These values were stored when the Payment Link
     * was created.
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

    /*
     * User ID must exist.
     */
    if (!userId) {
      throw new Error(
        "User ID was not found in the Razorpay Payment Link."
      );
    }

    /*
     * Plan must be monthly or yearly.
     */
    if (
      !plan ||
      ![
        "monthly",
        "yearly",
      ].includes(plan)
    ) {
      throw new Error(
        "Invalid subscription plan in Razorpay Payment Link."
      );
    }

    /*
     * Make sure this Payment Link was created
     * by Digital Heroes.
     */
    if (
      source !==
      "digital-heroes"
    ) {
      throw new Error(
        "Invalid Payment Link source."
      );
    }

    /*
     * ---------------------------------------------------
     * STEP 11
     * Verify expected subscription amount.
     *
     * Razorpay amount is in paise:
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
      Number(
        paymentLinkData.amount
      ) !== expectedAmount
    ) {
      throw new Error(
        "Payment Link amount does not match the subscription plan."
      );
    }

    /*
     * ---------------------------------------------------
     * STEP 12
     * Fetch the actual payment directly from Razorpay.
     * ---------------------------------------------------
     */
    const paymentResponse =
      await fetch(
        `https://api.razorpay.com/v1/payments/${razorpay_payment_id}`,
        {
          method: "GET",
          headers: {
            Authorization:
              `Basic ${auth}`,
          },
        }
      );

    const paymentData =
      await paymentResponse.json();

    if (
      !paymentResponse.ok
    ) {
      console.error(
        "Razorpay payment verification error:",
        paymentData
      );

      throw new Error(
        paymentData?.error
          ?.description ||
          "Unable to verify Razorpay payment."
      );
    }

    /*
     * ---------------------------------------------------
     * STEP 13
     * Payment must be captured.
     * ---------------------------------------------------
     */
    if (
      paymentData.status !==
      "captured"
    ) {
      throw new Error(
        `Payment is not captured. Current status: ${paymentData.status}`
      );
    }

    /*
     * ---------------------------------------------------
     * STEP 14
     * Verify actual payment amount.
     * ---------------------------------------------------
     */
    if (
      Number(
        paymentData.amount
      ) !== expectedAmount
    ) {
      throw new Error(
        "Actual payment amount does not match the subscription plan."
      );
    }

    /*
     * ---------------------------------------------------
     * STEP 15
     * Verify actual payment currency.
     * ---------------------------------------------------
     */
    if (
      paymentData.currency !==
      "INR"
    ) {
      throw new Error(
        "Actual payment currency is not INR."
      );
    }

    /*
     * ---------------------------------------------------
     * STEP 16
     * Check for an existing active subscription.
     * ---------------------------------------------------
     */
    const {
      data: existingSubscription,
      error:
        existingSubscriptionError,
    } = await supabaseAdmin
      .from("subscriptions")
      .select("*")
      .eq(
        "user_id",
        userId
      )
      .eq(
        "status",
        "active"
      )
      .maybeSingle();

    if (
      existingSubscriptionError
    ) {
      console.error(
        "Existing subscription lookup error:",
        existingSubscriptionError
      );

      throw existingSubscriptionError;
    }

    /*
     * If already active, don't create
     * another active subscription.
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
     * STEP 17
     * Calculate subscription dates.
     * ---------------------------------------------------
     */
    const now =
      new Date();

    const endDate =
      new Date(now);

    if (
      plan === "monthly"
    ) {
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
     * STEP 18
     * Create ACTIVE subscription.
     * ---------------------------------------------------
     */
    const {
      data: subscription,
      error:
        subscriptionError,
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

    if (
      subscriptionError
    ) {
      console.error(
        "Subscription creation error:",
        subscriptionError
      );

      throw subscriptionError;
    }

    /*
     * ---------------------------------------------------
     * STEP 19
     * Success response.
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