import { useEffect, useRef } from 'react'

export const AdsterraNative = () => {
  const containerId = 'container-2a5e45dd8794e4310d9a930b4928f877'
  const adRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      process.env.NODE_ENV === 'development'
    ) {
      return
    }

    if (!adRef.current) return

    // Clean any existing elements to prevent double rendering
    adRef.current.innerHTML = ''

    const script = document.createElement('script')
    script.async = true
    script.setAttribute('data-cfasync', 'false')
    script.src =
      'https://cameljolly.com/2a5e45dd8794e4310d9a930b4928f877/invoke.js'

    adRef.current.appendChild(script)

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }

      // Clear any global arrays on window that prevent re-initialization of this placement
      Object.keys(window).forEach((key) => {
        try {
          // @ts-ignore
          const val = window[key]
          if (
            Array.isArray(val) &&
            val.includes('2a5e45dd8794e4310d9a930b4928f877')
          ) {
            // @ts-ignore
            window[key] = val.filter(
              (item) => item !== '2a5e45dd8794e4310d9a930b4928f877'
            )
          }
        } catch (e) {
          // Ignore security/access errors for some window properties
        }
      })
    }
  }, [])

  return (
    <div className="flex justify-center items-center my-4 w-full min-h-[100px]">
      <div id={containerId} ref={adRef} className="w-full" />
    </div>
  )
}
