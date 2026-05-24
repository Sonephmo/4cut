# HAESOL 4CUT Kiosk

Electron + React + TypeScript scaffold for the 4cut booth app.

## Current scope
- Main flow screen skeleton.
- Shooting timer pipeline implemented (`10s` countdown + `2s` gap, total `10` shots).
- Camera preview + shot capture (browser media API) wired in shooting flow.
- Main IPC extended:
  - `shots:save`
  - `shots:list`
  - `job:start`
  - `job:status`
- `job:start` now executes a real async path:
  - compose output file (`sharp`, 4x6 2x2 template)
  - call silent print window
  - report `FAILED_PRINT` on error
- Operator overlay added:
  - open with `Ctrl + Alt + O`
  - PIN verification through IPC (`OPERATOR_PIN`)
  - printer list / printer selection persistence
  - force home / app restart
  - test print / failed session retry
- Fixed UX decisions:
  - `5_loading` and `7_printing` are split.
  - Shooting timing target is countdown `10s` + shot gap `2s`.
  - Operator PIN is environment-driven (`OPERATOR_PIN`).
- Minimal IPC:
  - `session:create`
  - `session:get`
- Camera capture and selection ordering are implemented in renderer.

## Setup
1. Copy `.env.example` to `.env`.
2. Install dependencies:
   - `npm install`
3. Run dev renderer (or attach Electron separately):
   - `npm run dev`

## Build
- `npm run build`

## Notes
- Electron runtime wiring for full local desktop execution is scaffolded in `electron/`.
- Local shot saving is wired in `electron/main.ts` under `%APPDATA%/HaesolNecut` (or `LOCAL_DATA_DIR`).
- Real print call is wired with hidden print window (`electron/printWindow.ts`).
- Failed print queue persists at `%APPDATA%/HaesolNecut/queue/failed-jobs.json`.
- Printer setting persists at `%APPDATA%/HaesolNecut/settings.json`.
- Field validation checklist is documented in `RUNBOOK.md`.
