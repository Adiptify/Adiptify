import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageContainer from '../../components/PageContainer.jsx'
import Sidebar from '../../components/Sidebar.jsx'
import { apiFetch } from '../../api/client.js'

export default function Quizzes() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch('/api/quiz/sessions?limit=20')
        setSessions(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const [showQuizModal, setShowQuizModal] = useState(false)
  const [quizConfig, setQuizConfig] = useState({ topic: '', questionCount: 5, difficulty: 'medium', mode: 'formative' })
  const [error, setError] = useState('')

  async function startNew() {
    if (!quizConfig.topic.trim()) {
      setError('Please enter a topic')
      return
    }
    try {
      setError('')
      const difficultyMap = { easy: [1,2], medium: [2,3], hard: [4,5] }
      const levels = { easy: 0, medium: 0, hard: 0 }
      if (quizConfig.difficulty === 'easy') levels.easy = quizConfig.questionCount
      else if (quizConfig.difficulty === 'hard') levels.hard = quizConfig.questionCount
      else levels.medium = quizConfig.questionCount
      
      await apiFetch('/api/ai/generate', {
        method: 'POST',
        body: { topic: quizConfig.topic, levels, saveToBank: true }
      })
      
      const session = await apiFetch('/api/quiz/start', {
        method: 'POST',
        body: {
          mode: quizConfig.mode,
          requestedTopics: [quizConfig.topic],
          limit: quizConfig.questionCount,
          difficulty: difficultyMap[quizConfig.difficulty]
        }
      })
      sessionStorage.setItem('session', JSON.stringify(session))
      setShowQuizModal(false)
      navigate('/quiz')
    } catch (e) {
      setError('Failed to start quiz: ' + e.message)
    }
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1">
        <PageContainer>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-3xl font-semibold">My Quizzes</h2>
            <button onClick={() => setShowQuizModal(true)} className="rounded-lg bg-gradient-to-r from-indigo-600 to-emerald-500 px-6 py-3 font-bold text-white shadow hover:brightness-105">Start New Quiz</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm rounded-xl bg-slate-50 shadow-lg dark:bg-slate-900">
              <thead>
                <tr className="text-slate-600 dark:text-slate-200">
                  <th className="p-3 font-medium text-left">Date</th>
                  <th className="p-3 font-medium text-left">Mode</th>
                  <th className="p-3 font-medium text-left">Score</th>
                  <th className="p-3 font-medium text-left">Status</th>
                  <th className="p-3 font-medium text-left">Items</th>
                  <th className="p-3 font-medium text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map(s => (
                  <tr key={s._id} className="border-t border-slate-200 dark:border-slate-800 hover:bg-indigo-50/40 dark:hover:bg-indigo-900/20">
                    <td className="p-3">{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td className="p-3 capitalize">{s.mode}</td>
                    <td className="p-3 font-bold">{s.score || '-'}%</td>
                    <td className="p-3">
                      <span className={`rounded px-2 py-1 text-xs ${s.status === 'completed' ? 'bg-green-100 text-green-700' : s.status === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="p-3">{s.itemIds?.length || 0}</td>
                    <td className="p-3">
                      {s.status === 'active' && (
                        <button onClick={() => {
                          sessionStorage.setItem('session', JSON.stringify(s))
                          navigate('/quiz')
                        }} className="rounded bg-indigo-600 px-3 py-1 text-xs text-white">Continue</button>
                      )}
                      {s.status === 'completed' && (
                        <button className="rounded border px-3 py-1 text-xs">View Results</button>
                      )}
                    </td>
                  </tr>
                ))}
                {!loading && sessions.length === 0 && <tr><td colSpan={6} className="text-center text-slate-400 py-6">No quizzes yet. Start one!</td></tr>}
              </tbody>
            </table>
          </div>
        </PageContainer>
      </main>
      {showQuizModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-2xl bg-white p-8 shadow-2xl dark:bg-slate-900 w-full max-w-md">
            <h3 className="mb-4 text-xl font-semibold">Configure Quiz</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Topic *</label>
                <input
                  className="w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 bg-transparent"
                  placeholder="e.g., Machine Learning, Algebra, Geometry"
                  value={quizConfig.topic}
                  onChange={e => setQuizConfig({...quizConfig, topic: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Number of Questions</label>
                <input
                  type="number"
                  min="3"
                  max="20"
                  className="w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 bg-transparent"
                  value={quizConfig.questionCount}
                  onChange={e => setQuizConfig({...quizConfig, questionCount: parseInt(e.target.value) || 5})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Difficulty</label>
                <select
                  className="w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 bg-transparent"
                  value={quizConfig.difficulty}
                  onChange={e => setQuizConfig({...quizConfig, difficulty: e.target.value})}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mode</label>
                <select
                  className="w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 bg-transparent"
                  value={quizConfig.mode}
                  onChange={e => setQuizConfig({...quizConfig, mode: e.target.value})}
                >
                  <option value="formative">Formative</option>
                  <option value="diagnostic">Diagnostic</option>
                  <option value="summative">Summative</option>
                </select>
              </div>
              {error && <div className="text-sm text-red-600">{error}</div>}
              <div className="flex gap-3">
                <button onClick={startNew} className="flex-1 rounded bg-indigo-600 px-4 py-2 font-medium text-white">Start Quiz</button>
                <button onClick={() => { setShowQuizModal(false); setError('') }} className="rounded border px-4 py-2">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

