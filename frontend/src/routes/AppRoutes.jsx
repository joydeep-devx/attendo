import { Routes, Route } from 'react-router-dom'
import Dashboard from '../pages/Dashboard/Dashboard'
import Subjects from '../pages/Subjects/Subjects'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/subjects" element={<Subjects />} />
    </Routes>
  )
}

export default AppRoutes