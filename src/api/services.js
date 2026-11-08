import { request } from './client';

export const authApi = {
  registro: (datos) => request('/api/auth/registro', { method: 'POST', body: datos, auth: false }),
  login: (email, password) => request('/api/auth/login', { method: 'POST', body: { email, password }, auth: false }),
  me: () => request('/api/auth/me'),
};

export const librosApi = {
  /** filtros: { q, autor, genero, formato, tipo, disponible } */
  catalogo: (filtros) => request('/api/libros', { query: filtros }),
  generos: () => request('/api/libros/generos'),
  autores: () => request('/api/libros/autores'),
  detalle: (id) => request(`/api/libros/${id}`),
  mios: () => request('/api/libros/mios'),
  publicar: (libro) => request('/api/libros', { method: 'POST', body: libro }),
  actualizar: (id, libro) => request(`/api/libros/${id}`, { method: 'PUT', body: libro }),
  eliminar: (id) => request(`/api/libros/${id}`, { method: 'DELETE' }),
};

export const prestamosApi = {
  solicitar: (libroId, dias) => request('/api/prestamos', { method: 'POST', body: { libroId, dias } }),
  mios: () => request('/api/prestamos/mios'),
  recibidos: () => request('/api/prestamos/recibidos'),
  todos: (estado) => request('/api/prestamos', { query: { estado } }),
  devolver: (id) => request(`/api/prestamos/${id}/devolucion`, { method: 'PUT' }),
};

export const adminApi = {
  usuarios: () => request('/api/admin/usuarios'),
  cambiarRol: (id, rol) => request(`/api/admin/usuarios/${id}/rol`, { method: 'PUT', body: { rol } }),
  cambiarEstado: (id, activo) => request(`/api/admin/usuarios/${id}/estado`, { method: 'PUT', body: { activo } }),
};
