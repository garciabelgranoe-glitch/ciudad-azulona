// Edge Function: reconoce una carta Pokémon a partir de una foto (Ximilar
// Collectibles Recognition) para autocompletar el formulario de
// publicación. A diferencia de notify-claim, la invoca el frontend
// directo (supabase.functions.invoke), así que valida el usuario logueado
// y aplica rate limit acá mismo.

import { createClient } from "npm:@supabase/supabase-js@2";

const XIMILAR_API_TOKEN = Deno.env.get("XIMILAR_API_TOKEN");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

Deno.serve(async (req) => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return new Response("Unauthorized", { status: 401 });
  if (!XIMILAR_API_TOKEN) return new Response("Missing XIMILAR_API_TOKEN", { status: 500 });

  const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { error: rlError } = await supabase.rpc("check_rate_limit", {
    p_action: "scan_card",
    p_max_count: 15,
    p_window: "1 hour",
  });
  if (rlError) return new Response(rlError.message, { status: 429 });

  const { image_base64 } = await req.json();
  if (!image_base64) return new Response("Missing image_base64", { status: 400 });

  const res = await fetch("https://api.ximilar.com/collectibles/v2/tcg_id", {
    method: "POST",
    headers: {
      Authorization: `Token ${XIMILAR_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ records: [{ _base64: image_base64 }] }),
  });
  if (!res.ok) {
    const text = await res.text();
    return new Response(text, { status: 502 });
  }

  const json = await res.json();
  const record = json?.records?.[0];
  const best = record?._identification?.best_match ?? record?._identification?.alternatives?.[0] ?? record;

  if (!best?.name) {
    return new Response(JSON.stringify({ ok: false }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({
      ok: true,
      fields: {
        name: best.name ?? null,
        setName: best.set ?? null,
        cardNumber: best.card_number ?? null,
        year: best.year ?? null,
        rarity: best.rarity ?? null,
      },
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});
