import axios from 'axios'
import { setupInterceptors } from './interceptors'

const client = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
})

setupInterceptors(client)

export default client