'use client'

import { useEffect, useState } from 'react'
import { Network } from '@capacitor/network'
import { Wifi, WifiOff } from 'lucide-react'

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    Network.getStatus().then(status => setIsOnline(status.connected))

    const listener = Network.addListener('networkStatusChange', (status) => {
      setIsOnline(status.connected)
    })

    return () => {
      listener.remove()
    }
  }, [])

  if (isOnline) return null

  return (
    <div className="fixed bottom-4 right-4 flex items-center gap-2 bg-destructive text-destructive-foreground px-3 py-2 rounded-md shadow-lg">
      <WifiOff className="h-4 w-4" />
      <span className="text-sm font-medium">Offline</span>
    </div>
  )
}

