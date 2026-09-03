import { BILLING_ERROR_CODES, BROWSER_EVENTS, SESSION_KEY } from "@/constants/app"
import { publishEvent } from "@/utils/events"

const MAX_RETRIES = 1
const FORBIDDEN = 403
const BILLING_CODES: string[] = Object.values(BILLING_ERROR_CODES)
const BUILD_VERSION = import.meta.env.VITE_BUILD_ID || 'dev'
const UPGRADE_REQUIRED = 426

interface HttpHeaders {
    'Authorization'?: string,
    'Content-Type'?: string,
    'Accept'?: string,
    'X-Client-Build-Version'?: string,
}

interface HttpOptions {
    headers?: HttpHeaders,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    body?: string | FormData,
    auth?: boolean,
    responseType?: string,
    signal?: AbortSignal,
}

class HttpService {

    /**
        * @private
    */
    #protocol = import.meta.env.VITE_API_URL.includes('localhost') ? 'http' : 'https'
    #baseUrl = `${this.#protocol}://${import.meta.env.VITE_API_URL}`

    /**
        * @private
    */
    #headers: HttpHeaders = {}

    constructor(baseUrl: string = import.meta.env.VITE_API_URL) {
        this.#headers = {
            'Accept': 'application/json',
            'X-Client-Build-Version': BUILD_VERSION,
        }
        this.#baseUrl = baseUrl
    }

    async setAuthorizationToken() {
        try {
            const idToken = localStorage.getItem(SESSION_KEY)
            if (idToken) {
                this.#headers['Authorization'] = `Bearer ${idToken}`
            }
        } catch (error) {
            throw new Error(error)
        }
    }

    async getMe<T>(): Promise<T> {
        return this._fetchWithRetry('/me', { method: 'GET' }, 1)
    }

    async _fetchWithRetry<T>(url: string, options: HttpOptions, retriesLeft: number = MAX_RETRIES): Promise<T> {
        try {
            const { responseType = 'json', ...httpOptions } = options
            await this.setAuthorizationToken()
            const response = await fetch(this.#baseUrl + url, {
                ...httpOptions,
                headers: {
                    ...this.#headers,
                    ...options.headers,
                    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
                },
            })

            if (!response.ok) {
                if (response.status === UPGRADE_REQUIRED) {
                    window.location.reload()
                    return new Promise(() => {}) as T
                }

                const error = await response.json()

                // Bloqueo por atraso en el pago: se avisa a la app (que abre el aviso y
                // refresca su estado) y se propaga igual, para que quien llamó no se cuelgue.
                if (response.status === FORBIDDEN && BILLING_CODES.includes(error?.message)) {
                    publishEvent(BROWSER_EVENTS.BILLING_RESTRICTED, { code: error.message, feature: error?.errors?.feature })
                }

                throw error
            }

            // if (options.method === 'GET' || options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH') {
            if (responseType === 'json') {
                return await response.json()
            }
            if (responseType === 'text')
                return response.text() as unknown as T
            if (responseType === 'blob')
                return response.blob() as unknown as T
            // }

            return response as unknown as T
        } catch (error) {
            if (options.method !== 'GET') throw error

            if (retriesLeft === 1) {
                throw error
            }

            return this._fetchWithRetry(url, options, retriesLeft - 1)
        }
    }

    async get<T>(url: string, options: Omit<HttpOptions, 'method'> = { responseType: 'json' }): Promise<T> {
        return this._fetchWithRetry(url, { method: 'GET', ...options })
    }

    async post<T>(url: string, data: object, auth = true): Promise<T> {
        return this._fetchWithRetry(url, {
            method: 'POST',
            auth,
            body: JSON.stringify(data),
        })
    }

    async put<T>(url: string, data: object): Promise<T> {
        return this._fetchWithRetry(url, {
            method: 'PUT',
            body: JSON.stringify(data),
        })
    }

    async patch<T>(url: string, data: object): Promise<T> {
        return this._fetchWithRetry(url, {
            method: 'PATCH',
            body: JSON.stringify(data),
        })
    }

    async delete<T>(url: string): Promise<T> {
        return this._fetchWithRetry(url, { method: 'DELETE' })
    }

    async request<T>(url: string, options: HttpOptions): Promise<T> {
        return this._fetchWithRetry(url, options)
    }
}

export default new HttpService()