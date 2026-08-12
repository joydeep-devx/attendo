function SectionHeading({ eyebrow, title, children }) {
  return (
    <div className="max-w-2xl">
      {eyebrow && (
        <p className="font-mono text-xs uppercase tracking-wider text-indigo">{eyebrow}</p>
      )}
      <h2 className="mt-2 font-display text-2xl text-ink">{title}</h2>
      {children && <p className="mt-3 text-sm leading-relaxed text-slate">{children}</p>}
    </div>
  )
}

export default SectionHeading