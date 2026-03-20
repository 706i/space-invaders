# HALBAUTOMATIK // SPACE INVADERS

ASCII Space Invaders for [Halbautomatik.ai](https://halbautomatik.ai) — retro CRT game with developer console.

## Setup on macOS

### Option A: Setup script (one command)

```bash
chmod +x setup.sh
./setup.sh
```

This creates the project at `~/halbautomatik-space-invaders` and launches the server.

### Option B: Manual

```bash
# Copy project to your dev folder
mkdir -p ~/halbautomatik-space-invaders
cp -r ./* ~/halbautomatik-space-invaders/

# Start the server
cd ~/halbautomatik-space-invaders
node server.js
```

Then open **http://localhost:8080** in your browser.

## Controls

| Key | Action |
|---|---|
| Arrow keys / A,D | Move ship |
| Space | Fire |
| P | Pause / unpause |
| ` (backtick) | Toggle developer console |
| Enter | Confirm name / restart |

Mobile: on-screen touch buttons appear automatically.

## Developer Console

Press **`** (backtick) at any time to open the dev console panel on the right side of the screen. It shows:

**Live stats bar** — FPS, delta time, current screen, input mode, player position, alien count, wave number, alien speed, bullet counts, shield blocks remaining, active explosions, session time, and event count.

**Event log** — Color-coded, timestamped entries for every game event:
- `[SYS]` — System events (boot, init, screen transitions)
- `[GAME]` — Game state changes (start, aliens created, speed changes)
- `[HIT]` — Destruction events (aliens killed, player hit)
- `[SCORE]` — Score events (high score saves, mystery ship bonuses)
- `[WAVE]` — Wave transitions
- `[INPUT]` — Player registration
- `[WARN]` — Warnings (alien drops, invasion)

All events also log to the browser's developer tools console (`Cmd+Option+J`).

**Server terminal** — The Node.js server also prints color-coded request logs showing request ID, method, path, file size, and response time.

## Project Structure

```
halbautomatik-space-invaders/
├── server.js          # Node.js static server with color-coded logging
├── package.json       # Project metadata & scripts
├── setup.sh           # One-command setup for macOS
├── README.md          # This file
└── public/
    └── index.html     # Complete game (single file, zero dependencies)
```

## Embedding on Halbautomatik.ai

**iframe**
```html
<iframe src="/games/space-invaders/index.html"
        style="position:fixed;inset:0;width:100vw;height:100vh;border:none;z-index:9999;">
</iframe>
```

**Easter egg trigger (Konami code)**
```js
const konami = [38,38,40,40,37,39,37,39,66,65];
let pos = 0;
document.addEventListener('keydown', (e) => {
  pos = (e.keyCode === konami[pos]) ? pos + 1 : 0;
  if (pos === konami.length) {
    pos = 0;
    const f = document.createElement('iframe');
    f.src = '/games/space-invaders/index.html';
    f.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;border:none;z-index:9999;';
    document.body.appendChild(f);
    document.addEventListener('keydown', function esc(ev) {
      if (ev.key === 'Escape') { f.remove(); document.removeEventListener('keydown', esc); }
    });
  }
});
```

## Upgrading to Shared High Scores

Replace `loadScores` / `saveScore` in `index.html` with fetch calls to your API. Example:

```js
async function saveScore(name, score) {
  await fetch('/api/scores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, score })
  });
}
async function loadScores() {
  return (await fetch('/api/scores')).json();
}
```

## Continuing Development

This project is designed to be picked up again easily:
- **Single-file game** — all game logic, rendering, and styling in one `index.html`
- **Zero dependencies** — no `node_modules`, no build step, no framework
- **Server is optional** — `index.html` works by opening it directly in a browser too
- **Dev console built-in** — press ` to inspect state at any time
