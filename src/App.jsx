import { useEffect, useMemo, useState } from 'react'
import { GlobeScene } from './components/GlobeScene'
import { ControlsPanel } from './components/ControlsPanel'
import { useApiCache } from './hooks/useApiCache'
import { usePageVisibility } from './hooks/usePageVisibility'
import { useMediaQuery } from './hooks/useMediaQuery'
import { MOCK_APOD, MOCK_LAUNCHES, MOCK_LAUNCHPADS, MOCK_TLE_TEXT } from './data/mockData'
import { ENDPOINTS, POLLING, TTL, UI_LIMITS, APP_NAME } from './constants/config'
import { parseTleText } from './services/tleService'
import { buildLodPositions, buildSatelliteModel, getSatellitePositions } from './services/satelliteService'
import { getApodUrl } from './services/apodService'
import { mergeLaunchesWithPads } from './services/spacexService'
import { toReadableError } from './utils/format'

const INITIAL_FILTERS = {
  minAltitudeKm: 0,
}

function bySearch(text, query) {
  if (!query) return true
  return text.toLowerCase().includes(query.toLowerCase())
}

export default function App() {
  const isPageVisible = usePageVisibility()
  const isDesktop = useMediaQuery(`(min-width: ${UI_LIMITS.desktopBreakpoint}px)`)
  const isTablet = useMediaQuery(`(min-width: ${UI_LIMITS.tabletBreakpoint}px)`)

  const [layers, setLayers] = useState({
    satellites: true,
    launches: true,
    atmosphere: true,
  })
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [search, setSearch] = useState('')
  const [selectedSatellite, setSelectedSatellite] = useState(null)
  const [selectedGroundPoint, setSelectedGroundPoint] = useState(null)
  const [selectedLaunchId, setSelectedLaunchId] = useState(null)
  const [mobilePanelOpen, setMobilePanelOpen] = useState(true)
  const [satellitePositions, setSatellitePositions] = useState([])

  const tleQuery = useApiCache({
    cacheKey: 'tle:starlink',
    url: ENDPOINTS.starlinkTle,
    ttlMs: TTL.tleMs,
    parser: 'text',
    fallbackData: MOCK_TLE_TEXT,
  })

  const launchesQuery = useApiCache({
    cacheKey: 'spacex:launches',
    url: ENDPOINTS.spaceXLaunches,
    ttlMs: TTL.launchesMs,
    parser: 'json',
    fallbackData: MOCK_LAUNCHES,
  })

  const launchpadsQuery = useApiCache({
    cacheKey: 'spacex:launchpads',
    url: ENDPOINTS.spaceXLaunchpads,
    ttlMs: TTL.launchesMs,
    parser: 'json',
    fallbackData: MOCK_LAUNCHPADS,
  })

  const apodQuery = useApiCache({
    cacheKey: 'nasa:apod',
    url: getApodUrl(),
    ttlMs: TTL.apodMs,
    parser: 'json',
    fallbackData: MOCK_APOD,
  })

  const refreshTle = tleQuery.refresh
  const refreshLaunches = launchesQuery.refresh
  const refreshLaunchpads = launchpadsQuery.refresh

  const tleEntries = useMemo(() => {
    const parsed = parseTleText(tleQuery.data || '')
    return parsed.length > 0 ? parsed : parseTleText(MOCK_TLE_TEXT)
  }, [tleQuery.data])

  const satelliteModel = useMemo(() => buildSatelliteModel(tleEntries), [tleEntries])

  useEffect(() => {
    if (!satelliteModel.length) return undefined

    const tick = () => {
      setSatellitePositions(getSatellitePositions(satelliteModel, Date.now()))
    }

    tick()
    const intervalMs = isPageVisible
      ? POLLING.satelliteForegroundMs
      : POLLING.satelliteBackgroundMs
    const intervalId = setInterval(tick, intervalMs)
    return () => clearInterval(intervalId)
  }, [satelliteModel, isPageVisible])

  useEffect(() => {
    const intervalMs = isPageVisible ? POLLING.tleForegroundMs : POLLING.tleBackgroundMs
    const intervalId = setInterval(() => refreshTle(), intervalMs)
    return () => clearInterval(intervalId)
  }, [isPageVisible, refreshTle])

  useEffect(() => {
    const intervalMs = isPageVisible
      ? POLLING.launchesForegroundMs
      : POLLING.launchesBackgroundMs
    const intervalId = setInterval(() => {
      refreshLaunches()
      refreshLaunchpads()
    }, intervalMs)
    return () => clearInterval(intervalId)
  }, [isPageVisible, refreshLaunches, refreshLaunchpads])

  const launches = useMemo(
    () => mergeLaunchesWithPads(launchesQuery.data || [], launchpadsQuery.data || []),
    [launchesQuery.data, launchpadsQuery.data],
  )
  const activeLaunchId = selectedLaunchId ?? launches[0]?.id ?? null
  const panelOpen = isDesktop || mobilePanelOpen

  const filteredSatellites = useMemo(() => {
    const limited = satellitePositions
      .filter((item) => item.altitudeKm >= filters.minAltitudeKm)
      .filter((item) => bySearch(item.name, search))

    if (!isDesktop && limited.length > 1600) {
      return limited.slice(0, 1600)
    }
    return limited
  }, [satellitePositions, filters.minAltitudeKm, search, isDesktop])

  const lodSatellites = useMemo(() => buildLodPositions(filteredSatellites), [filteredSatellites])

  const satelliteMeta = useMemo(
    () => ({
      totalCount: satellitePositions.length,
      visibleCount: filteredSatellites.length,
      lastUpdated: tleQuery.lastUpdated,
      error:
        tleQuery.status === 'fallback'
          ? 'Modo demo ativo para TLE. API indisponivel ou bloqueada.'
          : tleQuery.error
            ? toReadableError(tleQuery.error)
            : '',
    }),
    [
      satellitePositions.length,
      filteredSatellites.length,
      tleQuery.lastUpdated,
      tleQuery.status,
      tleQuery.error,
    ],
  )

  const launchMeta = useMemo(
    () => ({
      lastUpdated: launchesQuery.lastUpdated,
      error:
        launchesQuery.status === 'fallback' || launchpadsQuery.status === 'fallback'
          ? 'Dados de lancamentos em modo demo.'
          : launchesQuery.error || launchpadsQuery.error
            ? toReadableError(launchesQuery.error || launchpadsQuery.error)
            : '',
    }),
    [
      launchesQuery.status,
      launchpadsQuery.status,
      launchesQuery.error,
      launchpadsQuery.error,
      launchesQuery.lastUpdated,
    ],
  )

  const apodErrorMessage = apodQuery.error ? toReadableError(apodQuery.error) : ''

  return (
    <div className="relative min-h-screen overflow-x-hidden text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-16 top-8 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute -right-8 top-1/2 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl" />
      </div>

      <header className="relative z-20 flex items-center justify-between px-3 py-3 sm:px-4 lg:px-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Mission Control</p>
          <h1 className="text-xl font-bold text-white sm:text-2xl">{APP_NAME}</h1>
        </div>
        {!isDesktop && (
          <button
            type="button"
            onClick={() => setMobilePanelOpen((open) => !open)}
            className="min-h-11 min-w-11 rounded-xl border border-cyan-300/40 bg-night-900/60 px-4 text-sm font-semibold text-cyan-100 backdrop-blur"
          >
            Painel
          </button>
        )}
      </header>

      <main className="relative z-10 flex min-h-[calc(100vh-76px)] flex-col lg:flex-row">
        <section className="relative h-[56vh] min-h-[320px] flex-1 sm:h-[60vh] lg:h-auto">
          <GlobeScene
            satellites={filteredSatellites}
            lodSatellites={lodSatellites}
            launches={launches}
            layers={layers}
            onPickSatellite={(satellite) => setSelectedSatellite(satellite)}
            onPickGround={(point) => setSelectedGroundPoint(point)}
            selectedLaunchId={activeLaunchId}
            onSelectLaunch={setSelectedLaunchId}
            isMobile={!isTablet}
          />

          <div className="pointer-events-none absolute bottom-3 left-3 right-3 grid grid-cols-2 gap-2 sm:w-auto sm:max-w-xl">
            <div className="rounded-xl border border-slate-700/70 bg-slate-950/75 p-2 text-xs text-slate-200 backdrop-blur">
              Atualizacao TLE: {satelliteMeta.lastUpdated ? 'ok' : 'pendente'} | visiveis:{' '}
              {satelliteMeta.visibleCount}
            </div>
            <div className="rounded-xl border border-slate-700/70 bg-slate-950/75 p-2 text-xs text-slate-200 backdrop-blur">
              Launches: {launches.length} | APOD: {apodQuery.status}
            </div>
          </div>
        </section>

        {isDesktop && (
          <aside className="h-[calc(100vh-76px)] w-[360px] border-l border-cyan-300/20 bg-night-950/82 backdrop-blur-xl 2xl:w-[390px]">
            <ControlsPanel
              layers={layers}
              onToggleLayer={(layerKey) =>
                setLayers((previous) => ({ ...previous, [layerKey]: !previous[layerKey] }))
              }
              filters={filters}
              onFilterChange={setFilters}
              search={search}
              onSearchChange={setSearch}
              selectedSatellite={selectedSatellite}
              selectedGroundPoint={selectedGroundPoint}
              launches={launches}
              selectedLaunchId={activeLaunchId}
              onSelectLaunch={setSelectedLaunchId}
              apod={apodQuery.data}
              apodStatus={apodQuery.status}
              apodError={apodErrorMessage ? { message: apodErrorMessage } : null}
              satelliteMeta={satelliteMeta}
              launchMeta={launchMeta}
              isCompact={false}
            />
          </aside>
        )}
      </main>

      {!isDesktop && (
        <section
          className={`fixed inset-x-0 bottom-0 z-30 transition-transform duration-300 ${
            panelOpen ? 'translate-y-0' : 'translate-y-[calc(100%-54px)]'
          }`}
        >
          <div className="mx-2 rounded-t-2xl border border-cyan-300/25 bg-night-950/94 shadow-panel backdrop-blur-xl">
            <button
              type="button"
              onClick={() => setMobilePanelOpen((open) => !open)}
              className="flex min-h-11 w-full items-center justify-between px-4 text-sm font-semibold text-cyan-100"
            >
              <span>Controles e dados</span>
              <span>{panelOpen ? 'Fechar' : 'Abrir'}</span>
            </button>
            <div className="max-h-[72vh] overflow-y-auto border-t border-slate-700/70">
              <ControlsPanel
                layers={layers}
                onToggleLayer={(layerKey) =>
                  setLayers((previous) => ({ ...previous, [layerKey]: !previous[layerKey] }))
                }
                filters={filters}
                onFilterChange={setFilters}
                search={search}
                onSearchChange={setSearch}
                selectedSatellite={selectedSatellite}
                selectedGroundPoint={selectedGroundPoint}
                launches={launches}
                selectedLaunchId={activeLaunchId}
                onSelectLaunch={setSelectedLaunchId}
                apod={apodQuery.data}
                apodStatus={apodQuery.status}
                apodError={apodErrorMessage ? { message: apodErrorMessage } : null}
                satelliteMeta={satelliteMeta}
                launchMeta={launchMeta}
                isCompact
              />
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
