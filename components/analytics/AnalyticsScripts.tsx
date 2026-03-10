'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'

interface PixelSettings {
  ga4_id?: string
  meta_pixel_id?: string
  tiktok_pixel_id?: string
}

export function AnalyticsScripts() {
  const [s, setS] = useState<PixelSettings>({})

  useEffect(() => {
    fetch('/api/analytics/settings')
      .then((r) => r.json())
      .then(setS)
      .catch(() => {})
  }, [])

  const ga = s.ga4_id?.trim()
  const fb = s.meta_pixel_id?.trim()
  const tt = s.tiktok_pixel_id?.trim()

  return (
    <>
      {/* Google Analytics 4 */}
      {ga && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
              gtag('js',new Date());gtag('config','${ga}',{send_page_view:true});
              window.gtag=gtag;`}
          </Script>
        </>
      )}

      {/* Meta Pixel */}
      {fb && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
            n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
            (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
            fbq('init','${fb}');fbq('track','PageView');`}
        </Script>
      )}

      {/* TikTok Pixel */}
      {tt && (
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
            ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group",
            "enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"];
            ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
            for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
            ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
            ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;
            ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=r;ttq._t=ttq._t||{};ttq._t[e+\"_\"+o]=1;
            var a=d.createElement("script");a.type="text/javascript";a.async=!0;a.src=r+\"?sdkid=\"+e+\"&lib=\"+t;
            var s=d.getElementsByTagName("script")[0];s.parentNode.insertBefore(a,s)};
            ttq.load('${tt}');ttq.page()}(window,document,'ttq');`}
        </Script>
      )}
    </>
  )
}
