// Edge Function: manda un email al vendedor cuando le hacen claim a una
// carta. La invoca un trigger de Postgres (ver migración
// 0040_claim_email_notification.sql) vía pg_net, no el frontend.

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FUNCTION_SECRET = Deno.env.get("FUNCTION_SECRET");
const FROM_EMAIL = Deno.env.get("NOTIFY_FROM_EMAIL") || "Ciudad Azulona <notificaciones@ciudadazulona.com>";

function escapeHtml(str: string) {
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}

function formatPrice(amount: number, currency: string) {
  if (currency === "USD") return `U$S ${Number(amount).toLocaleString("es-AR", { maximumFractionDigits: 2 })}`;
  return Number(amount).toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
}

Deno.serve(async (req) => {
  if (req.headers.get("x-function-secret") !== FUNCTION_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }
  if (!RESEND_API_KEY) {
    return new Response("Missing RESEND_API_KEY", { status: 500 });
  }

  const { sellerEmail, buyerAlias, cardName, price, currency, ticketCode } = await req.json();
  if (!sellerEmail) return new Response("Missing sellerEmail", { status: 400 });

  const priceLabel = formatPrice(price, currency);

  const html = `<!DOCTYPE html>
<html lang="es">
  <body style="margin:0; padding:32px 16px; background-color:#F3ECD9; font-family: Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" style="max-width:420px; margin:0 auto;">
      <tr>
        <td style="text-align:center; padding-bottom:16px;">
          <span style="font-size:12px; letter-spacing:2px; color:#B9862F; font-weight:bold;">CIUDAD AZULONA</span>
        </td>
      </tr>
      <tr>
        <td style="background-color:#FFFFFF; border:2px solid #20291C; border-radius:12px; padding:28px 24px;">
          <p style="margin:0 0 8px; font-size:15px; color:#20291C; font-weight:bold;">¡Te claimearon una carta!</p>
          <p style="margin:0 0 16px; font-size:13px; color:#6b6357; line-height:1.5;">
            <strong>${escapeHtml(buyerAlias)}</strong> se llevó <strong>${escapeHtml(cardName)}</strong> por ${escapeHtml(priceLabel)}.
          </p>
          <div style="font-size:13px; color:#20291C; background-color:#F3ECD9; border-radius:8px; padding:12px 14px; margin:0 0 16px;">
            Código de retiro: <strong style="font-family: 'Courier New', Courier, monospace;">${escapeHtml(ticketCode)}</strong>
          </div>
          <p style="margin:0; font-size:12px; color:#8a8275;">
            Entrá a Ciudad Azulona para ver los datos de contacto de ${escapeHtml(buyerAlias)} y coordinar la entrega.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: sellerEmail,
      subject: `Te claimearon "${cardName}"`,
      html,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    return new Response(text, { status: 502 });
  }

  return new Response("ok", { status: 200 });
});
