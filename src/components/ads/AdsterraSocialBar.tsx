import { useEffect } from 'react'

// Adsterra Social Bar: the script injects its own floating widget (typically
// anchored to the bottom of the screen). Its exact style and position are
// configured in the Adsterra dashboard for this zone, not in this code.
export const AdsterraSocialBar = () => {
  useEffect(() => {
    if (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      process.env.NODE_ENV === 'development'
    ) {
      return
    }

    const script = document.createElement('script')
    script.src =
      'https://cameljolly.com/56/01/e5/5601e5bed5d7aecfa194653ca07a15fb.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  return null
}
