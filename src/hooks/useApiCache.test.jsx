import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useApiCache } from './useApiCache'

const getCacheEntry = vi.fn()
const setCacheEntry = vi.fn()
const fetchWithRetry = vi.fn()

vi.mock('../services/cacheDb', () => ({
  getCacheEntry: (...args) => getCacheEntry(...args),
  setCacheEntry: (...args) => setCacheEntry(...args),
}))

vi.mock('../services/apiClient', () => ({
  fetchWithRetry: (...args) => fetchWithRetry(...args),
}))

describe('useApiCache', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('usa cache fresco sem chamar a API', async () => {
    getCacheEntry.mockResolvedValueOnce({
      payload: { value: 'cached' },
      timestamp: Date.now(),
      etag: 'abc123',
      lastModified: 'now',
    })

    const { result } = renderHook(() =>
      useApiCache({
        cacheKey: 'cached-key',
        url: 'https://example.test/data',
        ttlMs: 5000,
      }),
    )

    await waitFor(() => expect(result.current.status).toBe('success'))
    expect(fetchWithRetry).not.toHaveBeenCalled()
    expect(result.current.data).toEqual({ value: 'cached' })
  })

  it('faz refresh quando cache expira e persiste novo payload', async () => {
    getCacheEntry.mockResolvedValueOnce({
      payload: { old: true },
      timestamp: Date.now() - 60_000,
    })

    fetchWithRetry.mockResolvedValueOnce(
      new Response(JSON.stringify({ fresh: true }), {
        status: 200,
        headers: {
          etag: 'new',
          'last-modified': 'new-date',
          'content-type': 'application/json',
        },
      }),
    )

    const { result } = renderHook(() =>
      useApiCache({
        cacheKey: 'expired-key',
        url: 'https://example.test/fresh',
        ttlMs: 1000,
      }),
    )

    await waitFor(() => expect(result.current.data).toEqual({ fresh: true }))
    expect(fetchWithRetry).toHaveBeenCalledTimes(1)
    expect(setCacheEntry).toHaveBeenCalledTimes(1)
  })

  it('entra em fallback quando API falha sem cache', async () => {
    getCacheEntry.mockResolvedValueOnce(null)
    fetchWithRetry.mockRejectedValueOnce(new Error('network down'))

    const { result } = renderHook(() =>
      useApiCache({
        cacheKey: 'fallback-key',
        url: 'https://example.test/fallback',
        ttlMs: 1000,
        fallbackData: { demo: true },
      }),
    )

    await waitFor(() => expect(result.current.status).toBe('fallback'))
    expect(result.current.data).toEqual({ demo: true })
  })
})
