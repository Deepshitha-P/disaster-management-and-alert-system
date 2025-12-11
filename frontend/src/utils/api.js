import api from '../api/axios'

export const AuthAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me')
}

export const SOSAPI = {
  create: (data) => api.post('/sos', data),
  nearby: () => api.get('/sos/nearby'),
  updateStatus: (id, status) => api.patch(`/sos/${id}/status`, { status })
}

export const DisasterAPI = {
  all: () => api.get('/disasters'),
  create: (data) => api.post('/disasters', data),
  remove: (id) => api.delete(`/disasters/${id}`)
}
