# StackLinks

> Centralized link hub for company tools and services (Gmail, Slack, GitHub, etc.).
> Sections by department, fixed + customizable links, inline CRUD, import/export.
> Hosted on GitHub Pages, developed with devcontainer.

---

## 1. Technology Stack

| Layer | Technology | Version | Install |
|---|---|---|---|
| **JS Framework** | Alpine.js | 3.x | `npm install alpinejs` |
| **CSS** | Tailwind CSS | v4 | `npm install tailwindcss @tailwindcss/vite` |
| **Build** | Vite | 6.x | `npm install vite` |
| **Icons (primary)** | Simple Icons CDN | — | `https://cdn.simpleicons.org/{slug}` |
| **Icons (fallback)** | Google Favicons API | — | `https://www.google.com/s2/favicons?domain={url}` |
| **Weather** | Open-Meteo API | — | `https://api.open-meteo.com` (no key needed) |
| **Node** | Node.js | 22 LTS | via devcontainer |
| **Container** | Devcontainer | — | VS Code + Docker |
| **CI/CD** | GitHub Actions | — | build + deploy Pages |
| **Hosting** | GitHub Pages | — | `https://{user}.github.io/stacklinks/` |

---

## 2. Project Structure

```
stacklinks/
├── .devcontainer/
│   ├── devcontainer.json
│   └── Dockerfile
├── .github/
│   └── workflows/
│       └── deploy.yml
├── src/
│   ├── index.html
│   ├── style.css
│   └── main.js
├── public/
│   └── links.json
├── package.json
├── vite.config.js
└── README.md
```

---

## 3. Devcontainer

### `.devcontainer/Dockerfile`

```dockerfile
FROM node:22-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g npm@latest

WORKDIR /workspace
```

### `.devcontainer/devcontainer.json`

```json
{
  "name": "StackLinks",
  "build": {
    "dockerfile": "Dockerfile"
  },
  "forwardPorts": [5173],
  "postCreateCommand": "npm install",
  "customizations": {
    "vscode": {
      "extensions": [
        "bradlc.vscode-tailwindcss",
        "esbenp.prettier-vscode",
        "dbaeumer.vscode-eslint"
      ]
    }
  }
}
```

---

## 4. npm and Build

### `package.json`

```json
{
  "name": "stacklinks",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "alpinejs": "^3.14.0"
  },
  "devDependencies": {
    "tailwindcss": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0",
    "vite": "^6.0.0"
  }
}
```

### `vite.config.js`

```js
import { defineConfig } from "vite"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [tailwindcss()],
  base: "./",
})
```

---

## 5. GitHub Actions

### `.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

---

## 6. Data

### `public/links.json` — Company fixed links

