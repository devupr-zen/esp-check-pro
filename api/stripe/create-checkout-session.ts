import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const {
      priceId,
      mode = "subscription",
      successUrl,
      cancelUrl,
      customerEmail,
      metadata,
    } = (req.body ?? {}) as {
      priceId?: string;
      mode?: "subscription" | "payment";
      successUrl?: string;
      cancelUrl?: string;
      customerEmail?: string;
      metadata?: Record<string, string>;
    };

    const baseUrl = process.env.SITE_URL || `https://${req.headers.host}`;
    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [{ price: priceId || process.env.STRIPE_PRICE_ID!, quantity: 1 }],
      success_url: successUrl || `${baseUrl}/teacher/billing?status=success`,
      cancel_url: cancelUrl || `${baseUrl}/teacher/billing?status=cancel`,
      customer_email: customerEmail,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      metadata,
    });

    return res.status(200).json({ ok: true, url: session.url, id: session.id });
  } catch (e: any) {
    console.error("[stripe] create-checkout-session error", e);
    return res.status(500).json({ ok: false, error: e?.message || "Stripe error" });
  }
}
