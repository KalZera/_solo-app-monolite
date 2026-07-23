import axios from 'axios'
import { getToken } from '../storage/token-storage'

export const httpClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3333/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

httpClient.interceptors.request.use(async (requestConfig) => {
  const token = await getToken()
  if (token) {
    requestConfig.headers.set('Authorization', `Bearer ${token}`)
  }
  return requestConfig
})
