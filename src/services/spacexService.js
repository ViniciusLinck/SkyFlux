import { MOCK_LAUNCHES, MOCK_LAUNCHPADS } from '../data/mockData'

export function mergeLaunchesWithPads(launches = [], launchpads = []) {
  const launchpadMap = new Map(launchpads.map((pad) => [pad.id, pad]))

  const merged = launches
    .map((launch) => {
      const launchpad = launchpadMap.get(launch.launchpad)
      if (!launchpad?.latitude || !launchpad?.longitude) return null

      return {
        id: launch.id,
        name: launch.name,
        details: launch.details,
        dateUtc: launch.date_utc,
        success: launch.success,
        launchpad: {
          id: launchpad.id,
          name: launchpad.name,
          locality: launchpad.locality,
          region: launchpad.region,
          latitude: launchpad.latitude,
          longitude: launchpad.longitude,
        },
      }
    })
    .filter(Boolean)

  return merged.sort((a, b) => new Date(a.dateUtc) - new Date(b.dateUtc)).slice(0, 16)
}

export function getMockLaunchBundle() {
  return mergeLaunchesWithPads(MOCK_LAUNCHES, MOCK_LAUNCHPADS)
}
