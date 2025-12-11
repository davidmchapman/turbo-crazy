# turbo-crazy
A kinetic drawing app for kids (or discerning adults)

https://turbo-crazy.com/


## Project Summary
### High-level concept

It’s a single-page HTML/JS app using a single canvas (2D context) in the center, with:

- Left panel: list of paths (path manager)
- Center: canvas where paths and moving balls are drawn
- Right panel: color palettes + ball size/speed controls
- Top bar: global controls, background slider, hint, FPS counter

The core idea: Users draw one or more paths as polyline node chains on the canvas.
They can launch balls that move along those paths in a loop.
Each path can have its own balls, and balls are colored from a selected palette.

### UI layout & controls
**Top control bar**
- Launch Ball button
  - Launches a new ball on the currently selected path (starts at first node).
  - Disabled while in any edit mode (Edit Paths or Edit Balls).
  - Keyboard: Space also launches a ball (when not in edit modes).
- Edit Paths button
  - Toggles path-edit mode.
  - When ON:
    - Button text changes to “Save Paths” and button gets a green “active” style.
    - Edit Balls mode is turned OFF.
    - Launch/Add Path and various path buttons are disabled.
    - Canvas cursor changes to indicate edit mode.
    - Path nodes become draggable.
  - When OFF:
    - Saves the changed node positions.
    - UI reverts; buttons re-enabled as appropriate.
- Edit Balls button
  - Toggles ball-edit mode.
  - When ON:
    - Button text changes to “Save Balls” and button gets a green “active” style.
    - Edit Paths mode is turned OFF.
    - Launch/Add Path and various path buttons are disabled.
    - Canvas cursor changes; you can select balls.
  - When OFF:
    - Clears current ball selection and any selection rectangle.
- Background slider
  - Range 0–255; controls a grayscale background for the canvas.
  - JS updates canvas.style.backgroundColor with rgb(g, g, g) where g is slider value.
  - Path lines/nodes are drawn with an inverted gray so they maintain contrast (light on dark, dark on light).
- Hint text (Draw paths, launch balls, have fun!)
  - Aligned toward the right end of the bar.
- FPS counter
  - Text like FPS: 60, updated each animation frame.
  - Uses requestAnimationFrame, computes instantaneous FPS as 1 / dt, and smooths with a simple exponential moving average.

**Left: Path panel**

- Fixed width on the left (220px).
- Header: "Paths" with a + Path button.
  - +Path creates a new empty path and selects it (no nodes yet).
