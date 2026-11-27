// Bump VERSION whenever you change cached files to force an update.
var VERSION = "v4", CACHE = "checkin-" + VERSION;
var FILES = ["./", "index.html", "form.config.json", "manifest.webmanifest", "icon-192.png", "icon-512.png"];

self.addEventListener("install", function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(FILES); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
// Network first (so config edits show up), cache fallback when offline.
self.addEventListener("fetch", function(e){
  var r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== location.origin) return;
  e.respondWith(fetch(r).then(function(res){
    var copy = res.clone(); caches.open(CACHE).then(function(c){ c.put(r, copy); }); return res;
  }).catch(function(){ return caches.match(r).then(function(m){ return m || caches.match("index.html"); }); }));
});
