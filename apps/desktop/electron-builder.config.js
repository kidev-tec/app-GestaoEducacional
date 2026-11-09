/**
 * ERP Platform — electron-builder config (entregável instalável).
 * Targets: Linux (deb/AppImage) sempre; Windows NSIS quando emite no Windows
 * (ou com wine no Linux). DMG universal exige macOS (não gerável no Linux) —
 * config pronta para build num Mac (target dmg universal: true).
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
  win: {
    target: ['nsis'],
    icon: 'build/icons/256x256.png',
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    artifactName: 'ERP-Platform-Setup-${version}.exe',
  },
  mac: {
    target: [{ target: 'dmg', arch: ['x64', 'arm64', 'universal'] }],
    category: 'public.app-category.business',
    icon: 'build/icons/512x512.png',
  },
  dmg: {
    icon: 'build/icons/512x512.png',
  },
};
