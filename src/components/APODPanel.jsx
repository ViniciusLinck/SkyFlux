import { useState } from 'react'
import { toReadableError } from '../utils/format'

export function APODPanel({ apod, status, error, compact }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <section className="rounded-2xl border border-cyan-300/25 bg-slate-950/60 p-3 shadow-panel">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-cyan-200">NASA APOD</h3>
          <span className="text-[11px] text-slate-400">{status}</span>
        </div>
        {error && <p className="mb-2 text-xs text-rose-300">{toReadableError(error)}</p>}
        {apod?.url ? (
          <>
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="w-full overflow-hidden rounded-xl border border-slate-700/60"
            >
              <img
                src={apod.url}
                alt={apod.title}
                loading="lazy"
                className={`w-full object-cover ${compact ? 'h-28' : 'h-40'}`}
              />
            </button>
            <p className="mt-2 text-sm font-semibold text-slate-100">{apod.title}</p>
            <p className="line-clamp-3 text-xs text-slate-300">{apod.explanation}</p>
          </>
        ) : (
          <p className="text-xs text-slate-300">Imagem indisponivel no momento.</p>
        )}
      </section>

      {isOpen && apod?.hdurl && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-cyan-300/30 bg-slate-950">
            <div className="flex items-center justify-between border-b border-slate-700/50 px-4 py-3">
              <h4 className="text-sm font-semibold text-slate-100">{apod.title}</h4>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="min-h-11 min-w-11 rounded-lg border border-slate-600 px-3 text-sm text-slate-100"
              >
                Fechar
              </button>
            </div>
            <img
              src={apod.hdurl}
              alt={apod.title}
              className="max-h-[78vh] w-full object-contain"
              loading="lazy"
            />
          </div>
        </div>
      )}
    </>
  )
}
