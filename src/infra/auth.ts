/* global chrome */

// Unified auth wrapper: uses chrome.identity in extension mode,
// or returns a mock token/profile when VITE_USE_MOCK_AUTH === 'true'.
// Toggle mock behavior by setting VITE_USE_MOCK_AUTH in your Vite env (.env).

const USE_MOCK = import.meta.env.VITE_USE_MOCK_AUTH === 'true'

if (USE_MOCK) {
  // Mock implementations (fast dev without OAuth)
  export async function getAuthToken(_interactive = true): Promise<string> {
    // A fake token so code that sets Authorization header still runs.
    return Promise.resolve('MOCK_ACCESS_TOKEN')
  }

  export async function removeCachedToken(_token?: string): Promise<void> {
    // no-op for mock
    return Promise.resolve()
  }

  export async function getProfile(): Promise<{ email?: string; id?: string }> {
    return Promise.resolve({ email: 'dev@example.com', id: 'dev' })
  }
} else {
  // Real chrome.identity implementations used in the extension.
  export async function getAuthToken(interactive = true): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        chrome.identity.getAuthToken({ interactive }, (token) => {
          if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message))
          resolve(token as string)
        })
      } catch (err) {
        reject(err)
      }
    })
  }

  export async function removeCachedToken(token?: string): Promise<void> {
    return new Promise<void>((resolve) => {
      if (!token) return resolve()
      chrome.identity.removeCachedAuthToken({ token }, () => resolve())
    })
  }

  export async function getProfile(): Promise<{ email?: string; id?: string }> {
    return new Promise((resolve) => {
      chrome.identity.getProfileUserInfo((info) => resolve(info || {}))
    })
  }
}