# RiskLens — AI Fraud & AML Monitoring Dashboard

React + TypeScript + Vite + Tailwind CSS + React Router + Recharts. All data is local mock data (`src/data/mockData.ts`).

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
```

Routes: /dashboard /alerts /transactions /cases (/cases/:id) /entities (/entities/:id) /reports /settings

Notes
- Global state (alerts, cases, toasts, drawers/modals) lives in `src/context/AppContext.tsx`.
- Clicking a node in the dashboard graph updates Entity Details and the Explainable AI panel.
- The graph is a lightweight custom SVG component (`NetworkGraph`) so it has no extra dependency.
