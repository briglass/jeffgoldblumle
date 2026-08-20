// Adsterra native banner (Disabled)
export const AdsterraNative = () => {
  return null
}
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
    <div className="flex justify-center items-center my-4 w-full max-w-full min-h-[100px] overflow-hidden">
      <div id={containerId} ref={adRef} className="w-full max-w-full" />
    </div>
  )
}
