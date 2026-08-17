import { Link } from 'react-router-dom'
import { motion } from 'motion/react'

function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="border-b border-line bg-paper-raised">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="font-display text-lg font-semibold tracking-tight text-ink">
            Attendo
          </Link>
          <Link to="/" className="font-mono text-xs uppercase tracking-wide text-slate hover:text-indigo">
            ← Back to home
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-md"
        >
          <h1 className="font-display text-2xl text-ink">{title}</h1>
          <p className="mt-2 text-sm text-slate">{subtitle}</p>

          <div className="mt-6 rounded-lg border border-line bg-paper-raised p-6">
            {children}
          </div>

          <p className="mt-5 text-center text-sm text-slate">{footer}</p>
        </motion.div>
      </main>
    </div>
  )
}

export default AuthLayout