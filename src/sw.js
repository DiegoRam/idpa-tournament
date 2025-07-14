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

// Handle background sync with enhanced batching
self.addEventListener('sync', event => {
  console.log('Background sync event:', event.tag);
  
  if (event.tag === 'offline-sync-queue') {
    event.waitUntil(doEnhancedOfflineSync());
  } else if (event.tag === 'notification-batch-sync') {
    event.waitUntil(batchSyncNotifications());
  } else if (event.tag === 'score-batch-sync') {
    event.waitUntil(batchSyncScores());
  }
});

// Enhanced offline sync with batching and priority handling
async function doEnhancedOfflineSync() {
  try {
    console.log('Starting enhanced offline sync...');
    
    // Get all pending sync requests
    const cache = await caches.open('offline-sync-queue');
    const requests = await cache.keys();
    
    console.log(`Found ${requests.length} pending sync requests`);
    
    if (requests.length === 0) {
      notifyClientsOfSyncCompletion(0);
      return;
    }
    
    // Group requests by priority and type
    const priorityGroups = {
      scores: [],      // Highest priority
      badges: [],      // High priority  
      tournaments: [], // Medium priority
      other: []        // Lower priority
    };
    
    for (const request of requests) {
      if (request.url.includes('/scores')) {
        priorityGroups.scores.push(request);
      } else if (request.url.includes('/badges')) {
        priorityGroups.badges.push(request);
      } else if (request.url.includes('/tournaments')) {
        priorityGroups.tournaments.push(request);
      } else {
        priorityGroups.other.push(request);
      }
    }
    
    let totalSynced = 0;
    
    // Sync in priority order with batching
    for (const [type, typeRequests] of Object.entries(priorityGroups)) {
      if (typeRequests.length > 0) {
        console.log(`Syncing ${typeRequests.length} ${type} requests`);
        const synced = await syncRequestBatch(typeRequests, cache, type);
        totalSynced += synced;
      }
    }
    
    console.log(`Enhanced offline sync completed: ${totalSynced} items synced`);
    notifyClientsOfSyncCompletion(totalSynced);
    
  } catch (error) {
    console.error('Enhanced background sync failed:', error);
    notifyClientsOfSyncCompletion(0, error);
  }
}

// Sync a batch of requests with retry logic
async function syncRequestBatch(requests, cache, type) {
  let syncedCount = 0;
  const batchSize = type === 'scores' ? 5 : 10; // Smaller batches for scores
  
  // Process in smaller batches to avoid overwhelming the server
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (request) => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          await cache.delete(request);
          console.log(`Synced ${type} request:`, request.url);
          return true;
        } else {
          console.warn(`Sync failed for ${type} request:`, response.status, request.url);
          return false;
        }
      } catch (error) {
        console.error(`Failed to sync ${type} request:`, request.url, error);
        return false;
      }
    });
    
    const results = await Promise.allSettled(batchPromises);
    const batchSynced = results.filter(r => r.status === 'fulfilled' && r.value).length;
    syncedCount += batchSynced;
    
    // Small delay between batches to be gentle on the server
    if (i + batchSize < requests.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return syncedCount;
}

// Batch sync scores with tournament grouping
async function batchSyncScores() {
  try {
    console.log('Starting score batch sync...');
    
    const cache = await caches.open('offline-sync-queue');
    const allRequests = await cache.keys();
    const scoreRequests = allRequests.filter(req => 
      req.url.includes('/scores')
    );
    
    if (scoreRequests.length === 0) {
      console.log('No score requests to sync');
      return;
    }
    
    console.log(`Batch syncing ${scoreRequests.length} score requests`);
    
    // Group by tournament for better batching
    const tournamentGroups = {};
    
    for (const request of scoreRequests) {
      try {
        const response = await cache.match(request);
        if (response) {
          const data = await response.json();
          const tournamentId = data.tournamentId || 'unknown';
          
          if (!tournamentGroups[tournamentId]) {
            tournamentGroups[tournamentId] = [];
          }
          tournamentGroups[tournamentId].push(request);
        }
      } catch (error) {
        console.error('Failed to parse cached score request:', error);
      }
    }
    
    // Sync each tournament's scores
    for (const [tournamentId, requests] of Object.entries(tournamentGroups)) {
      const synced = await syncRequestBatch(requests, cache, 'scores');
      console.log(`Tournament ${tournamentId}: synced ${synced}/${requests.length} scores`);
    }
    
  } catch (error) {
    console.error('Score batch sync failed:', error);
  }
}

// Batch sync notifications
async function batchSyncNotifications() {
  try {
    console.log('Starting notification batch sync...');
    
    const cache = await caches.open('notification-queue');
    const requests = await cache.keys();
    
    if (requests.length === 0) {
      console.log('No pending notifications to sync');
      return;
    }
    
    const synced = await syncRequestBatch(requests, cache, 'notifications');
    console.log(`Notification sync completed: ${synced}/${requests.length} synced`);
    
  } catch (error) {
    console.error('Notification batch sync failed:', error);
  }
}

