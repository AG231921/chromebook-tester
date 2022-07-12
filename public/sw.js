var static_cache = "precache-v1.0.815";

var static_urls = [
  "/",
  "/iframe",
  "/script.js",
  "/style.css",
  "/default.js",
  "/default.css",
  "/manifest.json",
];
//update 1.0.504

self.addEventListener("message", function (event) {
  if (event.data.action == "skipWaiting") {
    self.skipWaiting();
  }
});

//clients.claim();
/*self.addEventListener("install", function (event) {
  //self.skipWaiting();
  console.log("[Service Worker] Install");
  event.waitUntil(
    caches.open(static_cache).then(function (cache) {
      console.log("Opened cache");
      return cache.addAll(static_urls);
    })
  );
});*/

/*
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches
      .open(static_cache)
      .then(async function (cache) {
        static_urls.forEach(async function (url) {
          console.log(url);
          var fetchPromise = await fetch(url, {
            headers: { pragma: "no-cache", "cache-control": "no-store" },
          }).then(async function (networkResponse) {
            if (networkResponse.ok) {
              await cache.put(event.request, networkResponse.clone());
            }
          });
        });
      })
      .then(function () {
        self.skipWaiting();
      })
  );
});*/

self.addEventListener("install", function (event) {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(static_cache);
      // Setting {cache: 'reload'} in the new request will ensure that the
      // response isn't fulfilled from the HTTP cache; i.e., it will be from
      // the network.
      static_urls.forEach(async function (url) {
        await cache.add(new Request(url, { cache: "reload" }));
      });
    })()
  );
  // Force the waiting service worker to become the active service worker.
  self.skipWaiting();
});

/*self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(static_cache));
});*/

/*self.addEventListener("fetch", function (event) {
  // console.log(event.request.url);

  event.respondWith(
    fetch(event.request).catch(function () {
      return caches.match(event.request);
    })
  );
});*/

// Establish a cache name

/*self.addEventListener('fetch', (event) => {
  // Check if this is a request for an image
    event.respondWith(caches.open(static_cache).then((cache) => {
      // Go to the cache first
      return cache.match(event.request.url).then((cachedResponse) => {
        // Return a cached response if we have one
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise, hit the network
        return fetch(event.request).then((fetchedResponse) => {
          // Add the network response to the cache for later visits
          //cache.put(event.request, fetchedResponse.clone());

          // Return the network response
          return fetchedResponse;
        });
      });
    }));
  
});*/

/*self.addEventListener('fetch', (event) => {
  if (event.request.destination === 'image') {
    event.respondWith(caches.open(static_cache).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchedResponse = fetch(event.request).then((networkResponse) => {
          cache.put(event.request, networkResponse.clone());

          return networkResponse;
        });

        return cachedResponse || fetchedResponse;
      });
    }));
  } else {
    return;
  }
});*/

self.addEventListener("fetch", function (event) {
  //console.log(event.request);
  event.respondWith(
    caches.open(static_cache).then(function (cache) {
      return cache.match(event.request).then(async function (response) {
        // Setting {cache: 'reload'} in the new request will ensure that the
        // response isn't fulfilled from the HTTP cache; i.e., it will be from
        // the network.
        var fetchPromise = await fetch(event.request, {
          headers: {
            pragma: "no-cache",
            "cache-control": "no-store",
            mode: "cors",
          },
        }).then(async function (networkResponse) {
          //console.log("network response: " + JSON.stringify(networkResponse));
          return networkResponse;
        });

        if (event.request.method == "GET") {
          if (
            event.request.url.startsWith(
              "https://phone.ja-corp.ga/socket.io/?EIO"
            ) !== true
          ) {
            console.log("not allowed v1");
          } else if (event.request.url !== "https://phone.ja-corp.ga/turn") {
            console.log("not allowed v2");
          } else {
            await cache.add(
              new Request(event.request.url, { cache: "reload" })
            );
          }
        }

        return response || fetchPromise;
      });
    })
  );
});

/*self.addEventListener("fetch", function (event) {
  //console.log(event.request);
  event.respondWith(
    caches.open(static_cache).then(function (cache) {
      return cache.match(event.request).then(async function (response) {
        var fetchPromise = await fetch(event.request, {
          headers: { pragma: "no-cache", "cache-control": "no-store" },
        }).then(async function (networkResponse) {
          //console.log("network response: " + JSON.stringify(networkResponse));

          if (event.request.method == "GET") {
            if (
              event.request.url.startsWith(
                "https://video.ja-corp.ga/socket.io/?EIO"
              ) !== true
            ) {
              console.log("not allowed v1");
            } else if (event.request.url !== "https://video.ja-corp.ga/turn") {
              console.log("not allowed v2");
            } else {
              await cache.put(event.request, networkResponse.clone());
            }
          }
          return networkResponse;
        });
        return response || fetchPromise;
      });
    })
  );
});*/

/*self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      cacheNames.forEach(function (cacheName) {
        return caches.delete(cacheName);
      });
    })
  );
});*/

/*self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function (cacheName) {
            // Return true if you want to remove this cache,
            // but remember that caches are shared across
            // the whole origin
            return true;
          })
          .map(function (cacheName) {
            return caches.delete(cacheName);
          })
      );
    })
  );
});*/

// working -----

self.addEventListener("activate", function (event) {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then(function (cacheNames) {
        return Promise.all(
          cacheNames
            .filter(function (cacheName) {
              return (
                cacheName.startsWith("precache-") && static_cache != cacheName
              );
            })
            .map(function (cacheName) {
              return caches.delete(cacheName);
            })
        );
      }),
    ])
  );
});

self.addEventListener("notificationclick", function (event) {
  console.log("On notification click: ", event.notification.tag);
  event.notification.close();
  var update = new BroadcastChannel("update");
  var channel = new BroadcastChannel("sw-messages");
  var close = new BroadcastChannel("close-notifications");
  var notification = event.notification;
  var reply = event.reply;
  if (event.action === "reply") {
    channel.postMessage({ msg: reply });
    //var message = self.location.origin.href + "?project=" + data;
    //event.request.url;
    //client.navigate("/?project=" + data);
    //client.url == "/?project=" + data;
  } else if (event.action === "close") {
    close.postMessage({ notify: "close all notifications" });
  } else if (event.action === "delete") {
    notification.close();
  } else if (event.action === "update") {
    update.postMessage({ action: "skip" });
    console.log("Updating");
  } else {
    var homepage = "https://video.ja-corp.ga/";
    const urlToOpen = new URL(homepage, self.location.origin).href;
    const promiseChain = clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((windowClients) => {
        let matchingClient = null;

        for (let i = 0; i < windowClients.length; i++) {
          const windowClient = windowClients[i];
          if (windowClient.url === urlToOpen) {
            matchingClient = windowClient;
            break;
          }
        }
        if (matchingClient) {
          return matchingClient.focus();
          notification.close();
        } else {
          return clients.openWindow(urlToOpen);
          notification.close();
        }
      });
    event.waitUntil(promiseChain);
  }
});

self.addEventListener("push", function (event) {
  let data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
    })
  );
});

self.addEventListener("pushsubscriptionchange", function (event) {
  console.log("Subscription expired");
  event.waitUntil(
    self.registration.pushManager
      .subscribe({ userVisibleOnly: true })
      .then(function (subscription) {
        console.log("Subscribed after expiration", subscription.endpoint);
        return fetch("/register", {
          method: "post",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
          }),
        });
      })
  );
});
