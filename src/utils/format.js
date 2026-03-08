export function formatDateTime(value) {
  if (!value) return 'Sem data'
  const date = new Date(value)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatRelativeUpdate(timestamp) {
  if (!timestamp) return 'nunca'
  const diff = Date.now() - timestamp
  const seconds = Math.round(diff / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes}min`
  const hours = Math.round(minutes / 60)
  return `${hours}h`
}

export function toReadableError(error) {
  if (!error) return ''
  if (error.type === 'cors') {
    return 'Bloqueio de CORS. Ative proxy local ou use modo demo.'
  }
  if (error.type === 'rate_limit') {
    return 'Limite de requisicoes excedido. Tente novamente em alguns minutos.'
  }
  if (error.type === 'network') {
    return 'Falha de rede. Verifique a conexao e tente novamente.'
  }
  return error.message || 'Erro inesperado ao carregar dados.'
}
