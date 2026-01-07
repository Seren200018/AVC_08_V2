# AVC 08 – Tilger

Diese Vorlesung nutzt das Template als npm-GitHub-Dependency:

```bash
npm install Seren200018/Vorlesung-Skript-Template#Latest
```

## Start

```bash
npm install
npm run dev:tilger
```

## Template aktualisieren

```bash
npm run template:update
```

`template:update` kopiert anschließend automatisch die benötigten `dist/`-Assets nach `src/template-assets/`, damit das
Projekt auch dann buildbar bleibt, wenn das Template-Paket fehlerhafte `exports`-Einträge hat.

## GitHub Pages

- Workflow: `.github/workflows/deploy.yml` baut `dist/` und deployt auf GitHub Pages.
- Repo-Settings: `Settings → Pages → Build and deployment → Source: GitHub Actions`.