```json
{
  "company": {
    "name": "My Company",
    "logo": "",
    "logoAlt": "Company Logo"
  },
  "sections": [
    {
      "id": "general",
      "name": "General",
      "color": "#4f46e5",
      "fixed": true,
      "links": [
        { "name": "Gmail", "url": "https://mail.google.com", "icon": "gmail" },
        { "name": "Slack", "url": "https://slack.com", "icon": "slack" },
        { "name": "Google Drive", "url": "https://drive.google.com", "icon": "googledrive" },
        { "name": "Google Meet", "url": "https://meet.google.com", "icon": "googlemeet" },
        { "name": "Notion", "url": "https://notion.so", "icon": "notion" }
      ]
    },
    {
      "id": "engineering",
      "name": "Engineering",
      "color": "#059669",
      "fixed": true,
      "links": [
        { "name": "GitHub", "url": "https://github.com", "icon": "github" },
        { "name": "GitLab", "url": "https://gitlab.com", "icon": "gitlab" },
        { "name": "Docker Hub", "url": "https://hub.docker.com", "icon": "docker" },
        { "name": "AWS Console", "url": "https://aws.amazon.com/console", "icon": "amazonwebservices" },
        { "name": "Vercel", "url": "https://vercel.com", "icon": "vercel" },
        { "name": "Cloudflare", "url": "https://dash.cloudflare.com", "icon": "cloudflare" }
      ]
    },
    {
      "id": "hr",
      "name": "HR",
      "color": "#d97706",
      "fixed": true,
      "links": [
        { "name": "HR Portal", "url": "https://hr.company.com", "icon": "maildotru" },
        { "name": "Benefits", "url": "https://benefits.company.com", "icon": "heart" },
        { "name": "Time Clock", "url": "https://time.company.com", "icon": "clock" }
      ]
    },
    {
      "id": "finance",
      "name": "Finance",
      "color": "#dc2626",
      "fixed": true,
      "links": [
        { "name": "SAP", "url": "https://sap.company.com", "icon": "sap" },
        { "name": "Expenses", "url": "https://expenses.company.com", "icon": "currency" }
      ]
    },
    {
      "id": "design",
      "name": "Design",
      "color": "#8b5cf6",
      "fixed": true,
      "links": [
        { "name": "Figma", "url": "https://figma.com", "icon": "figma" },
        { "name": "Penpot", "url": "https://penpot.app", "icon": "penpot" },
        { "name": "Dribbble", "url": "https://dribbble.com", "icon": "dribbble" },
        { "name": "Unsplash", "url": "https://unsplash.com", "icon": "unsplash" }
      ]
    },
    {
      "id": "communication",
      "name": "Communication",
      "color": "#0ea5e9",
      "fixed": true,
      "links": [
        { "name": "Slack", "url": "https://slack.com", "icon": "slack" },
        { "name": "Teams", "url": "https://teams.microsoft.com", "icon": "microsoftteams" },
        { "name": "Discord", "url": "https://discord.com", "icon": "discord" },
        { "name": "Zoom", "url": "https://zoom.us", "icon": "zoom" }
      ]
    }
  ]
}
```

### Data model (localStorage)

```json
{
  "customizations": {
    "addedSections": [
      {
        "id": "sec_1719000000",
        "name": "My Section",
        "color": "#f59e0b",
        "fixed": false,
        "links": [
          {
            "id": "link_1719000001",
            "name": "Personal Link",
            "url": "https://mysite.com",
            "icon": "link"
          }
        ]
      }
    ],
    "editedSections": {
      "engineering": { "name": "Engineering & DevOps", "color": "#10b981" }
    },
    "addedLinks": {
      "general": [
        {
          "id": "link_1719000002",
          "name": "DeepL",
          "url": "https://deepl.com",
          "icon": "deepl"
        }
      ]
    }
  },
  "theme": "dark"
}
```

### Merge logic

```
Displayed data = links.json (fixed sections)
               + localStorage (added/edited sections)
               + localStorage (added links)
```

- Fixed sections (`fixed: true`) cannot be edited or deleted from the UI
- Custom sections added by the user can be edited (name, color) and deleted
- Fixed links cannot be edited or deleted
- Custom links added by the user can be edited and deleted

---

## 7. Features

### 7.1 Layout (header)

```
┌──────────────────────────────────────────────┐
│  [☀️ 23°C]           [12:45:32]    [🌙] [📤] │
│  ┌──────────────────────────────────────────┐ │
│  │              [LOGO]                      │ │
│  │           My Company                     │ │
│  └──────────────────────────────────────────┘ │
│  [🔍 Search Google...]                        │
│                                               │
│  ┌── General ──┐  ┌── Engineering ──┐       │
│  │ Gmail        │  │ GitHub          │       │
│  │ Slack        │  │ Docker Hub      │       │
│  │ Drive        │  │ AWS             │       │
│  └──────────────┘  └─────────────────┘       │
└──────────────────────────────────────────────┘
```

### 7.2 Company logo

- URL defined in `links.json` → `company.logo`
- Displayed at the top, centered, max 120px height
- Fallback: if the URL is empty or fails to load, shows the company name as text

### 7.3 Clock

- Live clock in the header, updated every second
- Format: `HH:MM:SS` (24h)
- Styled with a monospace font for stability

