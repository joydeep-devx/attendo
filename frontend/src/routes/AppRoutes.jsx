import { Routes, Route } from 'react-router-dom'
import Dashboard from '../pages/Dashboard/Dashboard'
import Subjects from '../pages/Subjects/Subjects'
import SubjectForm from '../pages/Subjects/SubjectForm'
import Teachers from '../pages/Teachers/Teachers'


function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/subjects" element={<Subjects />} />
      <Route path="/subjects/new" element={<SubjectForm />} />
      <Route path="/teachers" element={<Teachers />} />

    </Routes>
  )
}

export default AppRoutes