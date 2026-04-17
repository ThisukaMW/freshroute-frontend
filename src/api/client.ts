import axios from 'axios'
import { setupInterceptors } from './interceptors'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Initialize request/response interceptors to attach auth token
setupInterceptors(apiClient)

export default apiClient