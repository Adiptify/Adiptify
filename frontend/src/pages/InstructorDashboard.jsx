import { useEffect, useState } from 'react'
import { apiFetch } from '../api/client.js'

export default function InstructorDashboard() {
  const [topic, setTopic] = useState('Algebra: Linear Equations')
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  async function load() {
    const data = await apiFetch('/api/quizzes?status=published&limit=20')
    setQuizzes(data)
  }

  useEffect(() => { load().catch(()=>{}) }, [])

  async function generate() {
    setLoading(true); setMsg('')
    try {
      const res = await apiFetch('/api/ai/generate', { method: 'POST', body: { topic, levels: { easy: 2, medium: 2, hard: 1 }, saveToBank: true } })
      setMsg(`Generated quiz ${res.generatedQuizId}`)
      await load()
    } catch (e) { setMsg(e.message) } finally { setLoading(false) }
  }

  async function publish(id) {
    setLoading(true); setMsg('')
    try { await apiFetch(`/api/ai/publish/${id}`, { method: 'POST' }); setMsg('Published'); await load() } catch (e) { setMsg(e.message) } finally { setLoading(false) }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Instructor Portal</h2>
      <div className="flex gap-2">
        <input className="w-full max-w-md rounded border border-slate-300 px-3 py-2 dark:border-slate-700 bg-transparent" value={topic} onChange={e=>setTopic(e.target.value)} />
        <button disabled={loading} onClick={generate} className="rounded bg-green-600 px-3 py-2 text-white disabled:opacity-50">Generate & Publish</button>
      </div>
      {msg && <p className="text-sm">{msg}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        {quizzes.map(q => (
          <div key={q._id} className="rounded border border-slate-200 p-4 dark:border-slate-800">
            <div className="text-sm text-slate-500">{new Date(q.createdAt).toLocaleString()}</div>
            <div className="font-medium">{q.topic}</div>
            <div className="text-xs">Items: {q.linkedItemIds?.length || 0}</div>
            <div className="mt-2 flex gap-2">
              <a className="underline text-sm" href={`/api/ai/generated/${q._id}`} target="_blank">View JSON</a>
              {(!q.linkedItemIds || q.linkedItemIds.length===0) && <button disabled={loading} onClick={()=>publish(q._id)} className="rounded border px-2 text-sm dark:border-slate-700">Publish</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