// Notify clients about sync completion
function notifyClientsOfSyncCompletion(syncedCount, error = null) {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'BACKGROUND_SYNC_COMPLETE',
        syncedCount,
        error: error ? error.message : null,
        timestamp: Date.now()
      });
    });
  });
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

// Push notification event handler
self.addEventListener('push', event => {
  console.log('Push notification received:', event);
  
  if (!event.data) {
    console.log('Push event but no data');
    return;
  }

  try {
    const payload = event.data.json();
    const options = {
      body: payload.body,
      icon: payload.icon || '/icons/icon-192x192.png',
      badge: payload.badge || '/icons/icon-72x72.png',
      tag: payload.tag || 'idpa-notification',
      data: payload.data || {},
      actions: payload.actions || [
        {
          action: 'view',
          title: 'View',
          icon: '/icons/icon-72x72.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/icons/icon-72x72.png'
        }
      ],
      requireInteraction: payload.requireInteraction || false,
      silent: payload.silent || false,
      vibrate: payload.vibrate || [200, 100, 200],
      timestamp: Date.now(),
      renotify: true,
    };

    event.waitUntil(
      self.registration.showNotification(payload.title, options)
    );
  } catch (error) {
    console.error('Error showing push notification:', error);
    
    // Fallback notification
    event.waitUntil(
      self.registration.showNotification('IDPA Tournament Update', {
        body: 'You have a new notification',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: 'fallback-notification'
      })
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  const action = event.action;
  const data = event.notification.data || {};
  
  if (action === 'dismiss') {
    // Just close the notification
    return;
  }
  
  // Determine URL based on notification type and data
  let targetUrl = '/dashboard';
  
  if (data.type === 'score_posted' && data.tournamentId) {
    targetUrl = `/tournaments/${data.tournamentId}/leaderboard`;
  } else if (data.type === 'badge_earned') {
    targetUrl = '/badges';
  } else if (data.type === 'tournament_update' && data.tournamentId) {
    targetUrl = `/tournaments/${data.tournamentId}`;
  } else if (data.type === 'conflict_alert' && data.tournamentId && data.stageId) {
    targetUrl = `/scoring/${data.tournamentId}/stages/${data.stageId}`;
  } else if (data.url) {
    targetUrl = data.url;
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // Check if there's already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If no existing window/tab, open a new one
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Background sync for notifications
self.addEventListener('sync', event => {
  if (event.tag === 'notification-sync') {
    event.waitUntil(syncNotifications());
  } else if (event.tag === 'offline-sync-queue') {
    event.waitUntil(doOfflineSync());
  }
});

// Sync notifications function
async function syncNotifications() {
  try {
    // Get unread notifications from IndexedDB or cache
    const cache = await caches.open('notification-data');
    const response = await cache.match('/api/notifications/unread');
    
    if (response) {
      const notifications = await response.json();
      
      // Show notifications that haven't been shown yet
      for (const notification of notifications) {
        if (!notification.shown) {
          await self.registration.showNotification(notification.title, {
            body: notification.body,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            tag: notification.id,
            data: notification.data,
            timestamp: notification.timestamp
          });
          
          // Mark as shown
          notification.shown = true;
        }
      }
      
      // Update cache with marked notifications
      await cache.put('/api/notifications/unread', 
        new Response(JSON.stringify(notifications), {
          headers: { 'Content-Type': 'application/json' }
        })
      );
    }
  } catch (error) {
    console.error('Failed to sync notifications:', error);
  }
}

// Enhanced offline sync with notification support
async function doOfflineSync() {
  try {
    // Get all pending sync requests
    const cache = await caches.open('offline-sync-queue');
    const requests = await cache.keys();
    
    let syncedCount = 0;
    
    for (const request of requests) {
      try {
        const response = await fetch(request);
        if (response.ok) {
          await cache.delete(request);
          syncedCount++;
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
        type: 'BACKGROUND_SYNC_COMPLETE',
        syncedCount
      });
    });
    
    // Show notification if sync was successful and items were processed
    if (syncedCount > 0) {
      await self.registration.showNotification('IDPA Sync Complete', {
        body: `${syncedCount} action(s) synchronized successfully`,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: 'sync-complete',
        silent: true,
        actions: [
          {
            action: 'view',
            title: 'View Dashboard'
          }
        ],
        data: {
          type: 'sync_complete',
          url: '/dashboard'
        }
      });
    }
  } catch (error) {
    console.error('Background sync failed:', error);
    
    // Show error notification
    await self.registration.showNotification('IDPA Sync Failed', {
      body: 'Some actions could not be synchronized. Please check your connection.',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: 'sync-failed',
      requireInteraction: true,
      actions: [
        {
          action: 'retry',
          title: 'Retry'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    });
  }
}

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