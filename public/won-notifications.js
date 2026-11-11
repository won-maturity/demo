self.addEventListener('install', (event) => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('notificationclick', (event) => {
  if (event.notification.tag !== 'won-maturity-demo') return;
  event.notification.close();
  const scope = self.registration.scope;
  const target = new URL('maturity', scope).href;

  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const existing = windows.find((client) => client.url.startsWith(scope) && client.focused)
      ?? windows.find((client) => client.url.startsWith(scope));
    if (existing) {
      try {
        await existing.focus();
        existing.postMessage({ type: 'won:open-maturity' });
        return;
      } catch {
        // If the tab closed while opening the alert, open a fresh one.
      }
    }
    await self.clients.openWindow(target);
  })());
});
