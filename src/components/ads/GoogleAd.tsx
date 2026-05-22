import { useEffect } from 'react'

type GoogleAdProps = {
  slot: string
  className?: string
  style?: React.CSSProperties
  format?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal'
  responsive?: 'true' | 'false'
}

export const GoogleAd = ({
  slot,
  className,
  style,
  format = 'auto',
  responsive = 'true',
}: GoogleAdProps) => {
  useEffect(() => {
    try {
      // @ts-ignore
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch (e) {
      console.error('Google Adsense error', e)
    }
  }, [])

  if (!process.env.REACT_APP_GOOGLE_ADSENSE_ID) {
    return null // Don't render if there's no AdSense ID configured
  }

  return (
    <div className="w-full overflow-hidden flex justify-center items-center my-2">
      <ins
        className={`adsbygoogle ${className || ''}`}
        style={{ display: 'block', ...style }}
        data-ad-client={process.env.REACT_APP_GOOGLE_ADSENSE_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  )
}
