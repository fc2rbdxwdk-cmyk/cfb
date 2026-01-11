# CFB Sim Hub (scaffold)

This repository is a feature-rich frontend scaffold for a college-football simulation web app. It contains a modern, component-based React + Vite starter with theme variables, responsive layout, and many placeholder components matching the product spec.

Key features scaffolded:
- Top navigation with badges and routes
- Data-rich Dashboard with ticker, spotlight, and widgets
- Team and Player pages with modular cards and charts placeholders
- Stats hub, Schedule, Recruiting, and Simulation views
- Mini player icon generator section
- CSS variables for theming and responsive styles

Getting started

1. Install dependencies:

```bash
cd /workspaces/cfb
npm install
```

2. Run dev server:

```bash
npm run dev
```

Notes & next steps
- This is a frontend scaffold. Hook up APIs or a backend to populate routes with real data.
- Add richer components (charts, data grids, play simulation UI) using libraries like Recharts, D3, or AG Grid.
- Integrate sound via `howler` (already added) and add accessibility features.
Local backend

1. Install server dependencies and start server (in a separate terminal):

```bash
cd /workspaces/cfb/server
npm install
npm start
```

2. Start the frontend (in another terminal):

```bash
cd /workspaces/cfb
npm install
npm run dev
```

The frontend will call `http://localhost:4000/api/*` for mock teams, players, and simulation.

Persistence & simulation notes

- The server now includes a small SQLite DB at `server/cfb.db` (created automatically).
- Endpoints added:
	- `GET /api/recruits` — list recruits
	- `POST /api/recruits` — add a recruit
	- `GET /api/standings` — current standings
	- `GET /api/saves` — list saved simulations
	- `POST /api/save` — persist simulation result
- The simulation supports a `playPlan` (array of per-quarter play styles) sent in the `POST /api/simulate` body. The frontend `Simulation` UI exposes play-style selection, drive visualizer, animated momentum playback, and a Save button.

# cfb