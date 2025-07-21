import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider, createBrowserRouter, createRoutesFromElements, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import SignUp from './components/SignUp'
import PatientDashboard from './components/PatientDashboard'
import RoleBasedDashboard from './components/RoleBasedDashboard'
import ForgotPassword from './components/ForgotPassword'
import ResetPassword from './components/ResetPassword'
import DoctorDashboard from './components/DoctorDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import { ToastProvider } from './contexts/ToastContext'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path='/' element={<Navigate to="/dashboard" replace />} />
      <Route path='/login' element={<Login />} />
      <Route path='/signup' element={<SignUp />} />
      <Route path='/forgotpass' element={<ForgotPassword />} />
      <Route path='/resetpassword/:token' element={<ResetPassword />} />

      {/* Protected Routes */}
      <Route path='/dashboard' element={<ProtectedRoute><RoleBasedDashboard /></ProtectedRoute>} />
      <Route path='/dashboard/patient' element={<ProtectedRoute><PatientDashboard /></ProtectedRoute>} />
      <Route path='/dashboard/doctor' element={<ProtectedRoute><DoctorDashboard /></ProtectedRoute>} />

      {/* Admin Routes */}
      <Route path='/admin' element={<ProtectedRoute><DoctorDashboard /></ProtectedRoute>} />
    </Route>
  )
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  </StrictMode>,
)