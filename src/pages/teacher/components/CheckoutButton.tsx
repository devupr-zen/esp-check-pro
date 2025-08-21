import { supabase } from "@/integrations/supabase/client";

export default function CheckoutButton({
  priceId,
  label = "Subscribe",
}: { priceId?: string; label?: string }) {
  async function startCheckout() {
    // optional: attach email to session via backend if you want
    const { data: { user } } = await supabase.auth.getUser();

    const r = await fetch("/api/stripe/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        priceId,
        customerEmail: user?.email, // optional, helpful for matching
        metadata: { role: "teacher" },
      }),
    });
    const j = await r.json();
    if (!r.ok || !j?.url) {
      console.error(j);
      alert(j?.error || "Unable to start checkout");
      return;
    }
    window.location.href = j.url;
  }

  return (
    <button
      onClick={startCheckout}
      className="inline-flex items-center rounded-xl bg-primary text-white px-4 py-2 hover:opacity-90"
    >
      {label}
    </button>
  );
}
