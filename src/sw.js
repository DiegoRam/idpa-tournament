// Custom service worker for IDPA Tournament App
// This file enhances the next-pwa generated service worker

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

// Precache all assets
precacheAndRoute(self.__WB_MANIFEST);

// Clean up old caches
cleanupOutdatedCaches();

// Skip waiting and claim clients
self.skipWaiting();
self.clients.claim();

// Background sync for offline actions
const offlineSyncQueue = new BackgroundSyncPlugin('offline-sync-queue', {
  maxRetentionTime: 24 * 60, // 24 hours in minutes
  onSync: async ({ queue }) => {
    let entry;
    while ((entry = await queue.shiftRequest())) {
      try {
        // Attempt to replay the request
        const response = await fetch(entry.request);
        
        if (response.ok) {
          console.log('Successfully synced offline action:', entry.request.url);
          
          // Notify all clients about successful sync
          const clients = await self.clients.matchAll();
          clients.forEach(client => {
            client.postMessage({
              type: 'SYNC_SUCCESS',
              url: entry.request.url
            });
          });
        } else {
          // Re-queue failed requests
          await queue.unshiftRequest(entry);
          throw new Error(`Sync failed with status: ${response.status}`);
        }
      } catch (error) {
        console.error('Failed to sync offline action:', error);
        // Re-queue failed requests
        await queue.unshiftRequest(entry);
        throw error;
      }
    }
  }
});

// Register route for Convex API with background sync
registerRoute(
  /^https:\/\/.*\.convex\.cloud\/.*/i,
  new NetworkFirst({
    cacheName: 'convex-api',
    networkTimeoutSeconds: 5,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 5 * 60, // 5 minutes
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      offlineSyncQueue
    ],
  }),
  'POST'
);

// Cache Convex queries with NetworkFirst
registerRoute(
  /^https:\/\/.*\.convex\.cloud\/.*/i,
  new NetworkFirst({
    cacheName: 'convex-queries',
    networkTimeoutSeconds: 3,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 10 * 60, // 10 minutes
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  }),
  'GET'
);

// Cache static assets
registerRoute(
  /\.(?:js|css|woff2?)$/i,
  new StaleWhileRevalidate({
    cacheName: 'static-resources',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// Cache images
registerRoute(
  /\.(?:png|gif|jpg|jpeg|svg|webp)$/i,
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// Cache Google Fonts
registerRoute(
  /^https:\/\/fonts\.googleapis\.com\/.*/i,
  new StaleWhileRevalidate({
    cacheName: 'google-fonts-stylesheets',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 4,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
      }),
    ],
  })
);

registerRoute(
  /^https:\/\/fonts\.gstatic\.com\/.*/i,
  new CacheFirst({
    cacheName: 'google-fonts-webfonts',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 4,
        maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
      }),
    ],
  })
);

// Handle offline pages
registerRoute(
  /^\/.*$/,
  new NetworkFirst({
    cacheName: 'pages',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 24 * 60 * 60, // 1 day
      }),
    ],
  }),
  'GET'
);

// Listen for messages from the client
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'FORCE_SYNC') {
    // Force sync of queued offline actions
    self.registration.sync.register('offline-sync-queue').catch(err => {
      console.error('Failed to register background sync:', err);
    });
  }
  
  if (event.data && event.data.type === 'CACHE_TOURNAMENT_DATA') {
    // Cache tournament data for offline use
    const { tournamentId, data } = event.data;
    cacheTournamentData(tournamentId, data);
  }
});

// Cache tournament data function
async function cacheTournamentData(tournamentId, data) {
  try {
    const cache = await caches.open('tournament-data');
    
    // Cache tournament data as JSON responses
    await cache.put(
      new Request(`/api/tournament/${tournamentId}`),
      new Response(JSON.stringify(data.tournament), {
        headers: { 'Content-Type': 'application/json' }
      })
    );
    
    await cache.put(
      new Request(`/api/tournament/${tournamentId}/squads`),
      new Response(JSON.stringify(data.squads), {
        headers: { 'Content-Type': 'application/json' }
      })
    );
    
    await cache.put(
      new Request(`/api/tournament/${tournamentId}/stages`),
      new Response(JSON.stringify(data.stages), {
        headers: { 'Content-Type': 'application/json' }
      })
    );
    
    await cache.put(
      new Request(`/api/tournament/${tournamentId}/registrations`),
      new Response(JSON.stringify(data.registrations), {
        headers: { 'Content-Type': 'application/json' }
      })
    );
    
    console.log('Tournament data cached successfully:', tournamentId);
  } catch (error) {
    console.error('Failed to cache tournament data:', error);
  }
}

// Handle background sync
self.addEventListener('sync', event => {
  if (event.tag === 'offline-sync-queue') {
    event.waitUntil(doOfflineSync());
  }
});

// Offline sync function
async function doOfflineSync() {
  try {
    // Get all pending sync requests
    const cache = await caches.open('offline-sync-queue');
    const requests = await cache.keys();
    
    for (const request of requests) {
      try {
        const response = await fetch(request);
        if (response.ok) {
          await cache.delete(request);
          console.log('Synced offline request:', request.url);
        }
      } catch (error) {
        console.error('Failed to sync request:', request.url, error);
      }
    }
    
    // Notify clients about sync completion
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'BACKGROUND_SYNC_COMPLETE'
      });
    });
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Handle installation
self.addEventListener('install', event => {
  console.log('IDPA Service Worker installing...');
  event.waitUntil(
    caches.open('app-v1').then(cache => {
      return cache.addAll([
        '/',
        '/manifest.json',
        '/icons/icon-192x192.png',
        '/icons/icon-512x512.png'
      ]);
    })
  );
});

// Handle activation
self.addEventListener('activate', event => {
  console.log('IDPA Service Worker activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName.startsWith('app-') && cacheName !== 'app-v1')
          .map(cacheName => caches.delete(cacheName))
      );
    })
  );
});

// Handle offline fallback
self.addEventListener('fetch', event => {
  // Only handle navigation requests that aren't already handled
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/offline.html') || caches.match('/');
      })
    );
  }
});