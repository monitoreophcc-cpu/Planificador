'use client'

import { useEffect } from 'react'
import { OfflineBanner } from '@/ui/system/OfflineBanner'
import { UndoToast } from '@/ui/components/UndoToast'

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode
}) {
    useEffect(() => {
        if (!('serviceWorker' in navigator)) {
            return
        }

        const isLocalhost =
            window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1'

        if (process.env.NODE_ENV !== 'production' || isLocalhost) {
            void navigator.serviceWorker.getRegistrations().then(async (registrations) => {
                await Promise.all(registrations.map(registration => registration.unregister()))

                if ('caches' in window) {
                    const keys = await caches.keys()
                    await Promise.all(
                        keys
                            .filter(key => key.startsWith('control-operativo'))
                            .map(key => caches.delete(key))
                    )
                }
            })

            return
        }

        const registerServiceWorker = async () => {
            try {
                const reg = await navigator.serviceWorker.register('/sw.js')

                if (reg.waiting) {
                    console.info('[PWA] Nueva versión en espera')
                }

                reg.addEventListener('updatefound', () => {
                    const newWorker = reg.installing
                    if (!newWorker) return

                    newWorker.addEventListener('statechange', () => {
                        if (
                            newWorker.state === 'installed' &&
                            navigator.serviceWorker.controller
                        ) {
                            console.info('[PWA] Nueva versión lista (se activará al recargar)')
                        }
                    })
                })
            } catch {
                // Fail silently
            }
        }

        window.addEventListener('load', registerServiceWorker)

        return () => {
            window.removeEventListener('load', registerServiceWorker)
        }
    }, [])

    return (
        <>
            <OfflineBanner />
            <UndoToast />
            {children}
        </>
    )
}