- Path list (#pathList) - For each path you see a “card”:
  - Path N title (N = 1-based index in array).
  - Meta line: X nodes • Y balls.
  - A pinned X button on the right to delete the path.
  - Action buttons row (only visible for the selected path, and dependent on state):
    - Hide / Show: toggles path.visible.
      - A hidden path draws no lines/nodes, but its balls are still visible in run mode.
    - Close: if path has ≥2 nodes.
      - Adds a new node at the end with the same normalized coordinates as the first node, effectively closing the loop.
    - Spread: if path has ≥2 balls and valid length.
      - Redistributes balls evenly along the total path length.
  - Clicking a path item selects that path (unless you click directly on one of its buttons).
  - When in edit modes, many of these path-level buttons are disabled.

**Center: Canvas behavior**

**Drawing paths**

- The user clicks on the canvas (in normal run mode, not in edit modes) to add nodes:
  - If there’s no selected path, the app automatically creates one and selects it.
  - Each click adds a node to the end of that path.
  - Nodes are stored in normalized coordinates (xNorm, yNorm in [0,1]) so the canvas can resize and everything scales.
- The path is drawn as:
  - Thin dotted lines between nodes.
  - Nodes are small circles:
    - Slightly larger when in path edit mode.
    - Last node gets an extra ring around it so you can see the path endpoint easily.
  - Paths can be hidden individually via the Hide/Show button (but always show while editing paths).
- The canvas resizes with the window:
  - On resize, the app recomputes canvas pixel size with DPR scaling and calls rebuildAllPathMetrics().
  - That rebuilds pointsPx (scaled from xNorm, yNorm) and segment list + total length for each path.

**Balls and motion**

- Each path maintains:
  - nodes: normalized positions.
  - pointsPx: absolute pixel positions (recomputed on resize or node move).
  - segments: with start distance and length, for parameterizing distance along path.
  - totalLength: sum of all segment lengths.
  - balls: each has dist (scalar distance along path), color, radius.
- Launching a ball:
  - Only allowed when not in any edit mode.
  - Ball is created with:
    - dist = 0 (start at first node).
    - color = activeBallColor (from the selected swatch).
    - radius:
      - If size slider > 0 → fixed radius equal to the slider value.
      - If size slider = 0 → random radius between 4 and 30.
- Animation update:
  - speedPixelsPerSecond is driven by the speed slider (0–1000).
  - On each frame:
    - If not in edit modes, each ball’s dist is advanced by speedPixelsPerSecond * dt and wrapped modulo the path’s total length.
    - If path has invalid geometry (no or 1 node, zero length), update is skipped.
- Drawing balls:
  - In run mode:
    - For each ball, getPointAlongPathDistance(path, dist) finds its world position (x,y) by looking up the correct segment and interpolating.
    - The ball is drawn as a filled circle with its own color and radius.
  - In Edit Paths mode:
    - Balls are hidden; only paths and nodes show.
  - In Edit Balls mode:
    - Balls are visible and can be selected.
    - Selected balls get an extra highlight ring.

**Right: Palette & sliders panel**

Fixed width (230px) on the right.

**Palettes**

- A set of 13 predefined palettes, each with an array of hex colors (the ones from your earlier app).
- Top section shows a vertical list of palette previews, each as a single row of horizontal color blocks.
- Clicking a palette:
  - Selects that palette (border highlight).
  - Sets activeBallColor to its first color.
  - Rerenders the palette list and swatches.
- Below that, the “Colors” area:
  - Displays swatches (vertical colored bars) for each color in the selected palette.
  - Clicking a swatch:
    - If Edit Balls mode is on and there are selected balls, it immediately recolors those balls.
    - Updates activeBallColor.
    - Visually highlights the active swatch.
- On initial load:
  - Palette 1 is active.
  - The 6th color of palette 1 (pink) is chosen as activeBallColor.

**Ball size slider**

- Slider: min=0, max=30, step 1.
- Label shows:
  - ? when value is 0 → this means random size mode.
  - The numeric value otherwise (e.g., 10).
- Behavior:
  - In run mode, the slider sets the size for new balls:
    - Value 0 → each new ball gets a random radius in [4,30].
    - Greater than 0 → new balls get that exact radius.
  - In Edit Balls mode:
    - Moving the slider updates the radius of all currently selected balls:
    - Value 0 → they each get a new random size in [4,30].
    - Greater than 0 → they all snap to that fixed size.

**Speed slider**

- Slider: min=0, max=1000, step 20.
- Internally, used as pixels per second for ball movement.
- Label shows speedPixelsPerSecond / 20 (rounded), with no units:
  - E.g., a slider value of 400 shows 20.

**Input & interaction details**

- Mouse/pointer:
  - Normal mode:
    - Click on canvas → add node to the end of the selected path (creating a path if none exists yet).
  - Edit Paths:
    - Click-and-drag near a node → drag that node to a new position.
  - Edit Balls:
    - Mouse drag on canvas:
      - Small movement → treat as a click; hit‐test a single ball.
      - Larger rectangle → range select all balls whose positions fall inside that rectangle.
    - Selected balls show a highlight ring.
- Keyboard shortcuts:
  - Space → launch a ball (unless in edit modes).
  - Delete → when in Edit Balls, deletes all currently selected balls.
  - C / c → closes the currently selected path (same as Close button).
- Edit mode disabling:
  - In any edit mode:
    - Launch button, + Path, delete path, hide/show, close, spread, etc., are disabled as appropriate.
  - Edit Path and Edit Balls buttons disable each other so you can’t have both modes on at the same time.

**Rendering & architecture**

- Rendering:
  - Single HTML file: no build tools, no external deps.
  - Uses Canvas 2D API (no WebGL / WASM).
  - Uses requestAnimationFrame for the main loop.
  - Clears and redraws the entire canvas each frame.
- Coordinate system and resizing:
  - Nodes are stored normalized (0–1) so resizing the canvas doesn’t break geometry.
  - On resize:
    - The app recalculates canvas pixel size using display pixel ratio.
    - Resets the transform so drawing can stay in CSS pixels.
    - Regenerates per-path pointsPx and segment metrics.
