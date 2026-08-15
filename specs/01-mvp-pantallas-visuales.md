# 01 — MVP: pantallas visuales de Arcade Vault

- **Estado:** Aprobado
- **Depende de:** ninguno
- **Fecha:** 2026-08-15
- **Objetivo:** Portar a Next 16 App Router las cinco pantallas del prototipo de `references/templates/` como maqueta visual navegable con datos mock, sin juegos reales ni backend.

## Alcance

### Dentro

- Las 5 pantallas del prototipo: Biblioteca, Detalle de juego, Reproductor, Auth, Salón de la Fama.
- Nav global (con panel móvil) y footer, montados en el layout raíz.
- Datos mock tipados en TypeScript (catálogo de 8 juegos, categorías, generador determinista de tablas de puntuación).
- Sesión mock cliente-only (Context + `localStorage['av_user']`): login falso, invitado, cierre de sesión.
- Simulación puramente visual del reproductor (puntuación que sube sola, vidas, nivel, pausa, modal de fin de partida) — es una maqueta CSS/JS, no un motor de juego.
- Manejo de rutas dinámicas inexistentes con `notFound()` (404).

### Fuera

- Lógica de juego real (canvas, motor, colisiones, inputs de juego).
- Backend, API routes o base de datos.
- Autenticación real (los botones de Google/GitHub son decorativos, sin OAuth).
- Persistencia de puntuaciones (`av_scores` del prototipo no se implementa).
- Contador de créditos funcional (se muestra estático, "CRÉDITOS · 03").
- Tests automatizados.
- Reescritura del CSS existente a utilidades Tailwind.
- Internacionalización (todo el contenido queda en español, como el prototipo).

## Estado del repositorio (contexto para la implementación)

- `app/globals.css` ya contiene el CSS completo de `references/templates/styles.css` (todas las clases de nav, cards, CRT, podio, tabla, covers y animaciones). No requiere cambios.
- `app/layout.tsx` ya monta `.av-bg`, `.av-noise`, `#root` y las 3 fuentes (`Press_Start_2P`, `JetBrains_Mono`, `Courier_Prime`) vía `next/font/google`, y ya usa el tipo global `LayoutProps<"/">`.
- `app/page.tsx` es un hero provisional que esta spec reemplaza por la Biblioteca.
- No existen aún `components/`, `lib/`, ni las rutas `/juego/[id]`, `/jugar/[id]`, `/auth`, `/salon`.

## Modelo de datos

`lib/games.ts` (módulo compartido, sin `"use client"`):

```ts
export type GameCategory = "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";

export type Game = {
  id: string;
  title: string;
  short: string;
  long: string;
  cat: GameCategory;
  cover: string;
  color: "cyan" | "magenta" | "yellow" | "green";
  best: number;
  plays: string;
};

export const GAMES: Game[];              // los 8 juegos de data.jsx, sin cambios
export const CATS: readonly string[];    // ["TODOS", ...categorías]

export type ScoreRow = { rank: number; name: string; score: number; date: string };
export function seededScores(seed: number, count?: number): ScoreRow[];
export function getGame(id: string): Game | undefined;
```

`seededScores` se porta **sin alterar el algoritmo** (LCG `s = (s * 9301 + 49297) % 233280`), para que servidor y cliente calculen la misma tabla y no se produzcan mismatches de hidratación.

Sesión: `type SessionUser = { name: string }`, definido en `components/session-provider.tsx`.

## Plan de implementación

Cada paso deja el proyecto compilando.

1. **`lib/games.ts`** — portar `data.jsx` con tipos TS (`GAMES`, `CATS`, `seededScores`, `getGame`).
2. **`components/session-provider.tsx`** (`"use client"`) — Context con `{ user, login(name), signOut() }`. Lee `av_user` de `localStorage` dentro de `useEffect` (nunca durante el render inicial, para evitar mismatch de hidratación) y escribe en `login`/`signOut`. Expone `useSession()`.
3. **`components/nav.tsx`** (`"use client"`) — portar `nav.jsx`: `<Link>` de `next/link` en vez de `navigate()`, estado activo vía `usePathname()`, panel móvil con `useState`, botón que muestra `user.name` o "Iniciar Sesión". Contador "CRÉDITOS · 03" estático.
4. **`app/layout.tsx`** — envolver `children` con `<SessionProvider>`, añadir `<Nav />`, `<main className="av-main">{children}</main>` y el footer del prototipo ("© 2026 ARCADE VAULT · HECHO CON PIXELES Y NEÓN · v2.6.0"). Se mantienen `LayoutProps<"/">`, las fuentes y `.av-bg`/`.av-noise` tal como están.
5. **`app/page.tsx` + `components/library.tsx`** — reemplazar el hero provisional por la Biblioteca portada de `biblioteca.jsx`: hero, buscador, chips de categoría, grid de tarjetas, `GameCard` con tilt 3D en `onMouseMove`, estado vacío "NO HAY RESULTADOS". Página server que renderiza el componente cliente con `GAMES`/`CATS`.
6. **`app/juego/[id]/page.tsx` + `components/game-detail.tsx`** — portar `detalle.jsx`. Página server `async`, tipada con `PageProps<"/juego/[id]">`, hace `await params`; `notFound()` si el id no existe en `GAMES`; `generateStaticParams()` desde `GAMES`; `generateMetadata` con el título del juego. La tabla de puntuaciones se calcula en el servidor con `seededScores`. "JUGAR AHORA" navega a `/jugar/[id]`.
7. **`app/jugar/[id]/page.tsx` + `components/game-player.tsx`** — portar `reproductor.jsx` con la simulación completa (`setInterval` de puntuación, vidas, nivel, pausa, modal de fin de partida). Mismo patrón server (resuelve `params`, `notFound()`) + componente cliente para la interacción. El botón GUARDAR PUNTUACIÓN solo cambia el estado visual a `.toast-saved`, sin persistir nada.
8. **`app/auth/page.tsx` + `components/auth-form.tsx`** — portar `auth.jsx`: pestañas "Iniciar sesión" / "Crear cuenta", campo de correo con animación `.slide-in` solo en modo "crear", submit llama a `login(usuario || "PLAYER1")` y navega a `/` con `router.push`. "JUGAR COMO INVITADO" navega sin loguear. Botones sociales son `type="button"` inertes.
9. **`app/salon/page.tsx` + `components/hall-of-fame.tsx`** — portar `salon.jsx`: chips por juego, podio (plata-oro-bronce), tabla con `animationDelay` escalonado por fila, y fila "▸ TU MEJOR MARCA EN …" solo cuando hay sesión activa.
10. **Verificación final** — `npm run lint` y `npm run build` sin errores; recorrido manual de las 5 rutas.

