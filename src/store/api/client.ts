import axios from 'axios'
import { setupInterceptors } from './interceptors'

const client = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

setupInterceptors(client)

export default client