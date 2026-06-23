'use client'
import { useEffect } from 'react'

// Branded launch splash: shows on a cold load (covering the blank moment the OS
// splash leaves, especially on iOS) and fades out once the app is interactive.
// Client navigations don't re-mount the root layout, so it never re-appears.
export default function BootSplash() {
  useEffect(() => {
    const el = document.getElementById('sc-splash')
    if (!el) return
    const t = setTimeout(() => el.classList.add('sc-splash--hide'), 200)
    const remove = () => el.remove()
    el.addEventListener('transitionend', remove, { once: true })
    return () => clearTimeout(t)
  }, [])

  return (
    <div id="sc-splash" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-white.svg" alt="" width={150} className="sc-splash__logo" />
    </div>
  )
}
