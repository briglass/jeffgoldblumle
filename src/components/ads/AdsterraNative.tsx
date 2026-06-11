import { useEffect, useRef } from 'react'

export const AdsterraNative = () => {
  const containerId = 'container-2a5e45dd8794e4310d9a930b4928f877'
  const adRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!adRef.current) return

    // Clean any existing elements to prevent double rendering
    adRef.current.innerHTML = ''

    const script = document.createElement('script')
    script.async = true
    script.setAttribute('data-cfasync', 'false')
    script.src = 'https://cameljolly.com/2a5e45dd8794e4310d9a930b4928f877/invoke.js'

    adRef.current.appendChild(script)
  }, [])

  return (
    <div className="flex justify-center items-center my-4 w-full min-h-[100px]">
      <div id={containerId} ref={adRef} className="w-full max-w-[1200px]" />
    </div>
  )
}
