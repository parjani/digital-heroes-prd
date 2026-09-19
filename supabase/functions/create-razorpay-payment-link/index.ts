import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    const { plan, userId, email } = await req.json();

    let amount: number;

    if (plan === "monthly") {
      amount = 49900;
    } else if (plan === "yearly") {
      amount = 499900;
    } else {
      return new Response(
        JSON.stringify({
          error: "Invalid subscription plan.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!keyId || !keySecret) {
      throw new Error(
        "Razorpay credentials are not configured."
      );
    }

    const auth = btoa(`${keyId}:${keySecret}`);

    // Your Vercel website URL
    const callbackUrl =
      "https://digital-heroes-prd.vercel.app/payment-success";

    const razorpayResponse = await fetch(
      "https://api.razorpay.com/v1/payment_links",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify({
          amount,
          currency: "INR",
          accept_partial: false,

          description:
            plan === "monthly"
              ? "Digital Heroes Monthly Membership"
              : "Digital Heroes Yearly Membership",

          reference_id: `DH_${Date.now()}`,

          customer: {
            email: email || undefined,
          },

          notes: {
            plan,
            user_id: userId,
            source: "digital-heroes",
          },

          callback_url: callbackUrl,
          callback_method: "get",

          reminder_enable: false,
        }),
      }
    );

    const razorpayData =
      await razorpayResponse.json();

    if (!razorpayResponse.ok) {
      console.error(
        "Razorpay Payment Link error:",
        razorpayData
      );

      return new Response(
        JSON.stringify({
          error:
            razorpayData?.error?.description ||
            "Unable to create Razorpay payment link.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        paymentLinkId: razorpayData.id,
        paymentUrl: razorpayData.short_url,
        amount: razorpayData.amount,
        currency: razorpayData.currency,
        plan,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error(
      "Create Razorpay Payment Link error:",
      error
    );

    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong.",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});