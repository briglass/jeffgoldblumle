import { useEffect } from 'react'

export const GoogleAdDisplay = () => {
  useEffect(() => {
    // Avoid running AdSense on localhost / development to prevent console/runtime errors
    if (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      process.env.NODE_ENV === 'development'
    ) {
      return
    }

    try {
      // @ts-ignore
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch (e) {
      console.error('Google Adsense error', e)
    }
  }, [])

  return (
    <div className="w-full overflow-hidden flex justify-center items-center my-2">
      {/* horizontal display ad 01 */}
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-9509983147297425"
        data-ad-slot="8147803503"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}
