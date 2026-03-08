import { MOCK_TLE_TEXT } from '../data/mockData'

export function parseTleText(rawText) {
  if (!rawText) return []
  const rows = rawText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  const satellites = []

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index]
    const next = rows[index + 1]

    if (!row.startsWith('1 ') || !next?.startsWith('2 ')) continue

    const previous = rows[index - 1]
    const name =
      previous && !previous.startsWith('1 ') && !previous.startsWith('2 ')
        ? previous
        : `SAT-${satellites.length + 1}`

    satellites.push({
      id: `${name}-${satellites.length + 1}`,
      name,
      constellation: name.toUpperCase().includes('STARLINK') ? 'Starlink' : 'Orbital',
      tle1: row,
      tle2: next,
    })
  }

  return satellites
}

export function getMockTleEntries() {
  return parseTleText(MOCK_TLE_TEXT)
}
