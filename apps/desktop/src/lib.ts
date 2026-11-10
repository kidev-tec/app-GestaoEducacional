/**
 * Lógica pura do desktop (sem side-effects de Electron) — testável 100×4.
 */
import * as path from 'node:path';
import { existsSync } from 'node:fs';

/** Decisão pura de qual URL/carregar. */
export function resolveTargetUrl(dirname: string, env: NodeJS.ProcessEnv, isPackaged: boolean, resourcesPath?: string): { kind: 'file'; filePath: string } | { kind: 'url'; url: string } {
  if (!isPackaged && env.VITE_DEV_SERVER_URL) {
    return { kind: 'url', url: env.VITE_DEV_SERVER_URL };
  }
  // Empacotado: web-dist vive em resources/ FORA do asar (extraResources).
  // O shim do asar resolve 'app.asar/..' como 'app.asar' (virtual) — path real
  // só via process.resourcesPath. dirname (asar) usado só no fallback dev.
  const base = resourcesPath ?? path.join(dirname, '..');
  const webDist = path.join(base, 'web-dist', 'index.html');
  if (existsSync(webDist)) {
    return { kind: 'file', filePath: webDist };
  }
  // fallback: dist do workspace (dev sem electron-builder)
  const monorepoWebDist = path.join(dirname, '..', '..', '..', 'apps', 'web', 'dist', 'index.html');
  if (existsSync(monorepoWebDist)) {
    return { kind: 'file', filePath: monorepoWebDist };
  }
  return { kind: 'url', url: env.ERP_FALLBACK_URL ?? 'http://localhost:5173' };
}

/** Só permite navegação para origens locais autorizadas (ou file:). */
export function isAllowedUrl(target: string, allowedHosts: readonly string[] = ['localhost', '127.0.0.1']): boolean {
  try {
    const url = new URL(target);
    if (url.protocol === 'file:') return true;
    return allowedHosts.includes(url.hostname);
  } catch {
    return false;
  }
}
