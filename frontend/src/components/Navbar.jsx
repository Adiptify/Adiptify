import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Navbar() {
  const { user, setToken, setUser } = useAuth()
  const role = user?.role || 'student'
  
  return (
    <nav className="sticky top-0 z-30 mb-6 flex h-16 items-center justify-between rounded-b-xl bg-white/90 px-6 pb-1 pt-2 shadow-md shadow-slate-200/40 ring-1 ring-black/5 dark:bg-slate-900/95 dark:shadow-none dark:ring-slate-800 backdrop-blur">
      <div className="flex items-center gap-6 text-lg font-bold text-indigo-600 dark:text-emerald-400">
        <Link to="/" className="rounded-lg px-2 py-1 transition hover:bg-indigo-50">Adiptify</Link>
      </div>
      {role === 'student' && (
        <div className="hidden gap-5 md:flex text-gray-700 dark:text-slate-100">
          <NavLink to="/student/dashboard" className={({isActive})=>isActive?"font-semibold text-indigo-700 dark:text-emerald-400 underline underline-offset-4":"hover:underline"}>Dashboard</NavLink>
          <NavLink to="/student/learning" className={({isActive})=>isActive?"font-semibold text-indigo-700 dark:text-emerald-400 underline underline-offset-4":"hover:underline"}>Learning</NavLink>
          <NavLink to="/student/quizzes" className={({isActive})=>isActive?"font-semibold text-indigo-700 dark:text-emerald-400 underline underline-offset-4":"hover:underline"}>Quizzes</NavLink>
          <NavLink to="/student/performance" className={({isActive})=>isActive?"font-semibold text-indigo-700 dark:text-emerald-400 underline underline-offset-4":"hover:underline"}>Performance</NavLink>
          <NavLink to="/student/chat" className={({isActive})=>isActive?"font-semibold text-indigo-700 dark:text-emerald-400 underline underline-offset-4":"hover:underline"}>Chat</NavLink>
          <NavLink to="/student/profile" className={({isActive})=>isActive?"font-semibold text-indigo-700 dark:text-emerald-400 underline underline-offset-4":"hover:underline"}>Profile</NavLink>
        </div>
      )}
      {(role === 'instructor' || role === 'admin') && (
        <div className="hidden gap-5 md:flex text-gray-700 dark:text-slate-100">
          <NavLink to={role === 'instructor' ? '/instructor' : '/admin'} className={({isActive})=>isActive?"font-semibold text-indigo-700 dark:text-emerald-400 underline underline-offset-4":"hover:underline"}>
            {role === 'instructor' ? 'Instructor Dashboard' : 'Admin Dashboard'}
          </NavLink>
        </div>
      )}
      <div className="flex items-center gap-3">
        {user && <span className="rounded bg-slate-100 px-2 py-1 text-xs font-medium dark:bg-slate-800">{user.role}</span>}
        {user && <button onClick={()=>{setToken('');setUser(null)}} className="rounded bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600 shadow hover:bg-rose-100 dark:bg-slate-700 dark:text-rose-400">Logout</button>}
      </div>
    </nav>
  )
}
