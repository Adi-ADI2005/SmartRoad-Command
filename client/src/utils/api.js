import axios from 'axios'

const api = axios.create({ baseURL: '/api', timeout: 10000 })

export const getStats        = () => api.get('/traffic/stats')
export const getSignalStatus = () => api.get('/signal/status')
export const changeSignal    = (signal) => api.post('/signal/change', { signal })
export const cameraOn        = () => api.post('/camera/on')
export const cameraOff       = () => api.post('/camera/off')
export const getAnalytics    = () => api.get('/analytics')
export const getAlerts       = () => api.get('/alerts')
export const getAccident     = () => api.get('/accident/predict')

export default api
