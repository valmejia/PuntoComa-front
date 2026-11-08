import { API_URL } from './config';

const TIMEOUT_MS = 15000;

let tokenActual = null;
let alExpirarSesion = null;

export function setToken(token) {
  tokenActual = token;
}

/** Callback que se ejecuta cuando el backend responde 401 (token vencido o inválido). */
export function onSesionExpirada(callback) {
  alExpirarSesion = callback;
}

/** Error con el formato del backend: { status, mensaje, errores: { campo: mensaje } }. */
export class ApiError extends Error {
  constructor(status, mensaje, errores = null) {
    super(mensaje);
    this.status = status;
    this.errores = errores;
  }
}

export async function request(path, { method = 'GET', body, query, auth = true } = {}) {
  let url = `${API_URL}${path}`;
  if (query) {
    const params = Object.entries(query)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
    if (params) url += `?${params}`;
  }

  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth && tokenActual) headers.Authorization = `Bearer ${tokenActual}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor. Revisa tu conexión e intenta de nuevo.');
  } finally {
    clearTimeout(timer);
  }

  if (res.status === 204) return null;

  const texto = await res.text();
  let data = null;
  if (texto) {
    try {
      data = JSON.parse(texto);
    } catch {
      data = texto;
    }
  }

  if (!res.ok) {
    if (res.status === 401 && auth && tokenActual && alExpirarSesion) alExpirarSesion();
    const mensaje =
      (data && typeof data === 'object' && data.mensaje) ||
      (typeof data === 'string' && data) ||
      `Error ${res.status}`;
    throw new ApiError(res.status, mensaje, data?.errores ?? null);
  }
  return data;
}
