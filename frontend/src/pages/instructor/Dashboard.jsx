import { useEffect, useState } from 'react'
import PageContainer from '../../components/PageContainer.jsx'
import Sidebar from '../../components/Sidebar.jsx'
import { apiFetch } from '../../api/client.js'

function StatCard({ label, value, accent }) {
  const bg = {
    indigo: "from-indigo-100 via-indigo-50 to-white dark:from-indigo-800 dark:via-slate-900",
    emerald: "from-emerald-100 via-emerald-50 to-white dark:from-emerald-800 dark:via-slate-900",
    blue: "from-blue-100 via-blue-50 to-white dark:from-blue-800 dark:via-slate-900",
    rose: "from-rose-100 via-rose-50 to-white dark:from-rose-800 dark:via-slate-900"
  }[accent];
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${bg} p-5 shadow-xl text-center`}>
      <div className="text-2xl font-bold tracking-tight">{value}</div>
      <div className="mt-1 text-base text-slate-500">{label}</div>
    </div>
  )
}

export default function InstructorDashboard() {
  const [students, setStudents] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [topics, setTopics] = useState([])
  const [heatmap, setHeatmap] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ avgMastery: 0, quizzes: 0, learners: 0, flagged: 0 })
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        // Fetch all students (as admin); update endpoint to your API
        const users = await apiFetch('/api/admin/students')
        setStudents(users)
        // Example assumes students have mastery by topics; flat topics array
        let topicSet = new Set()
        users.forEach(u => {
          if (u.learnerProfile && u.learnerProfile.topics) Object.keys(u.learnerProfile.topics).forEach(t=>topicSet.add(t))
        })
        const topicArr = Array.from(topicSet)
        setTopics(topicArr)
        // Build heatmap: students × topics matrix, value = mastery %
        const matrix = users.map(u => topicArr.map(topic => {
          const rec = u.learnerProfile?.topics?.[topic] || { mastery: 0 }
          return Math.round((rec.mastery||0)*100)/100
        }))
        setHeatmap(matrix)
        // Stat tiles
        const learners = users.length
        // Fetch all quizzes assigned (replace endpoint if needed)
        let quizzesData
        try { quizzesData = await apiFetch('/api/quizzes?status=published&limit=200') } catch { quizzesData = [] }
        setQuizzes(quizzesData)
        const allMasteries = users.flatMap(u => Object.values(u.learnerProfile?.topics||{}).map(m=>+m.mastery||0)).filter(Boolean)
        const avgMastery = allMasteries.length ? Math.round((allMasteries.reduce((a,c)=>a+c,0)/allMasteries.length)) : 0
        setStats({
          avgMastery,
          quizzes: quizzesData.length,
          learners,
          flagged: users.filter(u=>Object.values(u.learnerProfile?.topics||{}).some(m=>+m.mastery < 50)).length
        })
      } catch (e) {
        setError('Failed to load class/cohort data.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1">
        <PageContainer>
          <div className="mb-7 grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard label="Avg. Mastery" value={stats.avgMastery+'%'} accent="indigo" />
            <StatCard label="Quizzes Assigned" value={stats.quizzes} accent="emerald" />
            <StatCard label="Active Learners" value={stats.learners} accent="blue" />
            <StatCard label="Flagged Students" value={stats.flagged} accent="rose" />
          </div>
          <section className="mb-10">
            <div className="mb-2 text-xl font-medium">Cohort Mastery Heatmap</div>
            {topics.length && students.length ? (
            <div className="overflow-x-auto">
              <table className="rounded-xl border bg-slate-50 shadow-lg dark:bg-slate-900 min-w-[600px]">
                <thead>
                  <tr>
                    <th className="p-3 font-medium text-left">Student</th>
                    {topics.map(topic=>(<th key={topic} className="p-3 font-medium text-center">{topic}</th>))}
                  </tr>
                </thead>
                <tbody>
                  {students.map((u,i) => (
                    <tr key={u._id||u.name} className="border-t border-slate-200 dark:border-slate-800">
                      <td className="p-3 font-medium">{u.name}</td>
                      {topics.map((_,j) => (
                        <td key={j} className={`p-2 text-center font-bold rounded ${
                          heatmap[i]?.[j] > 80 ? 'bg-green-400/30 text-green-700' :
                          heatmap[i]?.[j] > 60 ? 'bg-yellow-200/40 text-amber-700' :
                          heatmap[i]?.[j] > 0 ? 'bg-rose-200/40 text-rose-700' :
                          'bg-gray-200/50 text-gray-500'
                        }`}>{heatmap[i]?.[j]||0}%</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            ) : <div className="text-slate-400">No cohort or mastery data.</div>}
          </section>
          <section>
            <div className="mb-2 flex items-center justify-between">
              <div className="text-xl font-medium">Learner Analytics</div>
              <button className="rounded bg-rose-50 px-3 py-1 text-base text-rose-600 shadow hover:bg-rose-100">Report Issue</button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[470px] w-full text-sm rounded bg-white shadow-lg dark:bg-slate-900">
                <thead>
                  <tr className="text-slate-600 dark:text-slate-200">
                    <th className="p-3 font-medium text-left">Student</th>
                    <th className="p-3 font-medium text-left">Avg Mastery</th>
                    <th className="p-3 font-medium text-left">Flag</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((u,i)=> {
                    const allMasteries = Object.values(u.learnerProfile?.topics||{}).map(m=>+m.mastery||0)
                    const avg = allMasteries.length ? Math.round((allMasteries.reduce((a,b)=>a+b,0)/allMasteries.length)) : 0
                    const flagged = allMasteries.some(m=>m<50)
                    return (
                    <tr key={u._id||u.name} className="border-t border-slate-200 dark:border-slate-800 hover:bg-indigo-50/40 dark:hover:bg-indigo-900/20 transition-all">
                      <td className="p-3">{u.name}</td>
                      <td className="p-3">{avg}%</td>
                      <td className="p-3">{flagged && <span className="rounded bg-rose-600/20 px-2 py-1 text-xs font-semibold text-rose-800">Low</span>}</td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
            {error && <div className="text-rose-600 mt-2">{error}</div>}
          </section>
          <section className="mt-10">
            <div className="mb-2 text-xl font-medium">Quiz Builder (AI & Manual)</div>
            <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">[Quiz builder UI will go here]</div>
          </section>
        </PageContainer>
      </main>
    </div>
  )
}
