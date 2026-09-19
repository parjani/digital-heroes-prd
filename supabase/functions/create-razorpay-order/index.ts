import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle browser preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    const { plan } = await req.json();

    // Decide the amount on the server.
    // Razorpay uses paise, not rupees.
    let amount: number;

    if (plan === "monthly") {
      amount = 49900; // ₹499
    } else if (plan === "yearly") {
      amount = 499900; // ₹4,999
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

    // These values will be stored securely in Supabase Edge Function secrets.
    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!keyId || !keySecret) {
      throw new Error("Razorpay credentials are not configured.");
    }

    // Razorpay API authentication
    const auth = btoa(`${keyId}:${keySecret}`);

    // Create Razorpay order
    const razorpayResponse = await fetch(
      "https://api.razorpay.com/v1/orders",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify({
          amount,
          currency: "INR",
          receipt: `dh_${Date.now()}`,
          notes: {
            plan,
            source: "digital-heroes",
          },
        }),
      }
    );

    const razorpayData = await razorpayResponse.json();

    if (!razorpayResponse.ok) {
      console.error("Razorpay error:", razorpayData);

      return new Response(
        JSON.stringify({
          error:
            razorpayData?.error?.description ||
            "Unable to create Razorpay order.",
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

    // Send only safe information back to React.
    // NEVER send the Razorpay secret to the frontend.
    return new Response(
      JSON.stringify({
        orderId: razorpayData.id,
        amount: razorpayData.amount,
        currency: razorpayData.currency,
        keyId,
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
    console.error("Create Razorpay order error:", error);

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