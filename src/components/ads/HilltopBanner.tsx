import { useEffect, useRef } from 'react'

export const HilltopBanner = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Clean any existing elements to prevent double rendering
    containerRef.current.innerHTML = ''

    // Create the script element directly
    const s = document.createElement('script')
    s.src =
      '//shameful-farm.com/brX/V/s.dSGflK0sYAWEcB/zeMmJ9/uxZBUKlkkFPMT-cExNMgzLMszfM/TNM/t/N/z/EzzgMqzeM/x-NNwT'
    s.async = true
    s.referrerPolicy = 'no-referrer-when-downgrade'
    // @ts-ignore
    s.settings = {}

    containerRef.current.appendChild(s)
  }, [])

  return (
    <div className="flex justify-center items-center my-2 min-h-[50px] w-full">
      <div ref={containerRef} />
    </div>
  )
}
