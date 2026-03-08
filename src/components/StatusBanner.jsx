export function StatusBanner({ type = 'info', message }) {
  if (!message) return null

  const styles =
    type === 'error'
      ? 'border-rose-500/40 bg-rose-500/15 text-rose-100'
      : 'border-cyan-300/30 bg-cyan-500/15 text-cyan-50'

  return (
    <div className={`rounded-xl border px-3 py-2 text-xs ${styles}`}>
      <p>{message}</p>
    </div>
  )
}
