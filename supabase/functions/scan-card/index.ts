// Edge Function: reconoce una carta Pokémon a partir de una foto (Gemini,
// vía prompt de identificación con salida JSON estructurada) para
// autocompletar el formulario de publicación. A diferencia de
// notify-claim, la invoca el frontend directo (supabase.functions.invoke),
// así que valida el usuario logueado, aplica rate limit acá mismo, y
// necesita manejar CORS (es la primera función de este proyecto llamada
// desde el navegador en vez de server-to-server — notify-claim la dispara
// Postgres vía pg_net y nunca pasa por acá).
//
// Se eligió Gemini en vez de un clasificador de cartas dedicado (Ximilar)
// porque su reconocimiento específico de coleccionables está bloqueado en
// el plan Free de Ximilar (solo "AI Card Grading" está incluido gratis) —
// Gemini sí tiene capa gratuita real para esto y es mucho más barato en
// plan pago. La contra: es un modelo general, no un clasificador
// entrenado contra una base de cartas exacta, así que puede errar más en
// fotos difíciles — por eso el frontend nunca pisa datos ya cargados a
// mano y siempre pide revisar antes de publicar.

import { createClient } from "npm:@supabase/supabase-js@2";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

const GEMINI_MODEL = "gemini-3.6-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const PROMPT = `Identificá esta carta de Pokémon TCG a partir de la foto.

Para "name" y "cardNumber": solo completalos si podés leerlos o identificarlos con confianza (no inventes un nombre o número que no existe).

Para "setName", "year", "rarity" e "language": dale prioridad a dar tu mejor estimación en vez de dejarlos en null. Podés combinar lo que ves en la imagen (símbolo de rareza en la esquina inferior de la carta, idioma del texto impreso, diseño/época del layout) con tu conocimiento general del catálogo oficial de cartas Pokémon TCG — por ejemplo, si reconocés el nombre y número de la carta, normalmente podés inferir de qué set/expansión y año es aunque el logo del set no se lea perfecto en la foto. Dejalos en null solo si genuinely no tenés ninguna pista.

"rarity" tiene que ser exactamente uno de estos códigos (no un texto libre): "comun" (símbolo círculo), "poco_comun" (símbolo diamante), "rara" (símbolo estrella), "rara_doble" (rara/holo/ultra rara con doble estrella o tratamiento especial), "promo" (carta promocional). Si no podés determinarlo, null.

"language" tiene que ser exactamente uno de: "es" (texto en español), "en" (texto en inglés), "jp" (texto en japonés), "otro" (cualquier otro idioma). Si no podés determinarlo, null.`;

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
  if (!GEMINI_API_KEY) return text("Missing GEMINI_API_KEY", 500);

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

  // El cliente manda un data URL completo ("data:image/jpeg;base64,...");
  // Gemini quiere solo la parte base64.
  const match = /^data:(image\/[a-zA-Z+]+);base64,(.+)$/.exec(image_base64);
  const mimeType = match?.[1] ?? "image/jpeg";
  const data = match?.[2] ?? image_base64;

  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: {
      "x-goog-api-key": GEMINI_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: PROMPT }, { inline_data: { mime_type: mimeType, data } }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            name: { type: "STRING", nullable: true },
            setName: { type: "STRING", nullable: true },
            cardNumber: { type: "STRING", nullable: true },
            year: { type: "INTEGER", nullable: true },
            rarity: { type: "STRING", nullable: true, enum: ["comun", "poco_comun", "rara", "rara_doble", "promo"] },
            language: { type: "STRING", nullable: true, enum: ["es", "en", "jp", "otro"] },
          },
        },
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    return text(errText, 502);
  }

  const result = await res.json();
  const textOut = result?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textOut) return json({ ok: false });

  let fields;
  try {
    fields = JSON.parse(textOut);
  } catch {
    return json({ ok: false });
  }

  if (!fields?.name) return json({ ok: false });

  return json({
    ok: true,
    fields: {
      name: fields.name ?? null,
      setName: fields.setName ?? null,
      cardNumber: fields.cardNumber ?? null,
      year: fields.year ?? null,
      rarity: fields.rarity ?? null,
      language: fields.language ?? null,
    },
  });
});
