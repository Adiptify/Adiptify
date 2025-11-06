import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import Navbar from './components/Navbar.jsx'
import Sidebar from './components/Sidebar.jsx'
import StudentDashboard from './pages/student/Dashboard.jsx'
import PageContainer from './components/PageContainer.jsx'
import Home from './pages/Home.jsx'
import Register from './pages/Register.jsx'
import Login from './pages/Login.jsx'

function ProtectedRoute({ roles, children }) {
  const { token, user } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  if (roles && (!user || !roles.includes(user.role))) return <Navigate to="/" replace />
  return children
}

function DashboardLayout({ children }) {
  return (
    <div>
      <Navbar />
      <div className="flex w-full">
        <Sidebar />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function AppRouter() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute roles={["student"]}>
                <DashboardLayout>
                  <StudentDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          {/* Future: instructor/admin routes... */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
