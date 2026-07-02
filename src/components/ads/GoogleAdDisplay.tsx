import { useEffect } from 'react'

export const GoogleAdDisplay = () => {
  useEffect(() => {
    const adWindow = window as Window & {
      adsbygoogle?: unknown[]
    }

    const pushAd = () => {
      try {
        // @ts-ignore
        ;(adWindow.adsbygoogle = adWindow.adsbygoogle || []).push({})
      } catch (e) {
        console.error('Google Adsense error', e)
      }
    }

    try {
      const scriptId = 'google-adsense-loader'
      const existingScript = document.getElementById(
        scriptId
      ) as HTMLScriptElement | null

      if (existingScript) {
        if (adWindow.adsbygoogle) {
          pushAd()
        } else {
          existingScript.addEventListener('load', pushAd, { once: true })
        }
        return
      }

      const script = document.createElement('script')
      script.id = scriptId
      script.async = true
      script.src =
        'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9509983147297425'
      script.crossOrigin = 'anonymous'
      script.onload = pushAd

      document.head.appendChild(script)
    } catch (e) {
      console.error('Google Adsense error', e)
    }
  }, [])

  return (
    <div className="w-full overflow-hidden flex justify-center items-center">
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
