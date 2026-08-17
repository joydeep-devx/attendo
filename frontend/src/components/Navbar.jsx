import { Menu } from 'lucide-react'

function Navbar({ onOpenMobile }) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-paper-raised px-4 sm:px-8">
      <button
        type="button"
        onClick={onOpenMobile}
        className="rounded-sm p-1.5 text-slate hover:bg-line-soft hover:text-ink lg:hidden"
        aria-label="Open navigation"
      >
        <Menu size={20} />
      </button>

      <span className="text-sm text-slate">Welcome back</span>
    </header>
  )
}

export default Navbar