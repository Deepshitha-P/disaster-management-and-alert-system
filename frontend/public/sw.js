import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, NetworkFirst } from 'workbox-strategies';

precacheAndRoute(self.__WB_MANIFEST || []);

registerRoute(
  ({url}) => url.origin.includes('googleapis.com') || url.origin.includes('gstatic.com'),
  new StaleWhileRevalidate()
);

registerRoute(
  ({request}) => request.mode === 'navigate',
  new NetworkFirst({ cacheName: 'pages' })
);

registerRoute(
  ({url, request}) => url.pathname.startsWith('/api/') && request.method==='GET',
  new StaleWhileRevalidate({ cacheName: 'api-get' })
);
