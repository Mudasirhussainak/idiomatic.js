# Todo App (Static)

A clean, accessible Todo app built with vanilla HTML/CSS/JS. Tasks are stored in `localStorage`.

## Features
- Add, edit, delete, and toggle tasks
- Filters: **All**, **Active**, **Completed**
- Toggle all / Clear completed
- Persistent theme (light/dark)
- Keyboard: Enter/Escape to save/cancel edit, `n` to focus new task
- Accessible semantics with `aria-*` attributes and visible focus rings

## Getting Started

### Serve locally
Using Python 3:
```bash
cd /workspace/todo-app
python3 -m http.server 5173
```
Then open `http://localhost:5173` in your browser.

Alternatively, any static server works.

### Files
- `index.html`: structure and controls
- `styles.css`: styles and themes
- `script.js`: app logic

## Notes
- Data is stored per browser via `localStorage`.
- No backend required.
