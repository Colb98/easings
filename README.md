# Easing Lab

A local easing comparison playground with 31 synchronized curves, per-curve parameters, filtering, scrubbing, adjustable duration and grid sizing, and LAN QR sharing.

## Run

Requires Node.js 20 or newer and npm.

```sh
git clone https://github.com/Colb98/easings.git
cd easings
npm ci
npm start
```

Open [localhost:5173](http://localhost:5173). The server listens on all network interfaces. Click **Share on Wi-Fi** to get a QR code for your current LAN address. Both devices must be on the same network; keep the host computer awake and the process running. If multiple interfaces exist, choose the Wi-Fi address in the sharing dialog. Each device has independent playback and settings. Guest networks with client isolation may prevent access.

Set `PORT=3000 npm start` to change the port. Fonts use Google Fonts with local sans-serif fallbacks; all application logic and QR generation are local.

## Controls

- All 30 easings from the reference plus Linear are shown initially.
- Playback and grid controls stay pinned at the top while scrolling.
- Filter with the Easings checklist; select only two to compare them.
- Circles and graph markers share one clock. Each pass holds at the end for 0.6 seconds before restarting.
- Scrubbing pauses playback. Restart returns every curve to zero.
- Editable parameters change both the graph and animation. Back and Elastic overshoot is preserved, with plotting space expanded as needed.
- Power families expose exponent; Expo exposes its base-2 exponent; Back exposes overshoot; Elastic exposes amplitude and period; Bounce exposes count and decay. InOut Back uses the conventional 1.525 coefficient and InOut Elastic uses 1.5 times the period.
- Reduced-motion preferences start playback paused.

## Verification

`npm test` checks curve endpoints, finite samples, symmetry, default Bounce equivalence, and parameter effects.

Install the browser once, then run the browser checks with the server running in another terminal:

```sh
npx playwright install chromium
npm run test:browser
```

The browser checks cover interactive flows and desktop/mobile rendering. Generated preview screenshots and test artifacts are ignored by Git.

## Project files

- `index.html`, `style.css`, `app.js`: responsive interface and synchronized playback.
- `easings.js`: easing definitions, defaults, and evaluation functions.
- `server.mjs`: local HTTP server and LAN QR-code endpoint.
- `tests/`: mathematical checks and browser verification.

No frontend build step is required.
