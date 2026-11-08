# PuntoComa-front

App móvil de **Punto&Coma** (Expo SDK 58 · React Native · Expo Router). Backend: [PuntoComa-back](https://github.com/valmejia/PuntoComa-back).

## Ejecutar

```bash
npm install
npx expo start
```

La app busca el backend en el puerto **8080**:

- Celular con Expo Go: usa automáticamente la IP de tu computadora (deben estar en la misma red Wi‑Fi).
- Emulador Android: `http://10.0.2.2:8080`. Web: `http://localhost:8080`.
- Para otra URL crea un archivo `.env` con `EXPO_PUBLIC_API_URL=http://TU_IP:8080` (ver `.env.example`).

Usuarios de prueba que crea el backend: `admin@puntocoma.com / Admin12345` y `vendedor@puntocoma.com / Vendedor123`.

## Diseño (UX/UI)

Las pantallas siguen el prototipo de Figma (CA-08): paleta `COLORS` y tipografías Playfair Display / Plus Jakarta Sans
definidas en `src/theme/colors.js`. Pantallas de los Sprints 1 y 2: Splash, Bienvenida, Iniciar Sesión, Registro,
Catálogo (Inicio), Detalle, Préstamos y Devoluciones, Biblioteca (inventario propio), Control de Circulación y Usuarios.

## Estructura

```
src/
  app/                 Rutas (Expo Router)
    (auth)/            bienvenida, login, registro (sólo sin sesión)
    (tabs)/            inicio (catálogo), préstamos, biblioteca, gestión*, perfil
    admin/usuarios.js  usuarios y roles (sólo ADMIN, se abre desde Gestión)
    libro/[id].js      detalle del libro y solicitud de préstamo
    publicar.js        publicar / editar libro
  api/                 cliente HTTP y servicios del backend
  screens/             Splash, Bienvenida, Login y Registro (diseño de Figma)
  components/          componentes reutilizables
  context/AuthContext  sesión JWT (expo-secure-store; localStorage en web)
  hooks/ utils/ theme/
```
\* *Gestión* (Control de Circulación) sólo para VENDEDOR/ADMIN.

## Funcionalidad por sprint

**Sprint 1** — HU-01 registro con validaciones · HU-02 login con JWT y menú según rol · HU-03 catálogo con búsqueda y filtros (autor, género, formato, tipo, disponibilidad) · gestión de roles (admin).

**Sprint 2** — HU-04 publicar/editar/eliminar libro (venta, préstamo o ambos; físico o digital) · HU-05 solicitar préstamo (7–30 días) con actualización inmediata del inventario · HU-14 registrar devolución con cálculo de multa · panel de préstamos para vendedor/administrador.

## Scripts

```bash
npx expo lint   # lint
```
