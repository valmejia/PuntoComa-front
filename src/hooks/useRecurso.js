import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Carga datos del backend y los recarga cada vez que la pantalla recibe el foco
 * (y cuando cambian `deps`), para que la disponibilidad se vea siempre actualizada.
 */
export function useRecurso(cargar, deps = []) {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const peticion = useRef(0);
  const cargarRef = useRef(cargar);
  useEffect(() => { cargarRef.current = cargar; });

  const clave = JSON.stringify(deps);

  const ejecutar = useCallback(async (modo = 'carga') => {
    const id = ++peticion.current;
    if (modo === 'refresco') setRefrescando(true);
    try {
      const r = await cargarRef.current();
      if (id === peticion.current) {
        setDatos(r);
        setError(null);
      }
    } catch (e) {
      if (id === peticion.current) setError(e.message);
    } finally {
      if (id === peticion.current) {
        setCargando(false);
        setRefrescando(false);
      }
    }
    // `clave` hace que cambie la función (y se recargue) cuando cambian los filtros.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave]);

  useFocusEffect(useCallback(() => { ejecutar(); }, [ejecutar]));

  return {
    datos,
    setDatos,
    error,
    cargando: cargando && datos === null,
    refrescando,
    recargar: () => ejecutar('carga'),
    refrescar: () => ejecutar('refresco'),
  };
}
