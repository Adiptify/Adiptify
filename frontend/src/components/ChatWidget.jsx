import { useState, useRef, useEffect } from 'react'
import { apiFetch } from '../api/client.js'

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '👋 I am your AI Tutor! Ask me about quizzes, results, or anything learning-related.' },
  ])
  const [streaming, setStreaming] = useState(false)
  const messagesEndRef = useRef()

  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, open])

  async function sendMessage(e) {
    e.preventDefault()
    if (!input.trim()) return
    const userMsg = { role: 'user', content: input }
    setMessages(msgs => [...msgs, userMsg])
    setInput('')

    setStreaming(true)
    let assistantMsg = { role: 'assistant', content: '' }
    setMessages(msgs => [...msgs, assistantMsg])
    try {
      // Streaming fetch to backend
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(localStorage.token ? { Authorization: 'Bearer ' + localStorage.token } : {}) },
        body: JSON.stringify({ message: input, context: {} }),
      })
      if (!response.body) throw new Error('No stream from backend')
      const reader = response.body.getReader()
      let text = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        text += new TextDecoder().decode(value)
        // Expect server just to stream the assistant's text directly (simple protocol), update as it comes in
        assistantMsg.content = text
        setMessages(msgs => {
          const arr = [...msgs]
          arr[arr.length-1] = { ...assistantMsg }
          return arr
        })
      }
      setStreaming(false)
    } catch (e) {
      setStreaming(false)
      assistantMsg.content = '(AI failed to respond: ' + e.message + ')'
      setMessages(msgs => {
        const arr = [...msgs]
        arr[arr.length-1] = { ...assistantMsg }
        return arr
      })
    }
  }

  // Escape key closes modal
  useEffect(() => {
    function handler(e) { if (e.key === 'Escape') setOpen(false) }
    if (open) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  return (
    <>
      <button
        className="fixed bottom-7 right-7 z-50 flex items-center gap-2 rounded-full bg-gradient-to-tr from-indigo-600 to-emerald-400 px-6 py-3 text-lg font-semibold text-white shadow-xl hover:scale-105 transition-all"
        onClick={() => setOpen(true)}
        aria-label="Open AI Tutor Chat"
      >
        <svg width="22" height="22" fill="none" viewBox="0 0 22 22"><circle cx="11" cy="11" r="11" fill="currentColor" className="text-emerald-300 opacity-25"/><path fill="currentColor" d="M16 7a5 5 0 1 1-2.048 9.597c-.241-.207-.46-.376-.741-.659l-.003-.001-1.225-1.304C8.892 13.42 7.708 11.78 8.09 10.044c.235-1.036.916-1.829 1.782-2.235C10.285 7.337 10.55 7.15 11 7.058c.199-.04.285-.044.397-.001C11.799 7.149 13.23 8.397 15 11.213V7Z"/></svg>
        AI Tutor
      </button>
      {open && (
      <div className="fixed inset-0 z-50 flex items-end justify-end">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={()=>setOpen(false)}></div>
        <div className="relative mb-7 mr-7 w-full max-w-lg overflow-hidden rounded-2xl bg-white/95 shadow-2xl ring-1 ring-slate-900/10 dark:bg-slate-900/95 dark:ring-slate-800 flex flex-col" style={{height: '600px'}}>
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-semibold text-lg">AI Tutor Chat</h3>
            <button className="text-slate-400 hover:text-rose-500 text-2xl leading-none" aria-label="Close chat" onClick={()=>setOpen(false)}>&times;</button>
          </div>
          <div className="px-4 pt-4 pb-16 flex-1 overflow-y-auto flex flex-col gap-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-xl px-4 py-2 shadow ${m.role === 'user' ? 'bg-indigo-50 text-slate-900 dark:bg-indigo-900/30' : 'bg-emerald-50 text-emerald-900 dark:bg-slate-800/70'} text-base`}>
                  <MessageContent content={m.content} />
                  {streaming && i === messages.length-1 && <Blink />}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef}></div>
          </div>
          <form className="absolute bottom-0 left-0 flex w-full gap-2 border-t border-slate-200 dark:border-slate-800 bg-white/80 p-2 dark:bg-slate-900/80" onSubmit={sendMessage}>
            <input
              className="flex-1 rounded-lg bg-slate-100 px-3 py-2 text-base shadow ring-1 ring-black/5 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-slate-800 dark:ring-slate-700 dark:text-white"
              value={input}
              onChange={e=>setInput(e.target.value)}
              placeholder="Ask something..."
              disabled={streaming}
              autoFocus
            />
            <button className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white shadow hover:brightness-105 focus:ring-2 focus:ring-indigo-400" disabled={streaming}>{streaming ? '...' : 'Send'}</button>
          </form>
        </div>
      </div>
      )}
    </>
  )
}

function MessageContent({ content }) {
  // Simple markdown renderer for **bold**, *italic*, etc.
  let html = content
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-slate-200 dark:bg-slate-700 px-1 rounded">$1</code>')
    .replace(/\n/g, '<br />')
  return <div dangerouslySetInnerHTML={{ __html: html }} />
}

function Blink() {
  const [on, setOn] = useState(true)
  useEffect(() => { const i = setInterval(()=>setOn(v=>!v), 500); return () => clearInterval(i) }, [])
  return <b className="inline-block w-2">{on ? "|" : " "}</b>
}
