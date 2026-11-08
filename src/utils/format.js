export const FORMATOS = { FISICO: 'Físico', DIGITAL: 'Digital' };
export const TIPOS = { VENTA: 'Venta', PRESTAMO: 'Préstamo', AMBOS: 'Venta y préstamo' };
export const ROLES = { USUARIO: 'Usuario', VENDEDOR: 'Vendedor', ADMIN: 'Administrador' };
export const ESTADOS_LIBRO = { DISPONIBLE: 'Disponible', PRESTADO: 'Prestado', AGOTADO: 'Agotado' };
export const ESTADOS_PRESTAMO = { ACTIVO: 'Activo', VENCIDO: 'Vencido', DEVUELTO: 'Devuelto' };

export function moneda(valor) {
  if (valor === null || valor === undefined) return '';
  return `$${Number(valor).toFixed(2)}`;
}

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/** "2026-11-07" -> "7 nov 2026" (sin depender de Intl, que varía entre Android y web). */
export function fecha(iso) {
  if (!iso) return '';
  const [a, m, d] = iso.slice(0, 10).split('-').map(Number);
  return `${d} ${MESES[m - 1]} ${a}`;
}

/** Días entre hoy y una fecha ISO (positivo = en el futuro). */
export function diasHasta(iso) {
  const [a, m, d] = iso.slice(0, 10).split('-').map(Number);
  const objetivo = new Date(a, m - 1, d);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return Math.round((objetivo - hoy) / 86400000);
}

export const admitePrestamo = (libro) => libro.tipo === 'PRESTAMO' || libro.tipo === 'AMBOS';
export const admiteVenta = (libro) => libro.tipo === 'VENTA' || libro.tipo === 'AMBOS';
