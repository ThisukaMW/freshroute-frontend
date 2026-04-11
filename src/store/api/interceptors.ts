import axios from 'axios'
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { LocalStorageService } from '../../services/storage/LocalStorageService'

export const setupInterceptors = (client: AxiosInstance): void => {
  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = LocalStorageService.get('fr_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: unknown) => {
      if (axios.isAxiosError(error)) {
        console.error('API error:', error.response || error.message)
      } else {
        console.error('Unexpected error:', error)
      }
      return Promise.reject(error)
    }
  )
}