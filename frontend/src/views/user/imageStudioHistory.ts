const DATABASE = 'sub2api.image.studio'
const STORE = 'images'
const LIMIT = 10

export interface ImageStudioHistoryEntry {
  id: number
  blob: Blob
  prompt: string
  model: string
  createdAt: number
}

function openHistory(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 1)
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function historyTransaction(
  mode: IDBTransactionMode,
  mutate?: (store: IDBObjectStore) => void
): Promise<ImageStudioHistoryEntry[]> {
  const database = await openHistory()
  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE, mode)
      const store = transaction.objectStore(STORE)
      let entries: ImageStudioHistoryEntry[] = []
      transaction.oncomplete = () => resolve(entries)
      transaction.onabort = () => reject(transaction.error)
      transaction.onerror = () => reject(transaction.error)
      mutate?.(store)
      const request = store.getAll()
      request.onsuccess = () => {
        const all = (request.result as ImageStudioHistoryEntry[]).sort((a, b) => b.id - a.id)
        entries = all.slice(0, LIMIT)
        if (mode === 'readwrite') {
          for (const entry of all.slice(LIMIT)) store.delete(entry.id)
        }
      }
    })
  } finally {
    database.close()
  }
}

export function readImageStudioHistory() {
  return historyTransaction('readonly')
}

export function deleteImageStudioHistory(id: number) {
  return historyTransaction('readwrite', (store) => {
    store.delete(id)
  })
}

export async function saveImageStudioHistory(dataUrls: string[], prompt: string, model: string) {
  const createdAt = Date.now()
  const entries = await Promise.all(
    dataUrls.map(async (url) => ({
      prompt,
      model,
      createdAt,
      blob: await (await fetch(url)).blob()
    }))
  )
  return historyTransaction('readwrite', (store) => {
    for (const entry of entries) store.add(entry)
  })
}
