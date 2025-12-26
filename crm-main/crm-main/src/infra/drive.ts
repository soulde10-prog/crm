import { getAuthToken } from './auth'

export const MAX_PATCH_BATCH = 50
const DRIVE_FILES_API = 'https://www.googleapis.com/drive/v3/files'
const UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3/files'

async function fetchWithAuth(url: string, opts: RequestInit = {}) {
  const token = await getAuthToken(true)
  const headers = new Headers(opts.headers || {})
  headers.set('Authorization', `Bearer ${token}`)
  return fetch(url, { ...opts, headers })
}

/**
 * Find the workspace file in AppData Folder by workspaceId
 */
export async function findWorkspaceFile(workspaceId: string) {
  const q = encodeURIComponent(`appProperties has { key='workspaceId' and value='${workspaceId}' } and trashed = false`)
  const url = `${DRIVE_FILES_API}?spaces=appDataFolder&q=${q}&fields=files(id,name,md5Checksum,version,appProperties)`
  const res = await fetchWithAuth(url)
  if (!res.ok) throw new Error('Drive find failed')
  const data = await res.json()
  return data.files && data.files[0]
}

/**
 * Download file content (appDataFolder)
 */
export async function downloadFile(fileId: string) {
  const url = `${DRIVE_FILES_API}/${fileId}?alt=media`
  const res = await fetchWithAuth(url)
  if (!res.ok) throw new Error('Drive download failed')
  return res.json()
}

/**
 * Upload (replace) file content using optimistic concurrency via If-Match
 */
export async function uploadFile(fileId: string, body: any, ifMatch?: string) {
  const url = `${UPLOAD_API}/${fileId}?uploadType=media`
  const headers: any = { 'Content-Type': 'application/json' }
  if (ifMatch) headers['If-Match'] = ifMatch
  const res = await fetchWithAuth(url, { method: 'PATCH', body: JSON.stringify(body), headers })
  if (res.status === 412) throw new Error('Conflict')
  if (!res.ok) throw new Error('Drive upload failed')
  return res.json()
}

/**
 * Create file in appDataFolder
 */
export async function createWorkspaceFile(workspaceId: string, body: any) {
  const url = `${UPLOAD_API}?uploadType=multipart`
  // simple create via metadata + media; keep minimal here
  const metadata = { name: 'workspace.json', parents: ['appDataFolder'], appProperties: { workspaceId } }
  const boundary = '-------314159265358979323846'
  const delimiter = `\r\n--${boundary}\r\n`
  const close = `\r\n--${boundary}--`
  const multipart = delimiter +
    'Content-Type: application/json\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    JSON.stringify(body) +
    close
  const token = await getAuthToken(true)
  const res = await fetch(`${UPLOAD_API}?uploadType=multipart`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: multipart
  })
  if (!res.ok) throw new Error('Drive create failed')
  return res.json()
}

/**
 * Small helper to push patch batches
 */
export async function syncPatches(patches: any[]) {
  if (patches.length > MAX_PATCH_BATCH) {
    // For large changes, batch or compress; avoid blocking
    console.warn('Too many changes: batching recommended')
  }
  // Real implementation: append patches to workspace file delta array
}