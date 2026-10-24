const positions = new Map<number, { top: number; left: number }>()
let entryPosition: number | null = null
let stopRestoring = () => {}

function getContainer() {
  return document.querySelector<HTMLElement>('[data-test="console-scroll"]')
}

export function captureConsoleScroll() {
  stopRestoring()
  const container = getContainer()
  if (container && entryPosition !== null) {
    positions.set(entryPosition, { top: container.scrollTop, left: container.scrollLeft })
  }
}

export function restoreConsoleScroll(isHistoryNavigation: boolean) {
  stopRestoring()
  entryPosition = window.history.state?.position ?? null
  const container = getContainer()
  if (!container) return false

  const position = isHistoryNavigation && entryPosition !== null
    ? positions.get(entryPosition) ?? { top: 0, left: 0 }
    : { top: 0, left: 0 }

  const applyPosition = () => {
    container.scrollTop = position.top
    container.scrollLeft = position.left
    return container.scrollTop === position.top && container.scrollLeft === position.left
  }

  if (applyPosition()) return true

  const observer = new ResizeObserver(() => {
    if (applyPosition()) stopRestoring()
  })
  const timeout = window.setTimeout(() => stopRestoring(), 3000)
  const cancel = () => stopRestoring()
  stopRestoring = () => {
    observer.disconnect()
    window.clearTimeout(timeout)
    container.removeEventListener('wheel', cancel)
    container.removeEventListener('touchstart', cancel)
    container.removeEventListener('pointerdown', cancel)
    window.removeEventListener('keydown', cancel)
    stopRestoring = () => {}
  }
  for (const child of container.children) observer.observe(child)
  container.addEventListener('wheel', cancel, { passive: true })
  container.addEventListener('touchstart', cancel, { passive: true })
  container.addEventListener('pointerdown', cancel, { passive: true })
  window.addEventListener('keydown', cancel)
  return true
}
