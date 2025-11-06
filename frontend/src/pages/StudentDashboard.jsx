import { useEffect, useState } from 'react'
import { apiFetch } from '../api/client.js'

export default function StudentDashboard() {
  const [active, setActive] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    apiFetch('/api/quiz/active').then(setActive).catch(()=>{})
  }, [])

  async function startQuiz() {
    setError('')
    try {
      const res = await apiFetch('/api/quiz/start', { method: 'POST', body: { mode: 'formative', requestedTopics: ['Arithmetic'], limit: 3 } })
      setActive(res)
      try { sessionStorage.setItem('session', JSON.stringify(res)) } catch {}
    } catch (e) { setError(e.message) }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Student Dashboard</h2>
      <p className="text-sm text-slate-600 dark:text-slate-400">Start a quick formative quiz to begin.</p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!active && <button onClick={startQuiz} className="rounded bg-blue-600 px-3 py-2 text-white">Start Quiz</button>}
      {active && (
        <div className="rounded border border-slate-200 p-4 dark:border-slate-800">
          <p className="text-sm">Session: {active.sessionId}</p>
          <a href="/quiz" className="mt-2 inline-block rounded bg-slate-900 px-3 py-1 text-white dark:bg-slate-100 dark:text-slate-900">Continue Quiz</a>
        </div>
      )}
    </div>
  )
}


