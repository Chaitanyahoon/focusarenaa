// Central API configuration
// In development (localhost), Vite proxy handles /api → localhost:5134
// In production, requests go directly to the Render backend
const PRODUCTION_API = 'https://focusarenaa.onrender.com'

const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

export const API_BASE = isDev
    ? '/api'
    : `${import.meta.env.VITE_API_URL || PRODUCTION_API}/api`

export const HUB_BASE = isDev
    ? ''
    : (import.meta.env.VITE_API_URL || PRODUCTION_API)
