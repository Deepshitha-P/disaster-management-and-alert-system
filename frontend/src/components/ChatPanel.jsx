import { useEffect, useState } from 'react'
import { getDatabase, ref, push, onValue } from 'firebase/database'
import { initializeApp } from 'firebase/app'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DB_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const db = getDatabase(app)

export default function ChatPanel({ room }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")

  useEffect(() => {
    const chatRef = ref(db, `chats/${room}`)
    const unsub = onValue(chatRef, (snap) => {
      const val = snap.val() || {}
      setMessages(Object.values(val))
    })
    return () => unsub()
  }, [room])

  const sendMessage = () => {
    if (!input.trim()) return
    const chatRef = ref(db, `chats/${room}`)
    push(chatRef, { text: input, ts: Date.now() })
    setInput("")
  }

  return (
    <div className="card max-w-md">
      <h2 className="font-semibold">Chat</h2>
      <div className="h-40 overflow-y-auto border p-2 mb-2">
        {messages.map((m, i) => <p key={i}>{m.text}</p>)}
      </div>
      <div className="flex gap-2">
        <input className="input flex-1" value={input} onChange={e => setInput(e.target.value)} />
        <button className="btn-primary" onClick={sendMessage}>Send</button>
      </div>
    </div>
  )
}
