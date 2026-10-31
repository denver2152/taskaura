import axios from 'axios';
const api=axios.create({baseURL:import.meta.env.VITE_API_URL||'/api'});
api.interceptors.request.use(c=>{const token=localStorage.getItem('taskora-token');if(token)c.headers.Authorization=`Bearer ${token}`;return c;});
api.interceptors.response.use(r=>r,e=>{if(e.response?.status===401){localStorage.removeItem('taskora-token');if(location.pathname!=='/login'&&location.pathname!=='/register')location.href='/login';}return Promise.reject(e);});
export default api;
