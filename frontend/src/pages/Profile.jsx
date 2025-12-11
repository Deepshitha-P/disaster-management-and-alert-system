import { useState } from 'react'
import { requestNotificationPermission } from '../notifications/fcm'

export default function Profile() {
  const [msg, setMsg] = useState("")

  const enableNotifications = async () => {
    await requestNotificationPermission()
    setMsg("Notifications enabled")
  }

  return (
    <div className="card max-w-md mx-auto space-y-4">
      <h1 className="text-xl font-bold">Profile</h1>
      <button className="btn-primary w-full" onClick={enableNotifications}>Enable Notifications</button>
      {msg && <p className="text-green-600">{msg}</p>}
    </div>
  )
}
