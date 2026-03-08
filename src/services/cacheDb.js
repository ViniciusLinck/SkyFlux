import { openDB } from 'idb'

const DB_NAME = 'skyflux-cache'
const STORE_NAME = 'responses'
const LS_PREFIX = 'skyflux-cache:'

let dbPromise

function supportsIndexedDb() {
  return typeof window !== 'undefined' && 'indexedDB' in window
}

function getDb() {
  if (!supportsIndexedDb()) return null
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME)
        }
      },
    })
  }
  return dbPromise
}

export async function getCacheEntry(key) {
  if (!key) return null

  try {
    const db = await getDb()
    if (db) {
      const value = await db.get(STORE_NAME, key)
      return value || null
    }
  } catch {
    return getLocalStorageEntry(key)
  }

  return getLocalStorageEntry(key)
}

export async function setCacheEntry(key, value) {
  if (!key) return

  try {
    const db = await getDb()
    if (db) {
      await db.put(STORE_NAME, value, key)
      return
    }
  } catch {
    setLocalStorageEntry(key, value)
    return
  }

  setLocalStorageEntry(key, value)
}

function getLocalStorageEntry(key) {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(`${LS_PREFIX}${key}`)
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function setLocalStorageEntry(key, value) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(`${LS_PREFIX}${key}`, JSON.stringify(value))
}
