/**
 * Preload mínimo — exposta APENAS a versão do app (nenhum node/ipc cru).
 */
import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('erpDesktop', {
  version: process.env.npm_package_version ?? '0.1.0',
  platform: process.platform,
});
