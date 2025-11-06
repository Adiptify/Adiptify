import { useEffect, useRef, useState } from 'react'
import { apiFetch } from '../api/client.js'

export default function ChatPanel({ initialSystemContext = '', initialUserPrompt = '' }) {
  const [messages, setMessages] = useState(() => {
    const base = []
    if (initialSystemContext) base.push({ role: 'system', content: initialSystemContext })
    if (initialUserPrompt) base.push({ role: 'user', content: initialUserPrompt })
    return base
  })
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const scrollerRef = useRef(null)

  useEffect(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight
    }
  }, [messages])

  async function send(text) {
    const content = (text ?? input).trim()
    if (!content) return
    const next = [...messages, { role: 'user', content }]
    setMessages(next)
    setInput('')
    setSending(true)
    try {
      // Basic non-streaming fallback
      const res = await apiFetch('/api/chat', { method: 'POST', body: { messages: next } })
      const reply = res?.message?.content || res?.content || ''
      setMessages([...next, { role: 'assistant', content: reply }])
    } catch (e) {
      setMessages([...next, { role: 'assistant', content: 'Sorry, something went wrong.' }])
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex h-[520px] flex-col rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
      <div ref={scrollerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`max-w-[85%] rounded-xl px-4 py-3 text-sm ${m.role === 'user' ? 'ml-auto bg-indigo-600 text-white' : m.role==='system' ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300' : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200'}`}>
            {m.content}
          </div>
        ))}
      </div>
      <div className="border-t border-slate-200 p-3 dark:border-slate-800">
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 bg-transparent"
            placeholder="Ask a question..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') send() }}
            disabled={sending}
          />
          <button onClick={() => send()} disabled={sending} className="rounded-lg bg-indigo-600 px-4 py-2 text-white disabled:opacity-50">Send</button>
        </div>
      </div>
    </div>
  )
}




