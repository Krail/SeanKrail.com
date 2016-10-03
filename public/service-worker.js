/* /public/serviceworker/worker.js */
"use strict";

const CACHE_VERSION = "2.0.0-alpha";
let CURRENT_CACHES = {
  offline: "offline-v" + CACHE_VERSION
};
const OFFLINE_URL = "/";

function createCacheBustedRequest(_url) {
  let request = new Request(_url, { cache: "reload" });
  if("cache" in request) return request;
  let bustedUrl = new URL(_url, self.location.href);
  bustedUrl.search += (bustedUrl.search ? "&" : "") + "cachebust=" + Date.now();
  return new Request(bustedUrl);
}

self.addEventListener("install", (_event) => {
  _event.waitUntil(
    fetch(createCacheBustedRequest(OFFLINE_URL))
      .then((_response) => {
        return caches.open(CURRENT_CACHES.offline).then((_cache) => {
          return _cache.put(OFFLINE_URL, _response);
        });
      })
  );
});

self.addEventListener("activate", (_event) => {
  // Delete old caches (ones not named in CURRENT_CACHES)
  let expectedCacheNames = Object.keys(CURRENT_CACHES).map((_key) => {
    return CURRENT_CACHES[_key];
  });
  _event.waitUntil(
    caches.keys().then((_cacheNames) => {
      return Promise.all(
        _cacheNames.map((_cacheName) => {
          if(expectedCacheNames.indexOf(_cacheName) === -1) {
            // This cache isn't expected to exist, delete it
            console.log("Deleting out of date cache: ", _cacheName);
            return cache.delete(_cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", (_event) => {
  if (_event.request.method === "GET") {
    console.log("Handling fetch event for ", _event.request.url);
    _event.respondWith(
      fetch(_event.request).catch((_error) => {
        console.log("Fetch failed; returning offline page instead.", _error);
        return cache.match(OFFLINE_URL);
      })
    );
  }
  // ignore other http methods
});