### 7.4 Weather widget

- Uses **Open-Meteo API** — no API key required, no signup
- Gets user location via `navigator.geolocation`
- Displays: temperature + weather emoji (e.g., `☀️ 23°C`)
- If the user denies location, the widget is hidden gracefully
- Fetches data on load and caches it for 10 minutes

### 7.5 Data loading

| Action | Details |
|---|---|
| `fetch("links.json")` | Loads fixed links on startup |
| `localStorage.getItem("stacklinks")` | Loads user customizations |
| `mergeData()` | Combines fixed + customizations into one section array |

### 7.6 Inline CRUD — Sections

- **Add**: form at the bottom of the page, name + color picker
- **Edit name**: click name → turns into `<input>`
- **Edit color**: color picker shown on hover
- **Delete**: × button, confirms, removes from localStorage

### 7.7 Inline CRUD — Links

- **Add**: form inside a section with name, URL, icon slug
- **Edit**: click link → inline form
- **Delete**: × button on hover
- **Move**: select to choose a different section

### 7.8 Icon resolution

```
resolveIcon(link) {
  if (link.icon) return `https://cdn.simpleicons.org/${link.icon}`
  return `https://www.google.com/s2/favicons?domain=${new URL(link.url).hostname}&sz=32`
}
```

### 7.9 Theme toggle

- Toggle in the header (🌙/☀️)
- Saved in `localStorage`
- Tailwind `dark:` classes + `dark` class on `<html>`

### 7.10 Import/Export

- **Export**: downloads a complete JSON with fixed links + customizations
- **Import**: uploads a JSON file and merges into localStorage

### 7.11 Google Search

- Search bar at the top
- Redirects to `https://google.com/search?q=...`

---

## 8. Development Workflow

### Start
```bash
# VS Code opens the devcontainer automatically
# or via Command Palette: "Dev Containers: Reopen in Container"

# Inside the container:
npm install
npm run dev
# → http://localhost:5173
```

### Build
```bash
npm run build
# → generates dist/
```

### Deploy
```bash
git add .
git commit -m "feat: description"
git push origin main
# → GitHub Actions builds and deploys automatically
```

---

## 9. Implementation Steps

| # | Task | Files |
|---|---|---|---|
| 1 | Create project structure, package.json, vite config | `package.json`, `vite.config.js` |
| 2 | Set up devcontainer | `.devcontainer/Dockerfile`, `.devcontainer/devcontainer.json` |
| 3 | Set up GitHub Actions | `.github/workflows/deploy.yml` |
| 4 | Create `links.json` with example sections | `public/links.json` |
| 5 | Implement base HTML with Alpine.js + Tailwind | `src/index.html` |
| 6 | Implement custom CSS | `src/style.css` |
| 7 | Implement main JS logic | `src/main.js` |
| 8 | Company logo display | `src/main.js` + `src/index.html` |
| 9 | Clock widget | `src/main.js` |
| 10 | Weather widget (Open-Meteo + geolocation) | `src/main.js` |
| 11 | Inline CRUD for sections | `src/main.js` |
| 12 | Inline CRUD for links | `src/main.js` |
| 13 | Icon resolution (Simple Icons + fallback) | `src/main.js` |
| 14 | Google search | `src/index.html` |
| 15 | Theme toggle | `src/main.js` + `src/index.html` |
| 16 | Import/Export JSON | `src/main.js` |
| 17 | Final testing | `npm run dev` |
| 18 | Deploy and verify on GitHub Pages | push + Actions |

---

## 10. README

```markdown
# StackLinks

Centralized link hub for company tools and services.

## How to use

1. Open in VS Code → "Reopen in Container"
2. `npm install` (automatic in devcontainer)
3. `npm run dev` to develop
4. Edit `public/links.json` to add company links
5. `git push origin main` for automatic deploy

## Customization

- Fixed links → edit `public/links.json`
- Custom sections → web interface (saved in browser)
- Custom links → web interface (saved in browser)
- Export and import settings via buttons in the header
```
