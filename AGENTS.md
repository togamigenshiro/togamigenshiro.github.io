<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Preserve published history while automatic repository synchronization is active to prevent conflicting versions.
- Opening rain uses an effect-initialized canvas with cached streak, wet-bead and absorption sprites, seal and paper-half collision splashes, CSS-token colors, reduced-motion fallback and cancelled frames; keep weather local to the opening gate and mounted through the animation-completed cut and reveal to preserve other page effects. Render one unclipped notice at idle and reveal the clipped halves only on breaking to avoid a visible pre-cut seam.
- Story text lives as typed blocks in src/lib/story.ts (with inline *bold* / {red} markers and optional fx), rendered by StoryFlow; edit content there, not in route files.
- Katana 3D models are meshopt-compressed GLBs loaded only client-side (lazy + ClientOnly) because three.js cannot run during SSR.
- Site media (photos, katana GLBs, background music) ships inside the repo under public/ and is referenced by absolute path, so the site serves itself on any static host; do not move it back to hosted asset pointers.
- GitHub Pages deploys from its own build config (vite.config.pages.ts), which prerenders every listed route to static HTML; add new pages to that list when a route is created.
- Page transitions cover navigation before revealing three aligned artwork fragments; finish on animation completion rather than a fixed navigation timeout so slow page loads remain hidden.
- Animation sound cues are cancellable Web Audio textures; cancel pending cues on unmount, and lock katana controls during staged drawing to prevent conflicting sequences.
- Weapon history uses typographic chapter bands with sticky reading progress and unframed varied passages; keep its text sourced from the shared typed story blocks.
- Passage blood effects use a local client-side canvas prepared before the target sentence enters the reading zone, resolve colors from CSS tokens, and cancel animation frames on unmount to keep static rendering and navigation safe.
- Shared PassageMoment effects prepare reusable rose and coin sprites before reading triggers, remain local to the text, play once, fade out, and respect reduced motion so story and weapon passages share consistent timing.
- Bloom canvases use reserved perimeter space and the tested rose-layout helper; each flower opens in separately prepared petal layers so prose stays unobscured without per-frame sprite generation.
- StudyBook is attached via the typed study passage ID, occupies the desktop right margin and flows below on smaller screens to avoid covering story prose.
- OrchidStomp is attached by passage ID and coordinates one foot impact with local torn-petal trajectories after the sentence reveal; reduced motion keeps a static orchid without falling overlays.
- BloodRoses owns a single delayed impact trigger for the lord passage, sharing it with ExecutionSplash and persistent petal stains/sway; its preparation and pending trigger are cancelled safely on unmount.
- StoryObjects renders reading-triggered katana and fan scenes beneath their typed passage IDs; the katana uses a staged release/pause/draw/settle with opaque scabbard occlusion and local steel highlights, while SVG fan ribs rotate in local pivot coordinates to keep the hinge aligned at every viewport size. Both scenes remain fully drawn under reduced motion.
