# AVC 08 – Tilger

## Start

```bash
npm install
npm run dev:tilger
```

## Template-Update (GitHub `#Latest`)

Die Template-Basis kommt als npm-GitHub-Dependency:

- Install/Update: `npm run template:update`
- Danach ggf. neu starten: `npm run dev:tilger`

Hinweis: Wenn sich `#Latest` (Tag) im Upstream verschiebt, holt `npm run template:update` den neuen Stand.

## GitHub Pages

1. Push auf Branch `main`.
2. In GitHub: `Settings → Pages → Build and deployment → Source: GitHub Actions`.
3. Die Seite liegt danach unter `https://<user>.github.io/<repo>/` (Workflow setzt `VITE_BASE` automatisch).
