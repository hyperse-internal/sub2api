const DATABASE = 'sub2api.image.studio'
const STORE = 'images'
const LIMIT = 10

export interface ImageStudioImageInfo {
  name: string
  byteSize: number
  width: number
  height: number
  mimeType: string
  size: string
  quality: string
  format: string
}

export interface ImageStudioHistoryEntry extends ImageStudioImageInfo {
  id: number
  blob: Blob
  prompt: string
  model: string
  createdAt: number
}

export interface ImageStudioHistoryDraft {
  prompt: string
  model: string
  size: string
  quality: string
  format: string
}

function imageExtension(mimeType: string) {
  if (mimeType === 'image/jpeg') return 'jpg'
  if (mimeType === 'image/webp') return 'webp'
  return 'png'
}

export function readImageDimensions(blob: Blob): Promise<{ width: number; height: number }> {
  const url = URL.createObjectURL(blob)
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: image.naturalWidth, height: image.naturalHeight })
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('image'))
    }
    image.src = url
  })
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

export function blobFromImageSource(url: string): Promise<Blob> {
  if (!url.startsWith('data:')) {
    return fetch(url).then((response) => {
      if (!response.ok) throw new Error('image')
      return response.blob()
    })
  }
  const comma = url.indexOf(',')
  if (comma < 0) return Promise.reject(new Error('image'))
  const meta = url.slice('data:'.length, comma)
  const payload = url.slice(comma + 1)
  const mime = meta.split(';')[0] || 'application/octet-stream'
  const binary = meta.split(';').includes('base64') ? atob(payload) : decodeURIComponent(payload)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)
  return Promise.resolve(new Blob([bytes], { type: mime }))
}

export async function saveImageStudioHistory(dataUrls: string[], draft: ImageStudioHistoryDraft) {
  const createdAt = Date.now()
  const entries = await Promise.all(
    dataUrls.map(async (url, index) => {
      const blob = await blobFromImageSource(url)
      const mimeType = blob.type || 'image/png'
      const dimensions = await readImageDimensions(blob).catch(() => ({ width: 0, height: 0 }))
      const suffix = dataUrls.length > 1 ? `-${index + 1}` : ''
      return {
        prompt: draft.prompt,
        model: draft.model,
        createdAt,
        blob,
        name: `image-${createdAt}${suffix}.${imageExtension(mimeType)}`,
        byteSize: blob.size,
        width: dimensions.width,
        height: dimensions.height,
        mimeType,
        size: draft.size,
        quality: draft.quality,
        format: draft.format
      }
    })
  )
  await historyTransaction('readwrite', (store) => {
    for (const entry of entries) store.add(entry)
  })
  return entries
}
