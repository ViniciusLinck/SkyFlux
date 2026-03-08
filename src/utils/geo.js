import * as THREE from 'three'
import { EARTH_RADIUS_KM, EARTH_RADIUS_UNITS } from '../constants/config'

const RAD = Math.PI / 180
const DEG = 180 / Math.PI

export function altitudeKmToUnits(altitudeKm = 0) {
  return EARTH_RADIUS_UNITS * (altitudeKm / EARTH_RADIUS_KM)
}

export function latLonAltToVector3(lat, lon, altitudeKm = 0) {
  const radius = EARTH_RADIUS_UNITS + altitudeKmToUnits(altitudeKm)
  const phi = (90 - lat) * RAD
  const theta = (lon + 180) * RAD

  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const z = radius * Math.sin(phi) * Math.sin(theta)
  const y = radius * Math.cos(phi)

  return new THREE.Vector3(x, y, z)
}

export function vector3ToLatLon(vector) {
  const normalized = vector.clone().normalize()
  const lat = Math.asin(normalized.y) * DEG
  const lon = Math.atan2(normalized.z, -normalized.x) * DEG - 180

  return {
    lat,
    lon: normalizeLongitude(lon),
  }
}

export function normalizeLongitude(lon) {
  let result = lon
  while (result > 180) result -= 360
  while (result < -180) result += 360
  return result
}

export function clusterByGrid(positions, latStep = 8, lonStep = 8) {
  const buckets = new Map()

  for (const point of positions) {
    const latKey = Math.round(point.lat / latStep) * latStep
    const lonKey = Math.round(point.lon / lonStep) * lonStep
    const key = `${latKey}:${lonKey}`
    const existing = buckets.get(key)

    if (!existing) {
      buckets.set(key, {
        key,
        count: 1,
        latSum: point.lat,
        lonSum: point.lon,
        altitudeSum: point.altitudeKm,
        label: `${point.constellation || 'SAT'} cluster`,
      })
      continue
    }

    existing.count += 1
    existing.latSum += point.lat
    existing.lonSum += point.lon
    existing.altitudeSum += point.altitudeKm
  }

  return [...buckets.values()].map((bucket) => ({
    id: bucket.key,
    lat: bucket.latSum / bucket.count,
    lon: bucket.lonSum / bucket.count,
    altitudeKm: bucket.altitudeSum / bucket.count,
    count: bucket.count,
    name: bucket.label,
  }))
}

export function launchArcPoints(startLat, startLon, endLat, endLon, endAltitudeKm = 550) {
  const start = latLonAltToVector3(startLat, startLon, 0)
  const end = latLonAltToVector3(endLat, endLon, endAltitudeKm)
  const control = start
    .clone()
    .add(end)
    .multiplyScalar(0.5)
    .normalize()
    .multiplyScalar(EARTH_RADIUS_UNITS * 1.38)

  return [start, control, end]
}
