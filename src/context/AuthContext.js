import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { onSesionExpirada, setToken } from '../api/client';
import { authApi } from '../api/services';
import { borrarSesion, guardarSesion, leerSesion } from '../utils/sessionStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(null); // { token, usuario }
  const [cargando, setCargando] = useState(true);

  const cerrarSesion = useCallback(async () => {
    setToken(null);
    setSesion(null);
    await borrarSesion();
  }, []);

  // Restaurar la sesión guardada y validar que el token siga vigente.
  useEffect(() => {
    onSesionExpirada(() => { cerrarSesion(); });
    (async () => {
      const guardada = await leerSesion();
      if (guardada?.token) {
        setToken(guardada.token);
        try {
          const usuario = await authApi.me();
          const actualizada = { token: guardada.token, usuario };
          setSesion(actualizada);
          await guardarSesion(actualizada);
        } catch (e) {
          if (e.status === 0) {
            setSesion(guardada); // sin conexión: conservar la sesión local
          } else {
            await cerrarSesion();
          }
        }
      }
      setCargando(false);
    })();
  }, [cerrarSesion]);

  const iniciarSesion = useCallback(async (email, password) => {
    const res = await authApi.login(email.trim(), password);
    const nueva = { token: res.token, usuario: res.usuario };
    setToken(res.token);
    await guardarSesion(nueva);
    setSesion(nueva);
    return res.usuario;
  }, []);

  const registrarse = useCallback(async ({ nombre, email, password }) => {
    await authApi.registro({ nombre: nombre.trim(), email: email.trim(), password });
    return iniciarSesion(email, password);
  }, [iniciarSesion]);

  const valor = useMemo(() => {
    const rol = sesion?.usuario?.rol;
    return {
      sesion,
      usuario: sesion?.usuario ?? null,
      cargando,
      esStaff: rol === 'VENDEDOR' || rol === 'ADMIN',
      esAdmin: rol === 'ADMIN',
      iniciarSesion,
      registrarse,
      cerrarSesion,
    };
  }, [sesion, cargando, iniciarSesion, registrarse, cerrarSesion]);

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
