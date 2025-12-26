import { syncWorkspaceIfNeeded } from '../src/infra/drive'

// Very small service worker module for background sync and messaging
self.addEventListener('install', () => {
  // activate immediately in dev; Chrome enforces service worker lifecycle
  // @ts-ignore
  self.skipWaiting && self.skipWaiting()
})

self.addEventListener('activate', (ev) => {
  // @ts-ignore
  self.clients?.claim && self.clients.claim()
})

// example message handler
self.addEventListener('message', async (ev: any) => {
  const data = ev.data || {}
  if (data.type === 'RUN_SYNC') {
    // inform UI of sync start
    self.clients.matchAll().then(clients => {
      clients.forEach(c => c.postMessage({ type: 'SYNC_STATE', state: 'syncing' }))
    })
    try {
      await syncWorkspaceIfNeeded()
      self.clients.matchAll().then(clients => {
        clients.forEach(c => c.postMessage({ type: 'SYNC_STATE', state: 'idle' }))
      })
    } catch (err) {
      self.clients.matchAll().then(clients => {
        clients.forEach(c => c.postMessage({ type: 'SYNC_STATE', state: 'error' }))
      })
    }
  }
})