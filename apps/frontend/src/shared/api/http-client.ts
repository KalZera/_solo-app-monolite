import axios from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import { clearToken, getToken, setToken } from '../storage/token-storage'

const baseURL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3333/api/v1'

export const httpClient = axios.create({
  baseURL,
  withCredentials: true,
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

let refreshPromise: Promise<string | null> | null = null

function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post<{ access_token: string }>(`${baseURL}/identity/refresh`, undefined, {
        withCredentials: true,
      })
      .then(async ({ data }) => {
        await setToken(data.access_token)
        return data.access_token
      })
      .catch(async () => {
        await clearToken()
        return null
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined

    const isRefreshCall = originalRequest?.url?.includes('/identity/refresh')
    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry || isRefreshCall) {
      throw error
    }

    originalRequest._retry = true
    const newToken = await refreshAccessToken()

    if (!newToken) {
      throw error
    }

    originalRequest.headers.set('Authorization', `Bearer ${newToken}`)
    return httpClient(originalRequest)
  },
)
