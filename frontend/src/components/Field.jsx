function Field({ label, ...inputProps }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-mono text-xs uppercase tracking-wide text-slate">
        {label}
      </label>
      <input
        {...inputProps}
        className="rounded-md border border-line bg-paper px-3 py-2 text-ink outline-none transition focus:border-indigo focus:ring-2 focus:ring-indigo-soft"
      />
    </div>
  )
}

export default Field