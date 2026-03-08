import { ENDPOINTS, NASA_API_KEY } from '../constants/config'

export function getApodUrl() {
  return `${ENDPOINTS.nasaApod}?api_key=${NASA_API_KEY}`
}
