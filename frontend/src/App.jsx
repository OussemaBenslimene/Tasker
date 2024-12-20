import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'

import Board from './pages/Boards/_id'
import NotFound from './pages/404/NotFound'
import Welcome from './pages/Welcome/Welcome'
import LoginForm from './pages/Auth/LoginForm'
import RegisterForm from './pages/Auth/RegisterForm'
import AccountVerification from '~/pages/Auth/AccountVerification'
import Settings from '~/pages/Settings/Settings'
import Boards from '~/pages/Boards'

const ProtectedRoute = ({ user }) => {
  if (!user) return <Navigate to='/welcome' replace={true} />
  return <Outlet />
}

const PublicRoute = ({ user }) => {
  if (user) return <Navigate to='/' replace={true} />
  return <Outlet />
}

function App() {
  const currentUser = useSelector(selectCurrentUser)

  return (
    <Routes>
      <Route path='/' element={<Navigate to="/boards" replace={true} />} />

      <Route element={<ProtectedRoute user={currentUser} />}>

        <Route path='/boards/:boardId' element={<Board />} />
        <Route path='/boards' element={<Boards />} />

        <Route path='/settings/account' element={<Settings />} />
        <Route path='/settings/security' element={<Settings />} />
      </Route>

      <Route element={<PublicRoute user={currentUser} />}>
        <Route path='/welcome' element={<Welcome />} />
        <Route path='/login' element={<LoginForm />} />
        <Route path='/register' element={<RegisterForm />} />
        <Route path='/account/verification' element={<AccountVerification />} />
      </Route>

      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}

export default App
