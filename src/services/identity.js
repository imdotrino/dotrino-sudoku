// Identidad = vault id.dotrino.com (única fuente). No reimplementamos nada:
// el pilar @dotrino/identity es quien habla con el vault (CLAUDE.md, regla principal).
import { Identity } from '@dotrino/identity';

let identity = null;

/** Instancia compartida de identidad (o null si el vault no responde). */
export async function getIdentity() {
  if (identity) return identity;
  try {
    identity = await Identity.connect();
  } catch (e) {
    console.warn('[identity] vault inalcanzable:', e && e.message);
    identity = null;
  }
  return identity;
}

export function myPubkey() { return identity?.me?.publickey || null; }
export function myName() { return identity?.me?.nickname || null; }
