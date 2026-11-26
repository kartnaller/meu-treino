// Guarda os arquivos do app para abrir sem internet na academia. Suba o número da versão a cada atualização.
const CACHE = "meutreino-v4";
const FILES = ["./", "index.html", "estilo.css", "corpo.js", "programa-inicial.js", "app.js", "manifest.webmanifest", "icone-192.png", "icone-512.png", "icone-180.png", "inter.woff2"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (u.origin !== location.origin) return; // vídeos e miniaturas do YouTube vão direto para a rede
  // rede primeiro (pega atualizações), cache se estiver sem internet
  e.respondWith(fetch(e.request, { cache: "no-cache" }).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); return r; }).catch(() => caches.match(e.request, { ignoreSearch: true })));
});
