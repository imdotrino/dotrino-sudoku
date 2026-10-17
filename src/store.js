// Persistencia OBLIGATORIA vía @dotrino/store (store.dotrino.com,
// §4): las partidas en curso por nivel (para reanudar) y el progreso (estrellas,
// mejores tiempos, pistas, racha diaria) viven en el vault del ecosistema
// (IndexedDB, cuota grande, sync opcional cifrado a Drive). Si el iframe del store
// no carga (offline / bloqueado), caemos a un shim sobre localStorage para no
// perder funcionalidad. localStorage queda solo para prefs de UI (idioma).

const THREAD_GAME = 'sudoku.saves';   // mapa de partidas en curso por nivel
const THREAD_PROGRESS = 'sudoku.progress';

let backendPromise = null;

// SIN REPLIEGUE SILENCIOSO (2026-09-30). Hasta ahora, si el almacén no abría, la partida se
// guardaba sin avisar en localStorage (`sudoku.shim.<hilo>`) y no llegaba nunca a la bóveda.
// Ahora: la partida sigue EN MEMORIA y se DICE en pantalla (`onStoreProblem`), y lo que ya se
// había guardado por ese camino se trae al almacén una vez (`importShim`), sin borrarlo.
let problem = null;
const problemListeners = new Set();
/** Avisa (y avisa al suscribirse, si ya pasó) de que el almacén no abrió: no se guarda nada. */
export function onStoreProblem (fn) {
  problemListeners.add(fn);
  if (problem) fn(problem);
  return () => problemListeners.delete(fn);
}

function memoryBackend () {
  const mem = new Map();
  return {
    kind: 'memory',
    async appendMessage (t, e) { const a = mem.get(t) || []; a.push(e); mem.set(t, a); },
    async listThread (t) { return mem.get(t) || []; },
    async removeThread (t) { mem.delete(t); },
  };
}

const SHIM_PREFIX = 'sudoku.shim.';
const SHIM_DONE = 'sudoku.shim.imported';
/** Trae al almacén, UNA vez, lo que guardó el repliegue viejo; solo los hilos que el almacén no tiene. */
async function importShim (store) {
  let done = null;
  try { done = localStorage.getItem(SHIM_DONE); } catch { return; }
  if (done) return;
  const threads = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k || !k.startsWith(SHIM_PREFIX) || k === SHIM_DONE) continue;
    let arr = null;
    try { arr = JSON.parse(localStorage.getItem(k) || '[]'); } catch { arr = null; }
    if (Array.isArray(arr) && arr.length) threads[k.slice(SHIM_PREFIX.length)] = arr;
  }
  for (const t of Object.keys(threads)) {
    const existing = await store.listThread(t);
    if (existing.length) delete threads[t];   // lo del almacén es más nuevo que el repliegue
  }
  if (Object.keys(threads).length) await store.importThreads(threads, 'merge');
  localStorage.setItem(SHIM_DONE, String(Date.now()));
}

async function getBackend() {
  if (backendPromise) return backendPromise;
  backendPromise = (async () => {
    try {
      const mod = await import('@dotrino/store');
      const { getIdentity } = await import('./services/identity.js');
      const identity = await getIdentity();
      // Atado al PERFIL (respaldo en la bóveda, sin mezclar cuentas). Hasta 2026-09-30 conectaba
      // sin identidad y todo quedaba en el espacio común del navegador; `adoptCommon` lo trae al
      // perfil una vez, sin borrar el original.
      if (!identity) throw Object.assign(new Error('identity not available'), { code: 'no-identity' });
      const store = await mod.Store.connect({ identity, adoptCommon: ['sudoku.'] });
      await importShim(store);
      if (store && typeof store.appendMessage === 'function' && typeof store.listThread === 'function') {
        return {
          kind: 'store', store,
          appendMessage: (t, e) => store.appendMessage(t, e),
          listThread: (t, o) => store.listThread(t, o),
          removeThread: t => store.removeThread(t),
        };
      }
      throw new Error('store API mismatch');
    } catch (e) {
      console.error('[sudoku] store unavailable: this game is NOT being saved', e);
      problem = e;
      for (const fn of problemListeners) fn(e);
      return memoryBackend();
    }
  })();
  return backendPromise;
}

export async function storeKind() { return (await getBackend()).kind; }

// --- Partidas en curso, una por NIVEL (mapa key→partida + último jugado) ---
// Se guarda TODO el objeto de saves en un único registro (se sobrescribe). Así,
// salir de un nivel y volver lo reanuda lleno hasta resolverlo.
export async function loadSaves() {
  const b = await getBackend();
  try {
    const entries = await b.listThread(THREAD_GAME, { limit: 1 });
    if (entries && entries.length) {
      const last = entries[entries.length - 1];
      if (last && last.saves) return last.saves;
    }
  } catch {}
  return { map: {}, last: null };
}

export async function saveSaves(saves) {
  const b = await getBackend();
  try { await b.removeThread(THREAD_GAME); } catch {}
  await b.appendMessage(THREAD_GAME, { id: 'saves', ts: Date.now(), saves });
}

// --- Progreso de la aventura (mapa de niveles: estrellas por nodo) ---
// { [nodeId]: { done, stars, bestMs, shareStar } } — un único registro, se sobrescribe.
export async function loadProgress() {
  const b = await getBackend();
  try {
    const entries = await b.listThread(THREAD_PROGRESS, { limit: 1 });
    if (entries && entries.length) {
      const last = entries[entries.length - 1];
      if (last && last.progress) return last.progress;
    }
  } catch {}
  return {};
}

export async function saveProgress(progress) {
  const b = await getBackend();
  try { await b.removeThread(THREAD_PROGRESS); } catch {}
  await b.appendMessage(THREAD_PROGRESS, { id: 'progress', ts: Date.now(), progress });
}

/** El almacén del ecosistema ya atado al perfil, para el punto del respaldo del topbar (null si no abrió). */
export async function storeHandle () {
  const b = await getBackend();
  if (b.kind !== 'store') return null;
  return (await import('@dotrino/store')).Store.current();
}
