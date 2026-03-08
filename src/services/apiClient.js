const DEFAULT_RETRIES = 3
const DEFAULT_BACKOFF_MS = 350

export class ApiRequestError extends Error {
  constructor(message, options = {}) {
    super(message)
    this.name = 'ApiRequestError'
    this.type = options.type || 'unknown'
    this.status = options.status ?? null
    this.cause = options.cause
  }
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function isRetryableStatus(status) {
  return status === 429 || status >= 500
}

function classifyFetchFailure(error) {
  if (error instanceof ApiRequestError) return error
  if (error instanceof TypeError) {
    const online = typeof navigator !== 'undefined' ? navigator.onLine : true
    return new ApiRequestError(
      online
        ? 'Requisicao bloqueada por CORS ou indisponibilidade da API.'
        : 'Sem conexao de rede.',
      { type: online ? 'cors' : 'network', cause: error },
    )
  }
  return new ApiRequestError(error.message || 'Falha de requisicao.', {
    type: 'unknown',
    cause: error,
  })
}

export async function fetchWithRetry(url, init = {}, retryConfig = {}) {
  const retries = retryConfig.retries ?? DEFAULT_RETRIES
  const baseBackoffMs = retryConfig.baseBackoffMs ?? DEFAULT_BACKOFF_MS
  let lastError

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, init)

      if (response.status === 304) {
        return response
      }

      if (response.status === 429) {
        throw new ApiRequestError('Limite de requisicoes excedido.', {
          type: 'rate_limit',
          status: 429,
        })
      }

      if (!response.ok && isRetryableStatus(response.status) && attempt < retries) {
        await delay(baseBackoffMs * 2 ** attempt)
        continue
      }

      if (!response.ok) {
        throw new ApiRequestError(`Erro HTTP ${response.status}`, {
          type: 'server',
          status: response.status,
        })
      }

      return response
    } catch (error) {
      lastError = classifyFetchFailure(error)
      const retryable =
        lastError.type === 'network' ||
        lastError.type === 'cors' ||
        lastError.type === 'rate_limit' ||
        lastError.type === 'server'

      if (!retryable || attempt >= retries) {
        throw lastError
      }

      await delay(baseBackoffMs * 2 ** attempt)
    }
  }

  throw lastError || new ApiRequestError('Falha de requisicao sem detalhes.')
}
