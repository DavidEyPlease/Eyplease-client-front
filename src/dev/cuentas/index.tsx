/* eslint-disable react-refresh/only-export-components -- es un punto de entrada, no un módulo que se recargue en caliente */
// SÓLO DEV (no entra en el build): la web ENTERA entrando como cada plan real, sin sesión ni contraseñas.
//   http://localhost:5196/cuentas.html?plan=elite          (gratis | standard | basico | ejecutivo | elite | nacional)
//   …&rango=national_director                              (por defecto: Directora; el Standard entra como consultora)
// La API es de mentira (mock-api.ts): planes y catálogo copiados de producción, gente y piezas inventadas.
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'

import '../../index.css'
import { SESSION_KEY } from '@/constants/app'
import { calls, installMockApi, PLANS } from './mock-api'

const slug = (name: string) => name.replace(/^plan\s+/i, '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const params = new URLSearchParams(window.location.search)
const wanted = params.get('plan') ?? sessionStorage.getItem('cuentas:plan') ?? 'elite'
const plan = PLANS.find(p => slug(p.name) === wanted) ?? PLANS[0]
sessionStorage.setItem('cuentas:plan', slug(plan.name))
// El Standard es el plan de la consultora: no tiene unidad, sólo sus clientas
const role = slug(plan.name) === 'standard' ? 'consultant' : 'director'

const rank = params.get('rango') ?? sessionStorage.getItem('cuentas:rango')
if (params.has('rango')) sessionStorage.setItem('cuentas:rango', params.get('rango') ?? '')
else if (params.has('plan')) sessionStorage.removeItem('cuentas:rango')

installMockApi(plan, role, params.has('plan') && !params.has('rango') ? null : rank)
// Para revisar desde la consola qué pidió la web y qué no estaba previsto
Object.assign(window, { __cuentas: { plan, role, calls } })

// La sesión es de mentira y vive sólo en esta pestaña: MainLayout pide que exista la clave
const hadSession = localStorage.getItem(SESSION_KEY)
if (!hadSession) localStorage.setItem(SESSION_KEY, 'simulador')
window.addEventListener('pagehide', () => { if (localStorage.getItem(SESSION_KEY) === 'simulador') localStorage.removeItem(SESSION_KEY) })

// La web no conoce la ruta /cuentas.html: arranca en el Inicio (el plan ya quedó en sessionStorage)
window.history.replaceState(null, '', '/dashboard')

const Switcher = () => (
    <select
        aria-label="Entrar como…"
        value={slug(plan.name)}
        onChange={event => { window.location.href = `/cuentas.html?plan=${event.target.value}` }}
        style={{ position: 'fixed', bottom: 10, left: 10, zIndex: 2147483647, padding: '4px 10px', borderRadius: 999, border: 0, background: 'rgba(20,16,46,.88)', color: '#fff', font: '700 11px Inter, Arial' }}
    >
        {PLANS.map(p => <option key={p.id} value={slug(p.name)}>Simulador · {p.name}</option>)}
    </select>
)

// La app se importa DESPUÉS de instalar la API de mentira: al montar ya pide /me
import('../../App').then(({ default: App }) => {
    createRoot(document.getElementById('root')!).render(
        <BrowserRouter>
            <App />
            <Switcher />
        </BrowserRouter>,
    )
})
