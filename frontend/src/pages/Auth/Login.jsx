import { useState } from 'react'
import { Link , useNavigate} from 'react-router-dom'
import AuthLayout from './AuthLayout'
import Field from '../../components/Field'
import { useAuth } from '../../context/AuthContext'

function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus('submitting')
    setErrorMessage('')

    try {
      await login(formData.username, formData.password)
      navigate('/dashboard')
    } catch (error) {
      setErrorMessage(error.message)
      setStatus('idle')
    }
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
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="your username"
          minLength={4}
          required
        />
        <Field
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          minLength={6}
          required
        />

        {errorMessage && (
          <p className="rounded-md bg-absent-soft px-3 py-2 text-sm text-absent">{errorMessage}</p>
        )}

        <button
          type="submit"
          disabled={status === 'submitting'}
          className="rounded-md bg-indigo px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-dark hover:shadow-md disabled:translate-y-0 disabled:opacity-50 disabled:shadow-none"
        >
          {status === 'submitting' ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthLayout>
  )
}

export default Login