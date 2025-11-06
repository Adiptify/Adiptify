import { useEffect, useState } from 'react'
import { apiFetch } from '../api/client.js'

export default function AdminDashboard() {
  const [quizzes, setQuizzes] = useState([])
  const [status, setStatus] = useState('')

  async function load() {
    const q = await apiFetch(`/api/quizzes${status?`?status=${encodeURIComponent(status)}`:''}`)
    setQuizzes(q)
  }

  useEffect(() => { load().catch(()=>{}) }, [status])

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Admin Portal</h2>
      <div className="flex items-center gap-2">
        <label className="text-sm">Filter</label>
        <select className="rounded border border-slate-300 bg-transparent px-2 py-1 text-sm dark:border-slate-700" value={status} onChange={e=>setStatus(e.target.value)}>
          <option value="">All</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-2">Topic</th>
              <th className="p-2">Status</th>
              <th className="p-2">Items</th>
              <th className="p-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {quizzes.map(q => (
              <tr key={q._id} className="border-t border-slate-200 dark:border-slate-800">
                <td className="p-2">{q.topic}</td>
                <td className="p-2">{q.status}</td>
                <td className="p-2">{q.linkedItemIds?.length || 0}</td>
                <td className="p-2">{new Date(q.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


