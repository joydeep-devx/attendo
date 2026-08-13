import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from './AuthLayout'
import Field from '../../components/Field'
import RoleSelector from '../../components/RoleSelector'

const initialFormState = {
  role: 'student',
  name: '',
  email: '',
  password: '',
  studentRollNo: '',
  department: '',
  semester: '',
  section: '',
}

function Register() {
  const [formData, setFormData] = useState(initialFormState)
  const [notice, setNotice] = useState('')

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  function handleRoleChange(role) {
    setFormData((prev) => ({ ...prev, role }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    setNotice('Registration is not connected yet. Use "Explore the app" from the home page for now.')
  }

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Register as a student to view your timetable and attendance."
      footer={
        <>
          Already registered?{' '}
          <Link to="/login" className="text-indigo hover:text-indigo-dark">Sign in</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <RoleSelector value={formData.role} onChange={handleRoleChange} />

        <Field label="Full name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. A. Sharma" required />
        <Field label="Email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@college.edu" required />

        <div className="grid grid-cols-2 gap-4">
          <Field label="Roll number" name="studentRollNo" value={formData.studentRollNo} onChange={handleChange} placeholder="e.g. 2201234" required />
          <Field label="Department" name="department" value={formData.department} onChange={handleChange} placeholder="e.g. CSE" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Semester" name="semester" type="number" min="1" max="8" value={formData.semester} onChange={handleChange} placeholder="1–8" required />
          <Field label="Section" name="section" value={formData.section} onChange={handleChange} placeholder="e.g. A" required />
        </div>

        <Field label="Password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="At least 8 characters" minLength={8} required />

        {notice && (
          <p className="rounded-md bg-amber-soft px-3 py-2 text-sm text-amber">{notice}</p>
        )}

        <button
          type="submit"
          className="rounded-md bg-indigo px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-dark hover:shadow-md"
        >
          Create account
        </button>
      </form>
    </AuthLayout>
  )
}

export default Register