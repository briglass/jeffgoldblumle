import { useEffect, useRef } from 'react'

export const AdsterraBanner = () => {
  const bannerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!bannerRef.current) return

    // Clean any existing elements to prevent double rendering
    bannerRef.current.innerHTML = ''

    // Create the script element to define atOptions
    const atOptionsScript = document.createElement('script')
    atOptionsScript.type = 'text/javascript'
    atOptionsScript.innerHTML = `
      atOptions = {
        'key' : 'e1ee64d62284de09cf102c1d4321b7f7',
        'format' : 'iframe',
        'height' : 50,
        'width' : 320,
        'params' : {}
      };
    `

    // Create the script element to load invoke.js
    const invokeScript = document.createElement('script')
    invokeScript.type = 'text/javascript'
    invokeScript.src = 'https://cameljolly.com/e1ee64d62284de09cf102c1d4321b7f7/invoke.js'

    bannerRef.current.appendChild(atOptionsScript)
    bannerRef.current.appendChild(invokeScript)
  }, [])

  return (
    <div className="flex justify-center items-center my-4 min-h-[50px] w-full">
      <div ref={bannerRef} className="w-[320px] h-[50px] overflow-hidden" />
    </div>
  )
}
