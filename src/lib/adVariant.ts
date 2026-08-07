// The split between "Monetag only" and "all other networks" is decided
// by the inline script in public/index.html before any ad script loads, so the
// head tags and the React tree always agree on the same coin flip.
// Monetag is currently set to 0% probability (disabled).
declare global {
  interface Window {
    __JGLE_AD_VARIANT__?: 'monetag' | 'other'
    __JGLE_SHOW_MONETAG__?: boolean
    __JGLE_SHOW_OTHER_ADS__?: boolean
  }
}

// Google AdSense, and Adsterra/Hilltop if they are ever re-enabled.
export const shouldShowOtherAds = (): boolean =>
  window.__JGLE_SHOW_OTHER_ADS__ === true

export const shouldShowMonetag = (): boolean =>
  window.__JGLE_SHOW_MONETAG__ === true
