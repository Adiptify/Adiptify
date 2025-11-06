import { useEffect, useState } from 'react'
import PageContainer from '../../components/PageContainer.jsx'
import Sidebar from '../../components/Sidebar.jsx'
import ChatWidget from '../../components/ChatWidget.jsx'
import { apiFetch } from '../../api/client.js'

export default function StudentDashboard() {
  const [mastery, setMastery] = useState({})
  const [topics, setTopics] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showQuizModal, setShowQuizModal] = useState(false)
  const [quizConfig, setQuizConfig] = useState({ topic: '', questionCount: 5, difficulty: 'medium', mode: 'formative' })

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        // Get user and learnerProfile topics
        const me = await apiFetch('/api/auth/me')
        const topicMap = me.learnerProfile?.topics || {}
        // Convert Map-like structure to object if needed
        const masteryObj = topicMap instanceof Map ? Object.fromEntries(topicMap) : (typeof topicMap === 'object' ? topicMap : {})
        setMastery(masteryObj)
        setTopics(Object.keys(masteryObj))
        // Fetch last 5 completed quiz sessions
        let sessions = []
        if (me._id) {
          try {
            // Assume an API endpoint returns sessions for the current user
            sessions = await apiFetch(`/api/quiz/sessions?status=completed&limit=5`)
          } catch (e) { /* backend may not have this endpoint yet */ }
        }
        setQuizzes((sessions && sessions.length) ? sessions.map(s=>({
          id: s._id,
          topic: s.topics?.[0] || '-',
          score: s.score,
          difficulty: (s.metadata?.rulesUsed?.difficultyBuckets || []).join(', ') || '-',
          time: s.completedAt ? Math.round((new Date(s.completedAt) - new Date(s.startedAt))/60000)+"min" : '-',
          date: s.completedAt ? new Date(s.completedAt).toLocaleDateString() : '-',
        })) : [])
      } catch (e) {
        setError('Failed to load data. ' + (e.message||''))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleStartQuiz() {
    if (!quizConfig.topic.trim()) {
      setError('Please enter a topic')
      return
    }
    try {
      setError('')
      // First, ensure items exist for this topic - generate if needed
      const difficultyMap = { easy: [1,2], medium: [2,3], hard: [4,5] }
      const levels = { easy: 0, medium: 0, hard: 0 }
      if (quizConfig.difficulty === 'easy') levels.easy = quizConfig.questionCount
      else if (quizConfig.difficulty === 'hard') levels.hard = quizConfig.questionCount
      else levels.medium = quizConfig.questionCount
      
      // Generate quiz items if needed
      await apiFetch('/api/ai/generate', {
        method: 'POST',
        body: { topic: quizConfig.topic, levels, saveToBank: true }
      })
      
      // Now start the quiz with the specified config
      const session = await apiFetch('/api/quiz/start', {
        method: 'POST',
        body: {
          mode: quizConfig.mode,
          requestedTopics: [quizConfig.topic],
          limit: quizConfig.questionCount,
          difficulty: difficultyMap[quizConfig.difficulty]
        },
      })
      sessionStorage.setItem('session', JSON.stringify(session))
      setShowQuizModal(false)
      window.location.href = '/quiz'
    } catch (e) {
      setError('Failed to start quiz: ' + (e.message||''))
    }
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1">
        <PageContainer>
          <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <div className="text-3xl font-semibold tracking-tight">Welcome back, Student!</div>
              <div className="text-base text-slate-500">Here is your current mastery progress.</div>
            </div>
            <button onClick={() => setShowQuizModal(true)} className="mt-3 rounded-lg bg-gradient-to-r from-indigo-600 to-emerald-500 px-6 py-3 text-lg font-bold text-white shadow hover:brightness-105 transition">Start Quiz</button>
          </div>
          <section className="mb-8">
            <div className="mb-2 text-xl font-medium">Mastery Heatmap</div>
            <div className="flex gap-2 overflow-x-auto rounded-xl bg-slate-50 p-4 shadow-inner dark:bg-slate-800">
              {topics.length ? topics.map(topic => {
                const m = mastery[topic] || { mastery: 0, attempts: 0 }
                return (
                  <div key={topic} className="flex flex-col items-center gap-1 min-w-[90px]">
                    <div className={
                      `h-11 w-11 rounded-full border-2 transition-all flex items-center justify-center text-lg font-bold ${
                        m.mastery > 80 ? 'bg-green-400/40 text-green-700 border-green-300' :
                        m.mastery > 60 ? 'bg-yellow-200/40 text-amber-700 border-yellow-200' :
                        m.mastery > 0 ? 'bg-rose-200/40 text-rose-700 border-rose-200' :
                          'bg-gray-200/60 text-gray-400 border-gray-200'}
                    }`
                    } title={topic + ' mastery: ' + Math.round(m.mastery||0) + '% | Attempts: ' + (m.attempts||0)}>{Math.round(m.mastery || 0)}%</div>
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-300">{topic}</div>
                  </div>
                )
              }) : <div className="text-sm text-slate-400">No mastery data yet.</div>}
            </div>
          </section>
          <section>
            <div className="mb-2 text-xl font-medium">Recent Quiz Attempts</div>
            <div className="overflow-x-auto">
              <table className="min-w-[470px] w-full text-sm rounded-xl bg-slate-50 shadow-lg dark:bg-slate-900">
                <thead>
                  <tr className="text-slate-600 dark:text-slate-200">
                    <th className="p-3 font-medium text-left">Topic</th>
                    <th className="p-3 font-medium text-left">Score</th>
                    <th className="p-3 font-medium text-left">Difficulty</th>
                    <th className="p-3 font-medium text-left">Time</th>
                    <th className="p-3 font-medium text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {quizzes.map(q => (
                    <tr key={q.id} className="border-t border-slate-200 dark:border-slate-800 hover:bg-indigo-50/40 dark:hover:bg-indigo-900/20 transition-all">
                      <td className="p-3">{q.topic}</td>
                      <td className="p-3">{q.score}%</td>
                      <td className="p-3">{q.difficulty}</td>
                      <td className="p-3">{q.time}</td>
                      <td className="p-3">{q.date}</td>
                    </tr>
                  ))}
                  {!loading && quizzes.length === 0 && <tr><td colSpan={5} className="text-center text-slate-400 py-6">No recent quizzes found.</td></tr>}
                </tbody>
              </table>
              {loading && <div className="py-6 text-center text-slate-400">Loading…</div>}
              {error && <div className="text-red-600 py-3">{error}</div>}
            </div>
          </section>
        </PageContainer>
        <ChatWidget />
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
                <button onClick={handleStartQuiz} className="flex-1 rounded bg-indigo-600 px-4 py-2 font-medium text-white">Start Quiz</button>
                <button onClick={() => { setShowQuizModal(false); setError('') }} className="rounded border px-4 py-2">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
