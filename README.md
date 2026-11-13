# Desktop App — Gestão Educacional (KIDEV Tec)

Aplicação desktop (Electron) do sistema de gestão educacional. Empacota o frontend web como app nativo.

## Stack

- **Electron 45 + TypeScript 5.9** — electron-builder 26
- **UI**: build do repo `site-GestaoEducacional` (React 19), embutido via `extraResources`
- **Testes**: Vitest — unit

## Rodar

Requer o clone irmão do site:

```
erp-split/
├── api/     # opcional localmente
├── site/    # obrigatório — build:web compila daqui
└── app/     # este repo
```

```bash
# 1. site primeiro (o app consome o build dele)
cd ../site && npm install
# 2. app
cd ../app && npm install
npm run build:web    # compila ../../../site/apps/web → web-dist
npm run dev
```

## Build

```bash
npm run build        # gera instaladores (electron-builder): AppImage/deb/exe
```

## CI

`.github/workflows/gates.yml` — checkout do site (main) + symlink + build completo.

## Fluxo de branches

`feat/**` → PR → `staging` → PR → `main`

## Ecossistema

| Repo | Papel |
|------|-------|
| `api-GestaoEducacional` | API (Fastify 5 + Postgres, monorepo core/education/infra) |
| `site-GestaoEducacional` | Frontend web (React 19 + Vite) |
| `app-GestaoEducacional` | Este desktop (Electron, empacota o web) |
