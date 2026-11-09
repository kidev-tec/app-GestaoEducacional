/**
 * ERP Platform — electron-builder config (entregável instalável).
 */
module.exports = {
  appId: 'br.com.erp.platform',
  productName: 'ERP Platform',
  directories: {
    output: 'release',
    buildResources: 'build',
  },
  files: [
    'dist/**/*',
    'package.json',
  ],
  extraResources: [
    { from: '../web/dist', to: 'web-dist' },
  ],
  asar: true,
  linux: {
    target: ['deb', 'AppImage'],
    category: 'Office',
    maintainer: 'ERP Platform',
    icon: 'build/icons',
  },
  deb: {
    depends: ['libgtk-3-0', 'libnotify4', 'libnss3', 'libxss1', 'libxtst6'],
  },
};
