var CACHE_VERSION = 'v11.100';
var CACHE_FILES = [
  '/images/icon.png',
  '/images/avatar.png',
  '/images/logo.png'
];
function getEndpoint() {
  return self.registration.pushManager.getSubscription().then(function(subscription) {
    if (subscription) {
      return subscription;
    }
    throw new Error('User not subscribed');
  });
}
self.addEventListener('install', function(event) {
  event.waitUntil(caches.open(CACHE_VERSION).then(function(cache) {
    console.log("Install server worker...", CACHE_VERSION);
    return cache.addAll(CACHE_FILES);
  }));
});

self.addEventListener('fetch', function(event) {
  event.respondWith(caches.match(event.request).then(function(response) {
    if (response) {
      return response;
    } else {
      return fetch(event.request);
    }

  }))
});
self.addEventListener('activate', function(event) {
  event.waitUntil(caches.keys().then(function(cacheNames) {
    return Promise.all(cacheNames.filter(function(cacheName) {
      return cacheName != CACHE_VERSION;
    }).map(function(cacheName) {
      console.log("delete old cache", cacheName);
      return caches.delete(cacheName);
    }));
  }));
});
self.addEventListener('push', function() {
  getEndpoint().then(function(endpoint) {
    return fetch('https://flexbiz.app:9999/public/payload?ep=' + JSON.stringify(endpoint));
  }).then(function(res) {
    return res.text();
  }).then(function(payload) {
    var _ids = {};
    var payloads = JSON.parse(payload);
    payloads.forEach(function(pl) {
      var data = JSON.parse(pl.payload);
      if (data._id) {
        if (_ids[data._id])
          return;
        _ids[data._id] = true;
      }
      //url
      if (data.action) {
        data.action = data.action.toLowerCase();
        if (data.action == 'update' || data.action == 'new') {
          data.action = "edit";
        }
      } else {
        data.action = 'edit';
      }
      if (data.code) {
        //create url
        data.url = "/t/" + data.code.toLowerCase();
        if (data.obj_id) {
          data.url = data.url + "?_id=" + data.obj_id;
        }
      } else {
        data.url = "/";
      }
      //title
      var title = data.title;
      if (!title) {
        title = "Fos Retail";
      }
      //body
      var body = data.body;
      var notificationOptions = {
        body: body,
        icon: '/images/icon.png',
        vibrate: [
          200,
          100,
          200,
          100,
          200,
          100,
          200
        ],
        data: data
      };
      //show
      self.registration.showNotification(title, notificationOptions)
    })
  })
});
self.addEventListener('notificationclick', function(event) {
  if (!event.notification.data) {
    event.notification.data = {};
  }
  var url = event.notification.data.url ||"/";
  event.notification.close();
  // This looks to see if the current is already open and
  // focuses if it is
  event.waitUntil(clients.matchAll({type: "window"}).then(function() {
    if (clients.openWindow)
      return clients.openWindow(url);
    }
  ));
});
