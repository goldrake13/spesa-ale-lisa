// Service worker: la pagina va prima in rete (offerte fresche) con fallback
// alla cache se offline; icone e manifest sono cache-first.
const CACHE = "spesa-v1";
const ASSETS = ["./", "./index.html", "./icon-180.png", "./icon-512.png", "./manifest.webmanifest"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if(req.method !== "GET") return;
  if(req.mode === "navigate"){
    e.respondWith(
      fetch(req).then(res => {
        const cp = res.clone();
        caches.open(CACHE).then(c => c.put("./index.html", cp));
        return res;
      }).catch(() => caches.match("./index.html"))
    );
  } else {
    e.respondWith(caches.match(req).then(r => r || fetch(req)));
  }
});
