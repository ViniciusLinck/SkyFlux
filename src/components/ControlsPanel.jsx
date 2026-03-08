import { APODPanel } from './APODPanel'
import { formatDateTime, formatRelativeUpdate } from '../utils/format'
import { StatusBanner } from './StatusBanner'

export function ControlsPanel({
  layers,
  onToggleLayer,
  filters,
  onFilterChange,
  search,
  onSearchChange,
  selectedSatellite,
  selectedGroundPoint,
  launches,
  selectedLaunchId,
  onSelectLaunch,
  apod,
  apodStatus,
  apodError,
  satelliteMeta,
  launchMeta,
  isCompact,
}) {
  return (
    <section className="flex h-full flex-col overflow-y-auto px-3 pb-5 pt-4 sm:px-4 lg:px-5">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">SkyFlux</p>
        <h1 className="text-2xl font-bold text-slate-50 sm:text-3xl">Atividade Espacial</h1>
        <p className="text-sm text-slate-300">Visualizacao quase em tempo real de satelites e lancamentos.</p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onToggleLayer('satellites')}
          className={`min-h-11 rounded-xl border px-3 text-sm ${
            layers.satellites
              ? 'border-cyan-300/70 bg-cyan-400/15 text-cyan-100'
              : 'border-slate-700 bg-slate-900/70 text-slate-300'
          }`}
        >
          Satelites
        </button>
        <button
          type="button"
          onClick={() => onToggleLayer('launches')}
          className={`min-h-11 rounded-xl border px-3 text-sm ${
            layers.launches
              ? 'border-cyan-300/70 bg-cyan-400/15 text-cyan-100'
              : 'border-slate-700 bg-slate-900/70 text-slate-300'
          }`}
        >
          Lancamentos
        </button>
        <button
          type="button"
          onClick={() => onToggleLayer('atmosphere')}
          className={`col-span-2 min-h-11 rounded-xl border px-3 text-sm ${
            layers.atmosphere
              ? 'border-cyan-300/70 bg-cyan-400/15 text-cyan-100'
              : 'border-slate-700 bg-slate-900/70 text-slate-300'
          }`}
        >
          Atmosfera
        </button>
      </div>

      <div className="mb-4 rounded-2xl border border-cyan-300/20 bg-slate-950/70 p-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-cyan-100">Filtros</h2>
        <label className="mt-2 block text-xs text-slate-300" htmlFor="search">
          Buscar satelite
        </label>
        <input
          id="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Nome ou codigo"
          className="mt-1 min-h-11 w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 text-sm text-slate-100 outline-none focus:border-cyan-300/70"
        />

        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-xs text-slate-300">
            <span>Altitude minima</span>
            <span>{filters.minAltitudeKm} km</span>
          </div>
          <input
            type="range"
            min="0"
            max="1200"
            step="25"
            value={filters.minAltitudeKm}
            onChange={(event) =>
              onFilterChange({ ...filters, minAltitudeKm: Number(event.target.value) })
            }
            className="h-2 w-full accent-cyan-300"
          />
        </div>
      </div>

      <div className="mb-4 space-y-2">
        <StatusBanner
          type={satelliteMeta.error ? 'error' : 'info'}
          message={`Satelites: ${satelliteMeta.visibleCount} visiveis de ${satelliteMeta.totalCount}. Atualizado ha ${formatRelativeUpdate(satelliteMeta.lastUpdated)}.`}
        />
        {satelliteMeta.error && <StatusBanner type="error" message={satelliteMeta.error} />}
        {launchMeta.error && <StatusBanner type="error" message={launchMeta.error} />}
      </div>

      <div className="mb-4 rounded-2xl border border-slate-700/70 bg-slate-950/65 p-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-cyan-100">Selecao</h2>
        {selectedSatellite ? (
          <div className="mt-2 text-sm text-slate-200">
            <p className="font-semibold">{selectedSatellite.name}</p>
            <p>Lat {selectedSatellite.lat.toFixed(2)} | Lon {selectedSatellite.lon.toFixed(2)}</p>
            <p>Altitude {selectedSatellite.altitudeKm.toFixed(1)} km</p>
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-400">Clique em um satelite para ver detalhes.</p>
        )}
        {selectedGroundPoint && (
          <p className="mt-2 text-xs text-slate-300">
            Solo: {selectedGroundPoint.lat.toFixed(2)} / {selectedGroundPoint.lon.toFixed(2)}
          </p>
        )}
      </div>

      <div className="mb-4 rounded-2xl border border-slate-700/70 bg-slate-950/65 p-3">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-cyan-100">Lancamentos</h2>
          <span className="text-[11px] text-slate-400">{launches.length}</span>
        </div>
        <div className="grid gap-2">
          {launches.map((launch) => (
            <button
              key={launch.id}
              type="button"
              onClick={() => onSelectLaunch(launch.id)}
              className={`min-h-11 rounded-xl border px-3 py-2 text-left ${
                selectedLaunchId === launch.id
                  ? 'border-magentaGlow/70 bg-magentaGlow/15'
                  : 'border-slate-700 bg-slate-900/70'
              }`}
            >
              <p className="text-sm font-semibold text-slate-100">{launch.name}</p>
              <p className="text-xs text-slate-300">{formatDateTime(launch.dateUtc)}</p>
              <p className="text-xs text-cyan-200">
                {launch.launchpad.name} - {launch.launchpad.locality}, {launch.launchpad.region}
              </p>
            </button>
          ))}
          {launches.length === 0 && <p className="text-sm text-slate-400">Nenhum lancamento disponivel.</p>}
        </div>
      </div>

      <APODPanel apod={apod} status={apodStatus} error={apodError} compact={isCompact} />
    </section>
  )
}
