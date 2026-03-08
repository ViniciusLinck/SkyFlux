import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { fetchWithRetry } from '../services/apiClient'
import { getCacheEntry, setCacheEntry } from '../services/cacheDb'

async function parseResponse(response, parser) {
  if (typeof parser === 'function') return parser(response)
  if (parser === 'text') return response.text()
  return response.json()
}

export function useApiCache({
  cacheKey,
  url,
  ttlMs,
  parser = 'json',
  requestInit,
  enabled = true,
  fallbackData = null,
}) {
  const [data, setData] = useState(null)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const parserRef = useRef(parser)
  const requestInitRef = useRef(requestInit)
  const fallbackDataRef = useRef(fallbackData)

  const hasConfig = useMemo(() => Boolean(cacheKey && url && ttlMs), [cacheKey, url, ttlMs])

  useEffect(() => {
    parserRef.current = parser
    requestInitRef.current = requestInit
    fallbackDataRef.current = fallbackData
  }, [parser, requestInit, fallbackData])

  const load = useCallback(
    async ({ force = false } = {}) => {
      if (!enabled || !hasConfig) return
      setError(null)

      const cached = await getCacheEntry(cacheKey)
      const now = Date.now()
      const isFresh = cached && now - cached.timestamp < ttlMs

      if (cached?.payload) {
        setData(cached.payload)
        setLastUpdated(cached.timestamp)
        setStatus('success')
      }

      if (isFresh && !force) return
      if (!cached) setStatus('loading')

      const headers = new Headers(requestInitRef.current?.headers || {})
      if (cached?.etag) headers.set('If-None-Match', cached.etag)
      if (cached?.lastModified) headers.set('If-Modified-Since', cached.lastModified)

      try {
          const response = await fetchWithRetry(url, {
          ...requestInitRef.current,
          headers,
        })

        if (response.status === 304 && cached) {
          const freshCache = { ...cached, timestamp: now }
          await setCacheEntry(cacheKey, freshCache)
          setLastUpdated(now)
          setStatus('success')
          return
        }

        const payload = await parseResponse(response, parserRef.current)
        const nextEntry = {
          payload,
          timestamp: now,
          etag: response.headers.get('etag'),
          lastModified: response.headers.get('last-modified'),
        }

        await setCacheEntry(cacheKey, nextEntry)
        setData(payload)
        setLastUpdated(now)
        setStatus('success')
      } catch (requestError) {
        setError(requestError)
        if (cached?.payload) {
          setStatus('stale')
          return
        }
        if (fallbackDataRef.current) {
          setData(fallbackDataRef.current)
          setStatus('fallback')
          return
        }
        setStatus('error')
      }
    },
    [enabled, hasConfig, cacheKey, ttlMs, url],
  )

  useEffect(() => {
    load()
  }, [load])

  const refresh = useCallback(() => load({ force: true }), [load])

  return {
    data,
    status,
    error,
    lastUpdated,
    refresh,
  }
}
