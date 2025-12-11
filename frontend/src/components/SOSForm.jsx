import { useState } from 'react'
import { SOSAPI } from '../utils/api'

export default function SOSForm() {
  const [form, setForm] = useState({ people: 1, problem: "", helpType: "" })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const loc = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(p => resolve(p.coords), reject)
      )
      await SOSAPI.create({
        ...form,
        location: { lat: loc.latitude, lng: loc.longitude }
      })
      setMsg("SOS sent successfully")
    } catch (err) {
      setMsg("Failed to send SOS")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card max-w-md space-y-3">
      <h2 className="text-lg font-semibold">Send SOS</h2>
      <input className="input" placeholder="Problem faced"
        value={form.problem} onChange={e => setForm({ ...form, problem: e.target.value })} />
      <input className="input" placeholder="Help needed"
        value={form.helpType} onChange={e => setForm({ ...form, helpType: e.target.value })} />
      <input className="input" type="number" placeholder="Number of people"
        value={form.people} onChange={e => setForm({ ...form, people: e.target.value })} />
      <button className="btn-primary w-full" disabled={loading}>{loading ? "Sending..." : "Send SOS"}</button>
      {msg && <p className="text-sm text-gray-600">{msg}</p>}
    </form>
  )
}
