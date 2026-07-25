'use client'
import { useEffect, useState } from 'react'
import Button from './Button'
import { BellIcon } from './Icons'
import { saveSubscription, removeSubscription } from '@/app/(app)/more/settings/push-actions'

type State = 'loading' | 'unsupported' | 'default' | 'denied' | 'enabled' | 'working'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const out = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}

export default function EnablePush() {
  const [state, setState] = useState<State>('loading')
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      !('PushManager' in window) ||
      !('Notification' in window)
    ) {
      setState('unsupported')
      return
    }
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => {
        if (Notification.permission === 'denied') setState('denied')
        else if (sub) setState('enabled')
        else setState('default')
      })
      .catch(() => setState('default'))
  }, [])

  async function enable() {
    setState('working')
    setMsg(null)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setState(permission === 'denied' ? 'denied' : 'default')
        return
      }
      const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!key) {
        setMsg('Notifications are not configured yet.')
        setState('default')
        return
      }
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key) as BufferSource,
      })
      const json = sub.toJSON()
      const result = await saveSubscription({
        endpoint: json.endpoint ?? sub.endpoint,
        keys: { p256dh: json.keys?.p256dh ?? '', auth: json.keys?.auth ?? '' },
      })
      if ('error' in result) {
        setMsg(result.error)
        setState('default')
        return
      }
      setState('enabled')
      setMsg('Notifications are on for this device.')
    } catch {
      setMsg('Could not enable notifications on this device.')
      setState('default')
    }
  }

  async function disable() {
    setState('working')
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await removeSubscription(sub.endpoint)
        await sub.unsubscribe()
      }
      setState('default')
      setMsg('Notifications turned off for this device.')
    } catch {
      setState('enabled')
    }
  }

  return (
    <div className="mx-5">
      <div className="flex gap-3 items-center py-[13px] min-h-[52px]">
        <div className="w-8 h-8 rounded-[10px] bg-bg-2 flex items-center justify-center text-ink-2 [&_svg]:w-[17px] [&_svg]:h-[17px]">
          <BellIcon />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-medium text-ink tracking-[-0.014em]">Push notifications</div>
          <div className="text-[12.5px] text-ink-3 mt-0.5">
            {state === 'enabled'
              ? 'On for this device'
              : state === 'denied'
                ? 'Blocked in your browser settings'
                : state === 'unsupported'
                  ? 'Not supported on this browser'
                  : 'Get alerts for reports, follow-ups & notices'}
          </div>
        </div>
        {state === 'default' && (
          <Button variant="berry" size="sm" onClick={enable}>
            Enable
          </Button>
        )}
        {state === 'enabled' && (
          <Button variant="ghost" size="sm" onClick={disable}>
            Turn off
          </Button>
        )}
        {(state === 'loading' || state === 'working') && (
          <span className="text-[12.5px] text-ink-3">…</span>
        )}
      </div>
      {state === 'denied' && (
        <p className="text-[12px] text-ink-3 pb-2 leading-[1.4]">
          You blocked notifications. Turn them back on in your browser&rsquo;s site settings for this
          app.
        </p>
      )}
      {state === 'unsupported' && (
        <p className="text-[12px] text-ink-3 pb-2 leading-[1.4]">
          On iPhone, first tap Share → <b>Add to Home Screen</b>, open the app from your home screen,
          then enable notifications here.
        </p>
      )}
      {msg && <p className="text-[12px] text-ok pb-2">{msg}</p>}
    </div>
  )
}
