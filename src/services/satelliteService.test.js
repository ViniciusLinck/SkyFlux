import { describe, expect, it } from 'vitest'
import { MOCK_TLE_TEXT } from '../data/mockData'
import { buildLodPositions, buildSatelliteModel, getSatellitePositions } from './satelliteService'
import { parseTleText } from './tleService'

describe('satelliteService', () => {
  it('converte TLE em modelo de satelites', () => {
    const entries = parseTleText(MOCK_TLE_TEXT)
    const model = buildSatelliteModel(entries)

    expect(entries.length).toBeGreaterThan(0)
    expect(model.length).toBe(entries.length)
  })

  it('gera pelo menos 500 posicoes para o render', () => {
    const entries = parseTleText(MOCK_TLE_TEXT)
    const model = buildSatelliteModel(entries)
    const positions = getSatellitePositions(model, Date.now())

    expect(positions.length).toBeGreaterThanOrEqual(500)
  })

  it('agrupa em LOD para zoom distante', () => {
    const entries = parseTleText(MOCK_TLE_TEXT)
    const model = buildSatelliteModel(entries)
    const positions = getSatellitePositions(model, Date.now())
    const clusters = buildLodPositions(positions)

    expect(clusters.length).toBeGreaterThan(0)
    expect(clusters.length).toBeLessThan(positions.length)
  })
})
