import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from './AuthLayout'
import Field from '../../components/Field'

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [notice, setNotice] = useState('')

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    setNotice('Authentication is not connected yet. Use "Explore the app" from the home page for now.')
  }

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Access your timetable, attendance, and dashboards."
      footer={
        <>
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo hover:text-indigo-dark">Register</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Field
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@college.edu"
          required
        />
        <Field
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          required
        />

        {notice && (
          <p className="rounded-md bg-amber-soft px-3 py-2 text-sm text-amber">{notice}</p>
        )}

        <button
          type="submit"
          className="rounded-md bg-indigo px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-dark hover:shadow-md"
        >
          Sign in
        </button>
      </form>
    </AuthLayout>
  )
}

export default Login