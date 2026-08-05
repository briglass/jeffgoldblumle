import { useEffect } from 'react'

const WIDGET_SRC = 'https://trivizzle.com/widget.js'

// Trivizzle partner badge: the widget script scans for [data-tz-widget]
// elements and renders into them.
export const TrivizzleBadge = () => {
  useEffect(() => {
    if (document.querySelector(`script[src="${WIDGET_SRC}"]`)) return
    const script = document.createElement('script')
    script.src = WIDGET_SRC
    script.async = true
    document.body.appendChild(script)
    return () => {
      script.remove()
    }
  }, [])

  return <div data-tz-widget data-tz-size="badge" />
}
