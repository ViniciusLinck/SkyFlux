export const APP_NAME = 'SkyFlux'

export const EARTH_RADIUS_UNITS = 2.45
export const EARTH_RADIUS_KM = 6371

export const POLLING = {
  satelliteForegroundMs: 5000,
  satelliteBackgroundMs: 20000,
  tleForegroundMs: 15 * 60 * 1000,
  tleBackgroundMs: 30 * 60 * 1000,
  launchesForegroundMs: 90 * 1000,
  launchesBackgroundMs: 180 * 1000,
}

export const TTL = {
  tleMs: 15 * 60 * 1000,
  launchesMs: 2 * 60 * 1000,
  apodMs: 24 * 60 * 60 * 1000,
}

export const ENDPOINTS = {
  starlinkTle: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=starlink&FORMAT=tle',
  spaceXLaunches: 'https://api.spacexdata.com/v4/launches',
  spaceXLaunchpads: 'https://api.spacexdata.com/v4/launchpads',
  nasaApod: 'https://api.nasa.gov/planetary/apod',
}

export const NASA_API_KEY = import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY'

export const UI_LIMITS = {
  minTouchTarget: 44,
  lodSwitchDistance: 8,
  desktopBreakpoint: 1024,
  tabletBreakpoint: 768,
}
