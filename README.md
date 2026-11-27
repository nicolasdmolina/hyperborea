# Hyperborea

Blue northern lights over dithered pixel mountains, for [T3 Code](https://t3.codes). The aurora moves slowly behind the app, and everything else is a little icy.

![Hyperborea in T3 Code](docs/preview.jpg)

## Install

Needs a T3 Code build with themes (Nightly, as of November 2026).

**Easiest:** open the [t3skins page](https://www.t3skins.dev/skins/hyperborea), copy the install prompt, and paste it into T3 Code.

**By hand:** copy `theme/hyperborea.json` and `theme/hyperborea.webp` into `~/.t3/userdata/themes/`, then pick Hyperborea in Settings → Appearance.

## What's in here

- `theme/` is the theme itself. `hyperborea.webp` holds 112 aurora frames in an 8×14 grid, and one keyframe animation steps through them in order (14 fps).
- `generator/aurora.py` draws the aurora frames (`python3 aurora.py options.json 112 glacier`). It writes one tall strip. Repack it into the 8×14 grid before shipping, since t3skins shrinks images over 3840 px.
- `docs/ideas/` keeps a two-line sidebar row layout that was tried and set aside.
- `video/` is the [Clapper](https://www.npmjs.com/package/@archastro/clapper) project for the preview video. Run `./clap.sh preview` or `./clap.sh render -c hyperborea`.
