// Backend del formulario de contacto — Cloudflare Pages Function.
//
// POR QUÉ EXISTE: antes el formulario solo armaba un enlace `mailto:` y abría el
// cliente de correo del visitante. Si el navegador no tenía correo configurado
// (caso común en celular), el lead se perdía en silencio y la página igual decía
// "¡gracias!". Además el consentimiento de SMS solo quedaba en el localStorage
// del visitante — o sea, sin ninguna evidencia del lado de AlphaCore si Twilio
// llegara a auditar la campaña A2P.
//
// Ahora el envío llega al servidor, el correo sale por Resend y el consentimiento
// queda registrado con fecha, IP y el texto exacto que la persona aceptó.
//
// CONFIGURACIÓN REQUERIDA en Cloudflare Pages → Settings → Environment variables:
//   RESEND_API_KEY   (obligatoria)  — la misma cuenta de Resend que ya se usa
//   CONTACT_TO       (opcional)     — destino; por defecto el correo de AlphaCore
//   CONTACT_FROM     (opcional)     — remitente verificado en Resend
//
// Si RESEND_API_KEY no está, la función responde 503 y el formulario del sitio
// cae de vuelta al `mailto:` de siempre — nunca queda peor que antes.

const DEFAULT_TO = 'alphacoresolution1@gmail.com';
const DEFAULT_FROM = 'AlphaCore Web <notificaciones@alphacoresolutions.co>';

// Texto exacto del checkbox publicado en el sitio. Se guarda literal en el
// correo: si el TCR pide evidencia de a qué consintió la persona, esto es lo
// que vio y aceptó, no un resumen nuestro.
const CONSENT_TEXT =
  'I agree to receive transactional SMS messages from AlphaCore Solutions at the ' +
  'phone number provided (optional). Consent is not a condition of purchase. ' +
  'Message and data rates may apply. Reply STOP to opt out, HELP for help.';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'invalid_json' }, 400);
  }

  const name = String(body.name || '').trim().slice(0, 120);
  const contact = String(body.contact || '').trim().slice(0, 160);
  const biz = String(body.business || '').trim().slice(0, 160);
  const message = String(body.message || '').trim().slice(0, 4000);
  const smsConsent = body.smsConsent === true;
  const honey = String(body.honey || '').trim();

  // Trampa anti-bot: el campo va oculto, una persona nunca lo llena.
  // Respondemos ok para no darle al bot ninguna señal de que fue detectado.
  if (honey) return json({ ok: true });

  // Misma validación que hace el navegador, repetida aquí: la del cliente se
  // puede saltar mandando el POST directo.
  if (!name) return json({ ok: false, error: 'name_required' }, 400);
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
  const isPhone = contact.replace(/\D/g, '').length >= 10;
  if (!isEmail && !isPhone) return json({ ok: false, error: 'contact_invalid' }, 400);

  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) {
    // Sin la variable configurada no podemos mandar nada: que el sitio use su
    // camino viejo en vez de fingir que se envió.
    return json({ ok: false, error: 'email_not_configured' }, 503);
  }

  const ip = request.headers.get('CF-Connecting-IP') || 'desconocida';
  const country = request.headers.get('CF-IPCountry') || '';
  const when = new Date().toISOString();

  // Registro de consentimiento: fecha, IP y el texto literal aceptado.
  const consentBlock = smsConsent
    ? `SÍ — aceptado el ${when} desde la IP ${ip}${country ? ` (${country})` : ''}\nTexto aceptado: "${CONSENT_TEXT}"`
    : 'NO — la persona no marcó la casilla de SMS';

  const text =
    `Nuevo contacto desde alphacoresolutions.co\n\n` +
    `Nombre:   ${name}\n` +
    `Contacto: ${contact}\n` +
    `Negocio:  ${biz || 'N/D'}\n` +
    `Fecha:    ${when}\n` +
    `IP:       ${ip}${country ? ` (${country})` : ''}\n\n` +
    `--- Consentimiento SMS ---\n${consentBlock}\n\n` +
    `--- Mensaje ---\n${message || '(sin mensaje)'}\n`;

  const html =
    `<h2 style="margin:0 0 12px">Nuevo contacto desde alphacoresolutions.co</h2>` +
    `<table cellpadding="6" style="border-collapse:collapse;font-family:system-ui,sans-serif;font-size:14px">` +
    `<tr><td><b>Nombre</b></td><td>${esc(name)}</td></tr>` +
    `<tr><td><b>Contacto</b></td><td>${esc(contact)}</td></tr>` +
    `<tr><td><b>Negocio</b></td><td>${esc(biz) || 'N/D'}</td></tr>` +
    `<tr><td><b>Fecha</b></td><td>${esc(when)}</td></tr>` +
    `<tr><td><b>IP</b></td><td>${esc(ip)}${country ? ` (${esc(country)})` : ''}</td></tr>` +
    `</table>` +
    `<h3 style="margin:18px 0 6px">Consentimiento SMS</h3>` +
    `<pre style="white-space:pre-wrap;font-family:system-ui,sans-serif;font-size:13px;background:#f6f8fa;padding:10px;border-radius:6px">${esc(consentBlock)}</pre>` +
    `<h3 style="margin:18px 0 6px">Mensaje</h3>` +
    `<pre style="white-space:pre-wrap;font-family:system-ui,sans-serif;font-size:14px">${esc(message || '(sin mensaje)')}</pre>`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.CONTACT_FROM || DEFAULT_FROM,
        to: [env.CONTACT_TO || DEFAULT_TO],
        subject: `Nuevo contacto: ${name}${biz ? ` — ${biz}` : ''}`,
        text,
        html,
        ...(isEmail ? { reply_to: contact } : {}),
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error('[contact] Resend respondió', res.status, detail.slice(0, 300));
      return json({ ok: false, error: 'send_failed' }, 502);
    }
  } catch (err) {
    console.error('[contact] Error de red al mandar el correo:', err.message);
    return json({ ok: false, error: 'send_failed' }, 502);
  }

  return json({ ok: true, consentRecorded: smsConsent, at: when });
}

// Cloudflare enruta POST a onRequestPost; esto atiende cualquier otro método.
export async function onRequest() {
  return json({ ok: false, error: 'method_not_allowed' }, 405);
}
