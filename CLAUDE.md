# AlphaCore Web — Contexto para Claude Code

## Quién soy
Soy **Axel Quintana**, dueño de **AlphaCore Solutions** en Minneapolis, Minnesota.
Trabajo contigo (Claude) para construir y mantener mis productos de IA para negocios hispanos.

## Qué es AlphaCore Solutions
Startup de automatización con IA para PYMEs hispanas en Minnesota.
- **URL:** https://alphacoresolutions.co
- **Teléfono:** 612-324-4413
- **Email:** info@alphacoresolutions.co (reenvía a alphacoresolution1@gmail.com via Cloudflare routing)

## Qué es este repo
Sitio web de marketing de AlphaCore Solutions. Presenta VoiceCore y ChatCore, pricing, y contacto.
Es un **bundle compilado** (Svelte, ~1.3MB index.html). No podemos regenerar el bundle.

## REGLA CRÍTICA: Cómo editar el sitio

El `index.html` es un **bundle compilado Svelte**. No tocar el bundle directamente.
Todas las modificaciones se hacen via **script de inyección JS** appended justo antes del `</body>`.

### LO QUE NUNCA SE DEBE HACER
- ❌ Editar el bundle directamente (el archivo es ~1.3MB, DOM virtual de Svelte)
- ❌ Hacer `element.href = '/contact'` en links — el bundle usa href en querySelectorAll y causa SyntaxError
- ❌ Usar `replaceChild`, `removeChild`, o reemplazar nodos DOM
- ❌ Hacer `document.querySelector(element.href)` — esto era el bug original

### LO QUE SÍ FUNCIONA
- ✅ `element.textContent = 'nuevo texto'` — OK
- ✅ `element.addEventListener('click', fn)` — OK (en lugar de cambiar href)
- ✅ `element.style.display = 'none'` — OK
- ✅ `element.innerHTML = '<span>...</span>'` — OK para cambiar contenido interno

### Script de inyección actual (antes de `</body>`)
```javascript
<script>
(function() {
  var btnDone = false;
  var bizDone = false;

  function patchBtns() {
    var found = false;
    document.querySelectorAll('a, button').forEach(function(el) {
      if (el.textContent.trim().includes('Empieza Gratis')) {
        el.textContent = 'Contact';
        el.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          window.location.href = '/contact';
        });
        found = true;
      }
    });
    return found;
  }

  function patchBusiness() {
    var names = document.querySelectorAll('.price-name');
    for (var i = 0; i < names.length; i++) {
      if (names[i].textContent.trim() === 'Business') {
        var card = names[i].closest ? names[i].closest('.price-card') : names[i].parentNode;
        var amt = card.querySelector('.price-amount');
        var strike = card.querySelector('.price-amount-strike');
        if (amt) {
          amt.innerHTML = '<span style="font-size:1.5rem;font-weight:700;color:#06B6D4;letter-spacing:-0.02em;">Contactar</span>';
        }
        if (strike) strike.style.display = 'none';
        return true;
      }
    }
    return false;
  }

  var tries = 0;
  var poll = setInterval(function() {
    tries++;
    if (!btnDone) btnDone = patchBtns();
    if (!bizDone) bizDone = patchBusiness();
    if ((btnDone && bizDone) || tries > 60) clearInterval(poll);
  }, 200);
})();
</script>
```

## Pricing actual
| Plan | Precio mensual | Precio anual |
|------|---------------|--------------|
| Starter | $129/mes | $103/mes |
| Pro | $199/mes | $159/mes |
| Business | Contactar | Contactar |

**Setup fee:** $100 (se menciona en ventas, no en el sitio)

## Deploy
- **Hosting:** Cloudflare Pages (conectado al repo GitHub)
- Cada push a main se deploya automáticamente
- El DNS y routing de email están en Cloudflare

## Archivos clave
- `index.html` — El bundle compilado completo (~1.3MB). Editar SOLO el script de inyección al final.

## Cómo editar con PowerShell (el archivo es muy grande para Read/Edit normal)
```powershell
# Reemplazar texto en el script de inyección:
$content = [System.IO.File]::ReadAllText("C:\Users\alpha\alphacore-web\index.html")
$content = $content.Replace('texto_viejo', 'texto_nuevo')
[System.IO.File]::WriteAllText("C:\Users\alpha\alphacore-web\index.html", $content)
```

## Estado (Junio 2026)
- ✅ Sitio live en https://alphacoresolutions.co
- ✅ Script de inyección aplicado (botones Contact, precio Business removido)
- ⏳ Sitio en español — pendiente versión en inglés
- ⏳ Google Business Profile pendiente verificación postal

## Reglas importantes al trabajar en este repo
- **NUNCA compartir** tokens de GitHub en el chat
- Solo modificar el script de inyección al final del archivo, no el bundle
- Usar PowerShell string replace para ediciones (el archivo es ~1.3MB)
- No usar `el.href = '...'` — causa SyntaxError en el bundle de Svelte
