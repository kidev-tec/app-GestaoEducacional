import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import * as path from 'node:path';
import { resolveTargetUrl, isAllowedUrl } from '../src/lib.js';

describe('resolveTargetUrl (decisão de carga)', () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), 'erp-desktop-'));
  });
  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  function makeEnv(over: Record<string, string | undefined> = {}): NodeJS.ProcessEnv {
    return { ...over } as NodeJS.ProcessEnv;
  }

  it('dev com VITE_DEV_SERVER_URL → url do dev server (não packaged)', () => {
    const t = resolveTargetUrl(dir, makeEnv({ VITE_DEV_SERVER_URL: 'http://localhost:5173' }), false);
    expect(t).toEqual({ kind: 'url', url: 'http://localhost:5173' });
  });

  it('VITE_DEV_SERVER_URL ignorado quando packaged → dist empacotado se existir', () => {
    // simula __dirname em release: dir/web-dist/index.html existe
    const fakeDirname = path.join(dir, 'dist');
    mkdirSync(fakeDirname, { recursive: true });
    mkdirSync(path.join(dir, 'web-dist'));
    writeFileSync(path.join(dir, 'web-dist', 'index.html'), '<html></html>');
    const t = resolveTargetUrl(fakeDirname, makeEnv({ VITE_DEV_SERVER_URL: 'http://localhost:5173' }), true);
    expect(t.kind).toBe('file');
    if (t.kind === 'file') expect(t.filePath).toBe(path.join(dir, 'web-dist', 'index.html'));
  });

  it('packaged sem web-dist → dist do monorepo se existir', () => {
    const fakeDirname = path.join(dir, 'apps', 'desktop', 'dist');
    mkdirSync(path.join(dir, 'apps', 'web', 'dist'), { recursive: true });
    writeFileSync(path.join(dir, 'apps', 'web', 'dist', 'index.html'), '<html></html>');
    const t = resolveTargetUrl(fakeDirname, {}, true);
    expect(t.kind).toBe('file');
    if (t.kind === 'file') expect(t.filePath).toBe(path.join(dir, 'apps', 'web', 'dist', 'index.html'));
  });

  it('nada existe → fallback ERP_FALLBACK_URL, default localhost:5173', () => {
    const fakeDirname = path.join(dir, 'nowhere');
    const t1 = resolveTargetUrl(fakeDirname, {}, true);
    expect(t1).toEqual({ kind: 'url', url: 'http://localhost:5173' });
    const t2 = resolveTargetUrl(fakeDirname, { ERP_FALLBACK_URL: 'http://127.0.0.1:5173' }, true);
    expect(t2).toEqual({ kind: 'url', url: 'http://127.0.0.1:5173' });
  });

  it('dev sem VITE_DEV_SERVER_URL usa hierarquia normal (dist/monorepo/fallback)', () => {
    const fakeDirname = path.join(dir, 'nowhere');
    const t = resolveTargetUrl(fakeDirname, {}, false);
    expect(t.kind === 'url' ? t.url : t.filePath).toBeDefined();
  });
});

describe('isAllowedUrl (gate de navegação)', () => {
  it('permite file: e localhost/127.0.0.1', () => {
    expect(isAllowedUrl('file:///app/index.html')).toBe(true);
    expect(isAllowedUrl('http://localhost:5173')).toBe(true);
    expect(isAllowedUrl('http://127.0.0.1:3000/v1')).toBe(true);
  });

  it('bloqueia externos, protocolos estranhos e lixo', () => {
    expect(isAllowedUrl('https://evil.example')).toBe(false);
    expect(isAllowedUrl('javascript:alert(1)')).toBe(false);
    expect(isAllowedUrl('data:text/html,<script>x</script>')).toBe(false);
    expect(isAllowedUrl('')).toBe(false);
    expect(isAllowedUrl('not a url')).toBe(false);
  });

  it('hostname exato — subdomínio não passa', () => {
    expect(isAllowedUrl('http://localhost.evil.example')).toBe(false);
    expect(isAllowedUrl('http://localhostx')).toBe(false);
  });

  it('allowedHosts custom', () => {
    expect(isAllowedUrl('http://staging.local:3000', ['staging.local'])).toBe(true);
    expect(isAllowedUrl('http://localhost:3000', ['staging.local'])).toBe(false);
  });
});