## Criterios de aceptación

- [ ] Responden con 200: `/`, `/juego/bloque-buster`, `/jugar/bloque-buster`, `/auth`, `/salon`.
- [ ] `/juego/id-inexistente` y `/jugar/id-inexistente` devuelven 404.
- [ ] La Biblioteca muestra 8 tarjetas; filtrar por "PUZZLE" deja 1 resultado; buscar "zzz" muestra "NO HAY RESULTADOS".
- [ ] El Nav marca como activo el enlace de la ruta actual; `/juego/*` y `/jugar/*` marcan "Biblioteca" como activa.
- [ ] Tras enviar el formulario de `/auth` con usuario `px_kai`, el Nav muestra `PX_KAI ▾`, la sesión persiste al recargar la página, y desaparece al pulsar el botón (cierre de sesión).
- [ ] Con sesión activa, `/salon` muestra la fila amarilla "▸ TU MEJOR MARCA EN …"; sin sesión, esa fila no aparece.
- [ ] En `/jugar/[id]` la puntuación sube sola; PAUSA la congela y muestra el overlay "EN PAUSA"; FIN abre el modal de fin de partida; GUARDAR PUNTUACIÓN cambia a "▸ PUNTUACIÓN GUARDADA_".
- [ ] La tabla de puntuaciones de `/salon` (y de `/juego/[id]`) muestra los mismos valores en cada recarga para el mismo juego (determinista, sin aleatoriedad real).
- [ ] `npm run build` y `npm run lint` terminan sin errores ni warnings.
- [ ] No aparecen warnings de mismatch de hidratación en la consola del navegador en ninguna ruta.
- [ ] Ningún archivo bajo `references/` ha sido modificado.
- [ ] No se escribe `av_scores` en `localStorage` en ningún punto del flujo.

## Decisiones tomadas y descartadas

- **Rutas reales del App Router** (`/`, `/juego/[id]`, `/jugar/[id]`, `/auth`, `/salon`) en vez de una SPA con routing por hash (como el prototipo). Se descarta el hash-routing porque desaprovecha el App Router, no da URLs compartibles ni soporta `notFound()`/metadata por ruta.
- **Sesión mock con Context + `localStorage`**, replicando `av_user` del prototipo, en vez de no tener estado de sesión. Se necesita para reproducir los estados visuales del Nav y la fila "tu mejor marca" del Salón; sin ella se pierde parte del alcance visual pedido.
- **Reproductor con la simulación completa** (score animado, pausa, modal de fin), aunque no haya juego real. Es la maqueta visual del prototipo, no lógica de juego: se porta tal cual para no dejar esa pantalla vacía.
- **Guardar puntuación es solo feedback visual** (toast), sin escribir en `localStorage`. El prototipo persiste `av_scores` pero ninguna pantalla lo lee después; incluirlo sería código muerto fuera del alcance "solo visual".
- **Mantener el CSS plano de `globals.css`** en vez de reescribirlo a utilidades Tailwind v4. El prototipo visual ya está validado por el usuario; reescribirlo es riesgo puro sin ganancia, y no está en el alcance de este spec.

## Riesgos identificados

- **Mismatch de hidratación** por leer `localStorage` durante el render inicial → mitigado leyendo la sesión dentro de `useEffect`, nunca en el estado inicial de `useState`.
- **Animación de puntuación en el render inicial** del reproductor → el `setInterval` arranca en `useEffect`; el estado inicial de `score` es siempre `0` tanto en servidor como en cliente.
- **`LayoutProps`/`PageProps`** se resuelven desde `.next/types`, generado solo tras `next dev` o `next build` → si TypeScript no reconoce los tipos globales de ruta, ejecutar `npm run build` una vez para regenerarlos.
- Los tipos globales de rutas hacen type-checked cada `<Link href="...">`: un nombre de carpeta mal escrito produce el error en el `Link` que apunta ahí, no en la página de destino.
