/* eslint-disable react-refresh/only-export-components -- es un punto de entrada, no un módulo que se recargue en caliente */
// SÓLO DEV (no entra en el build): la web ENTERA entrando como cada plan real, sin sesión ni contraseñas.
//   http://localhost:5196/cuentas.html?plan=elite          (gratis | standard | basico | ejecutivo | elite | nacional)
//   …&rango=national_director                              (por defecto: Directora; el Standard entra como consultora)
//   …&ir=/indicators                                       (página en la que abre; por defecto el Inicio)
//   …&cobro=aldia|toca|atrasado                            (cómo va su pago; por defecto «toca»)
// La API es de mentira (mock-api.ts): planes y catálogo copiados de producción, gente y piezas inventadas.
import { createRoot } from 'react-dom/client'
import { BrowserRouter, useLocation } from 'react-router'

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

const cobro = params.get('cobro')
if (cobro) sessionStorage.setItem('cuentas:cobro', cobro)

/*
 * OJO: cambiar de cuenta hace `location.replace('/dashboard')`, una recarga COMPLETA que SALE del
 * simulador (la API de mentira la instala este archivo, y `index.html` no lo carga), así que acaba
 * en el acceso. No se puede evitar parcheando `location.replace`: en el navegador es de sólo
 * lectura y asignarla revienta la página entera. Para ver cómo queda la cuenta DESTINO se entra
 * directo: `…/cuentas.html?cuentas=1&cuenta=col`.
 */
const cuenta = params.get('cuenta')
if (cuenta === 'col' || cuenta === 'mex') sessionStorage.setItem('cuentas:activa', cuenta === 'col' ? 'liga-col' : 'liga-mex')

installMockApi(plan, role, params.has('plan') && !params.has('rango') ? null : rank)
// Para revisar desde la consola qué pidió la web y qué no estaba previsto
Object.assign(window, { __cuentas: { plan, role, calls } })

// La sesión es de mentira y vive sólo en esta pestaña: MainLayout pide que exista la clave
const hadSession = localStorage.getItem(SESSION_KEY)
if (!hadSession) localStorage.setItem(SESSION_KEY, 'simulador')
window.addEventListener('pagehide', () => { if (localStorage.getItem(SESSION_KEY) === 'simulador') localStorage.removeItem(SESSION_KEY) })

// `?nuevo=0|1` elige el marco igual que en la web real; aquí hay que guardarlo a mano porque
// la dirección se reescribe abajo, antes de que `isNewShell()` llegue a leerla
const shell = params.get('nuevo')
if (shell === '0' || shell === '1') localStorage.setItem('eyplease:shell', shell === '1' ? 'new' : 'old')

// La web no conoce la ruta /cuentas.html: arranca en el Inicio, o donde diga `ir` (el plan ya quedó en sessionStorage)
const startAt = params.get('ir') ?? ''
window.history.replaceState(null, '', startAt.startsWith('/') && !startAt.startsWith('//') ? startAt : '/dashboard')


/**
 * La pantalla de acceso DENTRO de la demo no puede iniciar sesión: aquí la API es de mentira. David
 * intentó entrar con su cuenta desde ella y «no pudo» sin saber por qué. Se dice arriba, bien claro,
 * con las dos salidas: volver a la demo o ir a la web real (carga completa, ya sin la API de mentira).
 */
const BackToDemo = () => {
    const { pathname } = useLocation()
    if (!pathname.startsWith('/auth')) return null

    const link = { padding: '8px 16px', borderRadius: 999, font: '800 12.5px Inter, Arial', textDecoration: 'none' } as const
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 2147483647, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '10px 16px', background: '#FDE68A', color: '#1A1830', font: '700 13px Inter, Arial', boxShadow: '0 8px 24px -10px rgba(10,5,60,.5)' }}>
            <span>Estás en la DEMO: aquí no se entra con tu usuario y contraseña.</span>
            <a href={`/cuentas.html?plan=${slug(plan.name)}`} style={{ ...link, background: '#4E31C0', color: '#fff' }}>Volver a la demo ({plan.name})</a>
            <a href="/auth/sign-in" style={{ ...link, background: '#fff', color: '#4E31C0' }}>Ir a la web real para entrar con mi cuenta</a>
        </div>
    )
}

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
            <BackToDemo />
        </BrowserRouter>,
    )
})
