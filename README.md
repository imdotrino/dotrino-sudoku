# Sudoku — Dotrino

> **Parte del ecosistema [Dotrino](https://dotrino.com).** Dotrino es un ecosistema de aplicaciones centradas en la privacidad de los datos: tu información es tuya, y las decisiones sobre ella también — qué compartes, con quién, cuándo y por qué. Sin anuncios, sin cookies, sin rastreo de datos, sin vender tu identidad a nadie.

Sudoku del ecosistema **[Dotrino](https://dotrino.com/)**: *tu información, en
tu servidor, bajo tus reglas*. PWA instalable, **funciona sin conexión** y **sin
trackers de terceros**.

🔗 **https://sudoku.dotrino.com/**

## Qué tiene

- **Generador propio determinista** con **solución única** garantizada (backtracking
  con bitmasks + verificación de unicidad). El mismo nivel es el mismo reto para
  todos y se puede compartir por enlace.
- **Aventura con mapa de niveles**: caminos que **se bifurcan** y convergen en
  **jefes**, niveles que se **desbloquean con estrellas** (1–3 por nivel según tu
  rendimiento). Cuatro regiones: Fácil → Medio → Difícil → Experto.
- **Reto diario** determinista (el mismo para todo el mundo) con **racha**.
- **Pistas consumibles**: gánalas **compartiendo** un nivel (reta a un amigo y te
  llevas una pista) y gástalas cuando te atasques.
- Juego completo: **notas a lápiz**, **borrar**, **deshacer**, detección de
  **conflictos**, resaltado de fila/columna/caja y del mismo número, contador del
  teclado, **cronómetro** y pausa. Soporte de **teclado** (números, flechas, etc.).
- **Bilingüe es/en**, tema oscuro, responsive y amigable con el táctil.

## Privacidad

El SEO describe **la herramienta**, nunca tu contenido. Tus partidas, tiempos y
estrellas viven en tu **[store.dotrino.com](https://store.dotrino.com/)** (vault
del ecosistema); los puzzles compartidos viajan por **`#fragment`**, que no llega
al servidor ni es indexable. Analítica: **GoatCounter cookieless** autohospedado,
solo en producción.

## Stack

Vite (sin framework) + paquetes del ecosistema:
[`dotrino-store`](https://github.com/imdotrino/dotrino-store),
[`dotrino-share`](https://github.com/imdotrino/dotrino-share),
[`dotrino-install`](https://github.com/imdotrino/dotrino-install),
[`dotrino-nav`](https://github.com/imdotrino/dotrino-nav) y el Web
Component de soporte `dotrino-support`.

```bash
npm install
npm run dev      # desarrollo
npm run build    # build a dist/
```

Despliegue: **GitHub Pages** vía GitHub Actions (`.github/workflows/deploy.yml`).

## Apoya al proyecto

Ko-fi: <https://ko-fi.com/dotrino> · Discord: <https://discord.gg/D648uq7cth>

---

Parte del ecosistema **Dotrino** — apps cliente autohosteadas que comparten
identidad, transporte y almacenamiento. Hecho con software libre.
