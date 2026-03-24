# Classic Minesweeper (Vanilla JS)

A **Minesweeper** game inspired by the classic Windows version, built with **HTML/CSS/JavaScript without any framework**.

## Features

- 3 difficulty levels: **Beginner**, **Intermediate**, **Expert**
- Cell reveal, flag placement, and neighboring-cell reveal (double-click)
- Keyboard support with a visual selection cursor
- Customizable keyboard shortcuts from the instructions dialog
- Retro-style mine counter and timer
- Per-difficulty statistics persisted via `localStorage`

## Project structure

- `index.html`: UI structure, grid, dialogs, difficulty buttons
- `style.css`: retro visual theme and sprites
- `script.js`: main game logic (init, rendering, interactions, win/loss)
- `lib.js`: utilities (grid generation, neighbors, digit extraction)
- `counters.js`: mine counter + timer
- `highlighter.js`: keyboard cursor management
- `controls.js`: keyboard actions, customizable shortcuts, dialogs
- `statistics.js`: read/write stats from/to `localStorage`
- `assets/`: cell, mine, flag, digit, and border images

## Run locally

Simple option: open `index.html` in a modern browser.

Recommended option (local static server):

```bash
cd /Users/Nidhal.Ben.Taher/Developer/vanilla-js-minesweeper
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Controls

### Mouse

- **Left click**: reveal a cell
- **Right click**: place/remove a flag (or marker depending on configuration)
- **Double-click** on a revealed cell: attempt to reveal surrounding cells

### Keyboard

- `Enter`: new game
- `ArrowUp` / `ArrowDown` / `ArrowLeft` / `ArrowRight`: move the cursor
- `f`: reveal the current cell
- `w`: place/remove a flag
- `x`: reveal around the current cell

> `f`, `w`, and `x` are the default keys and can be changed via "Instructions for Keyboard Gameplay".

## Persistence (`localStorage`)

The game stores:

- the current difficulty configuration (`CONFIG`)
- per-level statistics (`STATISTICS`):
  - games played
  - games won
  - best time

To reset everything, clear the site's keys from your browser local storage.

## Possible improvements

- Add unit tests for grid and win-condition logic
- Replace inline HTML handlers (`onclick`) with JS event listeners only
- Add accessibility labels/attributes (e.g., `alt` on images)
- Improve mobile/touch gameplay support
- Add a small npm dev script (`serve`) for quicker startup

