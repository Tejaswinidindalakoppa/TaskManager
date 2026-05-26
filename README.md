# TaskManager

A lightweight drag-and-drop taskboard for organizing, prioritizing, and completing tasks with a clean, minimal interface.

---

## Key Features

- Drag & drop tasks between columns (Kanban-style)
- Minimal, responsive UI focused on productivity
- Lightweight — local state and fast interactions
- Easy to extend and style

## Demo

Run the project locally (see below) and open your browser at `http://localhost:5173`.

## Built With

- Vite
- React
- Plain CSS

## Quick Start

### Prerequisites

- Node.js (v16+ recommended)
- npm or yarn

### Install

```bash
npm install
```

### Run (development)

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

### Build for production

```bash
npm run build
npm run preview
```

## Project Structure

- `index.html` — app entry
- `package.json` — scripts & dependencies
- `vite.config.js` — Vite config
- `TaskBoard.jsx`, `TaskBoard_old.jsx` — board components
- `src/` — React app sources (including `TaskManagerApp.jsx`, `App.jsx`, `main.jsx`, `styles.css`)

See the source in the `src` folder to modify or extend the app.

## Styling / Theme

The app uses a minimal color scheme. If you want a consistent theme green, use: `#B2E4BA` (RGB 178,228,186).

## Contributing

Contributions are welcome. Suggested workflow:

1. Fork the repo
2. Create a feature branch
3. Open a pull request with a clear description
