import { useState } from 'react';
import { prestamosApi } from '../api/services';
import { avisar, confirmar } from '../utils/dialogs';
import { moneda } from '../utils/format';

/** HU-14 / CU-14: registrar devolución; muestra la multa si la hubo. */
export function useDevolucion(alTerminar) {
  const [devolviendoId, setDevolviendoId] = useState(null);

  async function devolver(prestamo) {
    const multa = Number(prestamo.multa) > 0 ? `\n\nSe generará una multa de ${moneda(prestamo.multa)} por retraso.` : '';
    const ok = await confirmar('Registrar devolución', `¿Confirmas la devolución de "${prestamo.libro.titulo}"?${multa}`, 'Devolver');
    if (!ok) return;
    setDevolviendoId(prestamo.id);
    try {
      const r = await prestamosApi.devolver(prestamo.id);
      avisar(
        'Devolución registrada',
        Number(r.multa) > 0 ? `Multa por ${r.diasRetraso} día(s) de retraso: ${moneda(r.multa)}` : 'Entregado a tiempo, sin multa. ¡Gracias!',
      );
      alTerminar?.(r);
    } catch (e) {
      avisar('No se pudo registrar', e.message);
    } finally {
      setDevolviendoId(null);
    }
  }

  return { devolver, devolviendoId };
}
