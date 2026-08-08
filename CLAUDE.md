# AlphaCore Web — Contexto para Claude Code

> **Verificado contra el código el 8 de agosto de 2026.**
> Si algo aquí no coincide con lo que ves en los archivos, **gana el código** — y
> actualiza este archivo en el mismo commit.

## Quién soy
Soy **Axel Quintana**, dueño de **AlphaCore Solutions** en Minneapolis, Minnesota.
Trabajo contigo (Claude) para construir y mantener mis productos de IA para negocios hispanos.

## Qué es AlphaCore Solutions
Startup de automatización con IA para PYMEs hispanas en Minnesota.
- **URL:** https://alphacoresolutions.co
- **Teléfono:** 612-324-4413
- **Email:** info@alphacoresolutions.co (reenvía a alphacoresolution1@gmail.com vía Cloudflare routing)

## Qué es este repo
El sitio web de marketing. **HTML/CSS/JS plano, sin build.** Se edita directamente
con Read y Edit — no hay bundler, no hay `npm run build`, no hay paso de compilación.

---

## ⚠️ Lo que cambió (no te guíes por sesiones viejas)

Hasta el 13 de julio de 2026 este repo era un **bundle compilado de Svelte** de ~1.3 MB
que no se podía regenerar. Por eso existía una regla de "nunca tocar el bundle, todo
por script de inyección JS al final del archivo".

**Eso ya no aplica.** El sitio se reescribió a mano como HTML plano (el `index.html`
actual trae el marcador `V2 editable (plain HTML/CSS/JS)` en el comentario de su `<style>`).
Ya no hay script de inyección, ni polling con `setInterval`, ni restricciones sobre `element.href`.

Si encuentras instrucciones sobre "el bundle", "el script de inyección" o
"editar con PowerShell porque el archivo es muy grande" — **están obsoletas**.
Edita los archivos normalmente.

---

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | Home completa, ~99 KB. Secciones: productos, servicios, cómo funciona, precios, demo, clientes, FAQ, contacto |
| `acceso.html` | Elegir portal: voz (EchoCore/VoiceCore) o mensajes (ChatCore). `noindex` |
| `contact.html` | Formulario de contacto. **Es la URL de opt-in declarada en la campaña A2P** |
| `terms.html` / `privacy.html` | Legales |
| `functions/api/contact.js` | Cloudflare Pages Function: recibe el formulario y guarda el consentimiento del lado del servidor |
| `_redirects` | `/portal/*` → el portal de voz en Railway |
| `logo.png` | Logo oficial, 870×387 con transparencia |
| `favicon.png` | 180×180, el símbolo triangular sobre navy. Sirve de `icon` y `apple-touch-icon` |
| `og-image.png` | 1200×630, vista previa al compartir el link. Fuente editable en `alphacore-docs/og-image/og-fuente.html` — **si cambias el texto hay que volver a renderizar el PNG**, no basta con editar el HTML |

## Bilingüe
El sitio es ES/EN con un botón. Las traducciones viven en un diccionario JS dentro
de `index.html`; los elementos traducibles llevan `data-i18n="clave"`.
**Si agregas texto visible, agrégalo también al diccionario** o quedará sin traducir.

Nota: `<html lang="en">` — el sitio arranca en inglés aunque el mercado sea bilingüe.
Pendiente decidir si se detecta el idioma del navegador.

## Formulario de contacto
Ambos formularios (home y `contact.html`) hacen `fetch('/api/contact', …)`.
Si el servidor falla, **caen a `mailto:` como respaldo** — no es un bug, es el plan B.

## Pricing actual (verificado en el HTML)
| Plan | Mensual | Anual |
|---|---|---|
| Starter | $129/mes | $103/mes |
| Pro | $199/mes | $159/mes |
| Business | Contactar | Contactar |

- Minutos extra: **$0.25/min**
- Instalación: **$75–$100 según el plan** — sí aparece en el sitio
- Debe coincidir con el catálogo del portal (`plans.js` en el repo `echocore`)

## Deploy
- **Hosting:** Cloudflare Pages, conectado al repo de GitHub
- Cada push a `main` se despliega solo (tarda ~1 min)
- El DNS y el routing de correo también están en Cloudflare
- Para verificar un cambio en vivo, **no basta con esperar un HTTP 200** — hay caché.
  Busca el contenido concreto que cambiaste (un `<title>`, una etiqueta) antes de darlo por bueno.

## Estado
- ✅ Sitio live, las 5 rutas responden
- ✅ Bilingüe ES/EN funcionando
- ✅ Formulario con backend real y registro de consentimiento
- ✅ Vista previa al compartir (Open Graph) y favicon — 8 ago 2026
- ⏳ **Sin analítica.** No hay forma de saber cuánta gente entra.
  Se activa en Cloudflare Pages → el proyecto → Web Analytics (no requiere código)
- ⏳ Sin `sitemap.xml`, `robots.txt` ni datos estructurados JSON-LD
- ❔ Google Business Profile — confirmar si quedó verificado

## Reglas importantes
- **NUNCA compartir** tokens de GitHub ni contenido de archivos `.env` en el chat
- **`contact.html` NO se borra ni se mueve** — es la URL de opt-in declarada en la campaña A2P
- **El texto de consentimiento SMS no se modifica** — está aprobado por el operador
- Sistema multi-cliente: **nunca hardcodear** nombres de negocios
