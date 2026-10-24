import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

let resize: () => void
const disconnect = vi.fn()

beforeEach(() => {
  vi.resetModules()
  vi.useFakeTimers()
  disconnect.mockClear()
  vi.stubGlobal('ResizeObserver', class {
    constructor(callback: () => void) { resize = callback }
    observe() {}
    disconnect = disconnect
  })
  document.body.innerHTML = '<div data-test="console-scroll"><main></main></div>'
  history.replaceState({ position: 1 }, '')
})

afterEach(() => {
  vi.runOnlyPendingTimers()
  vi.useRealTimers()
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

describe('console scroll restoration', () => {
  it('resets new navigation and restores separate history entries including repeated URLs', async () => {
    const { captureConsoleScroll, restoreConsoleScroll } = await import('../consoleScroll')
    const container = document.querySelector<HTMLElement>('[data-test="console-scroll"]')!
    restoreConsoleScroll(false)
    container.scrollTop = 480
    captureConsoleScroll()
    history.replaceState({ position: 2 }, '')
    restoreConsoleScroll(false)
    expect(container.scrollTop).toBe(0)
    container.scrollTop = 160
    captureConsoleScroll()
    history.replaceState({ position: 1 }, '')
    restoreConsoleScroll(true)
    expect(container.scrollTop).toBe(480)
    captureConsoleScroll()
    history.replaceState({ position: 2 }, '')
    restoreConsoleScroll(true)
    expect(container.scrollTop).toBe(160)
  })

  it('leaves public-page scrolling to the router', async () => {
    const { restoreConsoleScroll } = await import('../consoleScroll')
    document.body.innerHTML = '<main>Public page</main>'
    expect(restoreConsoleScroll(false)).toBe(false)
  })

  it('retries when asynchronous content grows and stops once restored', async () => {
    const { captureConsoleScroll, restoreConsoleScroll } = await import('../consoleScroll')
    const container = document.querySelector<HTMLElement>('[data-test="console-scroll"]')!
    restoreConsoleScroll(false)
    container.scrollTop = 600
    captureConsoleScroll()
    let availableHeight = 100
    let scrollTop = 0
    Object.defineProperty(container, 'scrollTop', {
      get: () => scrollTop,
      set: (value: number) => { scrollTop = Math.min(value, availableHeight) }
    })
    restoreConsoleScroll(true)
    expect(scrollTop).toBe(100)
    availableHeight = 1000
    resize()
    expect(scrollTop).toBe(600)
    expect(disconnect).toHaveBeenCalledOnce()
  })

  it('cancels pending restoration on user interaction or navigation', async () => {
    const { captureConsoleScroll, restoreConsoleScroll } = await import('../consoleScroll')
    const container = document.querySelector<HTMLElement>('[data-test="console-scroll"]')!
    restoreConsoleScroll(false)
    container.scrollTop = 600
    captureConsoleScroll()
    Object.defineProperty(container, 'scrollTop', { get: () => 0, set: () => {} })
    restoreConsoleScroll(true)
    container.dispatchEvent(new Event('wheel'))
    expect(disconnect).toHaveBeenCalledOnce()
    restoreConsoleScroll(true)
    captureConsoleScroll()
    expect(disconnect).toHaveBeenCalledTimes(2)
  })
})
