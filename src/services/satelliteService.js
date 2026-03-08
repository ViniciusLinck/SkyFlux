import {
  degreesLat,
  degreesLong,
  eciToGeodetic,
  gstime,
  propagate,
  twoline2satrec,
} from 'satellite.js'
import { clusterByGrid, normalizeLongitude } from '../utils/geo'

export function buildSatelliteModel(tleEntries = []) {
  return tleEntries
    .map((entry) => {
      try {
        const satrec = twoline2satrec(entry.tle1, entry.tle2)
        return { ...entry, satrec }
      } catch {
        return null
      }
    })
    .filter(Boolean)
}

function createSyntheticSatellite(base, index) {
  const offset = ((index * 37) % 360) - 180
  const latOffset = ((index * 13) % 24) - 12

  return {
    ...base,
    id: `${base.id}-demo-${index}`,
    name: `${base.name} ${index + 1}`,
    lon: normalizeLongitude(base.lon + offset),
    lat: Math.max(-80, Math.min(80, base.lat + latOffset)),
    synthetic: true,
  }
}

export function getSatellitePositions(model = [], timestamp = Date.now()) {
  const date = new Date(timestamp)
  const gmst = gstime(date)

  const basePositions = model
    .map((entry) => {
      const state = propagate(entry.satrec, date)
      if (!state.position) return null

      const geodetic = eciToGeodetic(state.position, gmst)
      const lat = degreesLat(geodetic.latitude)
      const lon = normalizeLongitude(degreesLong(geodetic.longitude))
      const altitudeKm = Math.max(0, geodetic.height)

      return {
        id: entry.id,
        name: entry.name,
        constellation: entry.constellation,
        lat,
        lon,
        altitudeKm,
      }
    })
    .filter(Boolean)

  if (basePositions.length === 0) return []
  if (basePositions.length >= 500) return basePositions

  const expanded = [...basePositions]
  let index = 0

  while (expanded.length < 500) {
    const source = basePositions[index % basePositions.length]
    expanded.push(createSyntheticSatellite(source, index))
    index += 1
  }

  return expanded
}

export function buildLodPositions(positions = []) {
  return clusterByGrid(positions, 10, 10)
}
