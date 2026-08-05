import { useEffect } from 'react'

// Adsterra Social Bar, limited to one activation per visit (browser tab
// session). The script injects its own floating widget and re-shows it after
// the user closes it, so we contain it from the outside:
//  - page-level elements that appear after the script loads are tracked
//  - everything is torn down when the user engages with it (click / focus
//    moving into its iframe) or after 15 seconds, whichever is first
//  - after teardown, re-injections are removed on sight (observer + periodic
//    sweep), and a sessionStorage flag stops the script from loading again
//    on later page views this session
const SCRIPT_SRC =
  'https://cameljolly.com/56/01/e5/5601e5bed5d7aecfa194653ca07a15fb.js'
const SESSION_KEY = 'socialBarDone'
const ACTIVE_WINDOW_MS = 15000
const SWEEP_INTERVAL_MS = 1000

// Page-level elements that must never be treated as ad UI: the app itself,
// headlessui modal portals, Google's ad containers, and non-visual tags.
const isOwnElement = (el: Element): boolean => {
  if (el.id === 'root' || el.closest('#root')) return true
  const idAndClass = `${el.id} ${el.getAttribute('class') || ''}`
  if (idAndClass.includes('headlessui')) return true
  if (idAndClass.includes('google') || idAndClass.includes('adsbygoogle')) {
    return true
  }
  const tag = el.tagName
  return (
    tag === 'SCRIPT' ||
    tag === 'STYLE' ||
    tag === 'LINK' ||
    tag === 'META' ||
    tag === 'NOSCRIPT'
  )
}

export const AdsterraSocialBar = () => {
  useEffect(() => {
    if (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      process.env.NODE_ENV === 'development'
    ) {
      return
    }
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return
    } catch (e) {}

    // Anything already on the page before the ad script loads is not its UI
    const preexisting = new Set<Element>([
      ...Array.from(document.documentElement.children),
      ...Array.from(document.body.children),
    ])
    const tracked = new Set<Element>()
    let killed = false
    let sweepInterval: number | undefined

    const isAtPageLevel = (el: Element) =>
      el.parentElement === document.body ||
      el.parentElement === document.documentElement

    const handleNewElement = (el: Element) => {
      if (!isAtPageLevel(el) || preexisting.has(el) || isOwnElement(el)) return
      if (killed) {
        el.remove()
      } else {
        tracked.add(el)
      }
    }

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) handleNewElement(node as Element)
        })
      })
    })
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    })

    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    document.body.appendChild(script)

    // Backstop for anything the observer misses: drop every page-level
    // element that wasn't there before the ad script loaded.
    const sweep = () => {
      const candidates = [
        ...Array.from(document.documentElement.children),
        ...Array.from(document.body.children),
      ]
      candidates.forEach((el) => {
        if (!preexisting.has(el) && !isOwnElement(el)) el.remove()
      })
    }

    const isInsideAd = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return false
      return Array.from(tracked).some(
        (el) => el === target || el.contains(target)
      )
    }

    const kill = () => {
      if (killed) return
      killed = true
      try {
        sessionStorage.setItem(SESSION_KEY, '1')
      } catch (e) {}
      script.remove()
      tracked.forEach((el) => el.remove())
      tracked.clear()
      window.removeEventListener('blur', onBlur)
      document.removeEventListener('click', onClick, true)
      // Keep the page clean for the rest of this view: the observer removes
      // re-injections as they happen, the sweep catches anything it misses.
      sweep()
      sweepInterval = window.setInterval(sweep, SWEEP_INTERVAL_MS)
    }

    // A click inside the ad's cross-origin iframe moves focus into it and
    // blurs the window — the closest thing to an "engaged with it" signal.
    const onBlur = () => {
      if (isInsideAd(document.activeElement)) kill()
    }
    // Clicks on widget parts rendered as regular DOM (e.g. its close button)
    const onClick = (event: MouseEvent) => {
      if (isInsideAd(event.target)) kill()
    }
    window.addEventListener('blur', onBlur)
    document.addEventListener('click', onClick, true)

    const timer = window.setTimeout(kill, ACTIVE_WINDOW_MS)

    return () => {
      window.clearTimeout(timer)
      if (sweepInterval !== undefined) window.clearInterval(sweepInterval)
      window.removeEventListener('blur', onBlur)
      document.removeEventListener('click', onClick, true)
      observer.disconnect()
    }
  }, [])

  return null
}
