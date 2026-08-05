import { useEffect } from 'react'

// Adsterra Social Bar, limited to one activation per visit (browser tab
// session). The script injects its own floating widget and re-shows it after
// the user closes it, so we contain it from the outside:
//  - elements it adds at body level are tracked from the moment it loads
//  - the whole thing is torn down when the user engages with it (click /
//    focus moving into its iframe) or after 15 seconds, whichever is first
//  - after teardown, anything its leftover timers try to re-inject is
//    removed immediately, and a sessionStorage flag stops it from loading
//    again on later page views this session
const SCRIPT_SRC =
  'https://cameljolly.com/56/01/e5/5601e5bed5d7aecfa194653ca07a15fb.js'
const SESSION_KEY = 'socialBarDone'
const ACTIVE_WINDOW_MS = 15000

// Body-level elements that must never be treated as ad UI: the app itself,
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

    const tracked: Element[] = []
    let killed = false

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return
          const el = node as Element
          if (isOwnElement(el)) return
          if (killed) {
            el.remove()
          } else {
            tracked.push(el)
          }
        })
      }
    })
    observer.observe(document.body, { childList: true })

    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    document.body.appendChild(script)

    const isInsideAd = (target: EventTarget | null) =>
      target instanceof Element &&
      tracked.some((el) => el === target || el.contains(target))

    const kill = () => {
      if (killed) return
      killed = true
      try {
        sessionStorage.setItem(SESSION_KEY, '1')
      } catch (e) {}
      script.remove()
      tracked.forEach((el) => el.remove())
      tracked.length = 0
      window.removeEventListener('blur', onBlur)
      document.removeEventListener('click', onClick, true)
      // The observer stays on: it now removes anything the ad's leftover
      // timers try to re-inject for the rest of this page view.
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
      window.removeEventListener('blur', onBlur)
      document.removeEventListener('click', onClick, true)
      observer.disconnect()
    }
  }, [])

  return null
}
