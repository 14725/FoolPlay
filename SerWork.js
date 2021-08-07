var CACHE = "cache-first";
self.addEventListener("install", function(evt){
    self.skipWaiting();
});

self.addEventListener("fetch", function(evt){
	evt.respondWith(cacheThenNetwork(evt.request));
    evt.waitUntil(update(evt.request));

});

function cacheThenNetwork(request){
	return caches.open(CACHE).then(function (cache) {
		return cache.match(request).then(function (matching) {
			return matching || fetch(request);
		});
	});
}

function update(request) {
  return caches.open(CACHE).then(function (cache) {
    return fetch(request).then(function (response) {
      return cache.put(request, response);
    });
  });
}