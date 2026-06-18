import { useEffect, useRef } from 'react'

export const HilltopBanner = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Clean any existing elements to prevent double rendering
    containerRef.current.innerHTML = ''

    // Create the script element
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.innerHTML = `
      (function(stob){
      var d = document,
          s = d.createElement('script'),
          l = d.scripts[d.scripts.length - 1];
      s.settings = stob || {};
      s.src = "\\/\\/shameful-farm.com\\/brX\\/V\\/s.dSGflK0sYAWEcB\\/zeMmJ9\\/uxZBUKlkkFPMT-cExNMgzLMszfM\\/TNM\\/t\\/N\\/z\\/EzzgMqzeM\\/x-NNwT";
      s.async = true;
      s.referrerPolicy = 'no-referrer-when-downgrade';
      l.parentNode.insertBefore(s, l);
      })({})
    `
    containerRef.current.appendChild(script)
  }, [])

  return (
    <div className="flex justify-center items-center my-2 min-h-[50px] w-full">
      <div ref={containerRef} />
    </div>
  )
}
