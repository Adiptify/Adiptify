import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { apiFetch } from '../api/client.js'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [studentId, setStudentId] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    if (!studentId) return setError('Student ID (Roll No) is required')
    try {
      await apiFetch('/api/auth/register', { method: 'POST', body: { name, email, password, studentId, role: 'student' } })
      navigate('/login')
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="mx-auto max-w-sm py-10">
      <h2 className="mb-4 text-lg font-semibold">Student Registration</h2>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 bg-transparent" placeholder="Student Name" value={name} onChange={e=>setName(e.target.value)} />
        <input className="w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 bg-transparent" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input type="password" className="w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 bg-transparent" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <input className="w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 bg-transparent" placeholder="Student ID (Roll No)" value={studentId} onChange={e=>setStudentId(e.target.value)} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="w-full rounded bg-slate-900 px-3 py-2 text-white dark:bg-slate-100 dark:text-slate-900">Register as Student</button>
      </form>
      <p className="mt-3 text-sm">Already a student? <Link className="underline" to="/login">Login</Link></p>
    </div>
  )
}


