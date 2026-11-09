/**
 * Teste de segurança do preload: garante que NADA além de erpDesktop é exposto,
 * e que a superfície exposta não contém ipcRenderer/fs/require/process.
 * (Analisa o código-fonte do preload — o bundle final é checado no QA.)
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import * as path from 'node:path';

describe('preload (superfície mínima — gate de segurança)', () => {
  const src = readFileSync(path.join(__dirname, '..', 'src', 'preload.ts'), 'utf-8');

  it('usa contextBridge e nada mais do Electron', () => {
    expect(src).toContain("from 'electron'");
    expect(src).toMatch(/contextBridge\.exposeInMainWorld\('erpDesktop'/);
  });

  it('NÃO importa ipcRenderer, fs, child_process nem expõe process cru', () => {
    expect(src).not.toMatch(/ipcRenderer/);
    expect(src).not.toMatch(/require\('fs'\)|from 'fs'/);
    expect(src).not.toMatch(/child_process/);
    expect(src).not.toMatch(/exposeInMainWorld\('process|exposeInMainWorld\('ipc/);
  });

  it('superfície exposta só tem version e platform (strings)', () => {
    expect(src).toContain('version:');
    expect(src).toContain('platform:');
    // nenhuma função exposta (superfície passiva)
    expect(src).not.toMatch(/:\s*\(\)\s*=>|function\s*\(/);
  });
});
