// Edge Function: reconoce una carta Pokémon a partir de una foto (Ximilar
// Collectibles Recognition) para autocompletar el formulario de
// publicación. A diferencia de notify-claim, la invoca el frontend
// directo (supabase.functions.invoke), así que valida el usuario logueado,
// aplica rate limit acá mismo, y necesita manejar CORS (es la primera
// función de este proyecto llamada desde el navegador en vez de server-to-
// server, notify-claim la dispara Postgres vía pg_net y nunca pasa por acá).

import { createClient } from "npm:@supabase/supabase-js@2";

const XIMILAR_API_TOKEN = Deno.env.get("XIMILAR_API_TOKEN");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function text(body: string, status = 200) {
  return new Response(body, { status, headers: corsHeaders });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return text("Unauthorized", 401);
  if (!XIMILAR_API_TOKEN) return text("Missing XIMILAR_API_TOKEN", 500);

  const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return text("Unauthorized", 401);

  const { error: rlError } = await supabase.rpc("check_rate_limit", {
    p_action: "scan_card",
    p_max_count: 15,
    p_window: "1 hour",
  });
  if (rlError) return text(rlError.message, 429);

  const { image_base64 } = await req.json();
  if (!image_base64) return text("Missing image_base64", 400);

  const res = await fetch("https://api.ximilar.com/collectibles/v2/tcg_id", {
    method: "POST",
    headers: {
      Authorization: `Token ${XIMILAR_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ records: [{ _base64: image_base64 }] }),
  });
  if (!res.ok) {
    const errText = await res.text();
    return text(errText, 502);
  }

  const result = await res.json();
  const record = result?.records?.[0];
  const best = record?._identification?.best_match ?? record?._identification?.alternatives?.[0] ?? record;

  if (!best?.name) {
    return json({ ok: false });
  }

  return json({
    ok: true,
    fields: {
      name: best.name ?? null,
      setName: best.set ?? null,
      cardNumber: best.card_number ?? null,
      year: best.year ?? null,
      rarity: best.rarity ?? null,
    },
  });
});
