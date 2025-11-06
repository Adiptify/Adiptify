import { useEffect, useState } from 'react'
import PageContainer from '../../components/PageContainer.jsx'
import Sidebar from '../../components/Sidebar.jsx'
import { apiFetch } from '../../api/client.js'

export default function Learning() {
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function load() {
      try {
        const me = await apiFetch('/api/auth/me')
        const topicMap = me.learnerProfile?.topics || {}
        const masteryObj = topicMap instanceof Map ? Object.fromEntries(topicMap) : (typeof topicMap === 'object' ? topicMap : {})
        setTopics(Object.keys(masteryObj).map(topic => ({
          name: topic,
          mastery: Math.round((masteryObj[topic]?.mastery || 0) * 100),
          attempts: masteryObj[topic]?.attempts || 0,
          streak: masteryObj[topic]?.streak || 0
        })))
      } catch (e) {
        console.error(e)
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
          <h2 className="mb-6 text-3xl font-semibold">Learning Modules</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {topics.map(topic => (
              <div key={topic.name} className="rounded-xl border border-slate-200 p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
                <h3 className="mb-2 text-lg font-semibold">{topic.name}</h3>
                <div className="space-y-2 text-sm">
                  <div>Mastery: <span className="font-bold">{topic.mastery}%</span></div>
                  <div>Attempts: {topic.attempts}</div>
                  <div>Streak: {topic.streak}</div>
                  <button className="mt-3 w-full rounded bg-indigo-600 px-4 py-2 text-white hover:brightness-105">Start Learning</button>
                </div>
              </div>
            ))}
            {!loading && topics.length === 0 && <div className="col-span-full text-center text-slate-400 py-12">No learning topics yet. Start a quiz to begin!</div>}
          </div>
        </PageContainer>
      </main>
    </div>
  )
}

