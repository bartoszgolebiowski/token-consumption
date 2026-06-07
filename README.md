# Antigravity Deck 🚀

A premium, lightweight, and interactive HTML, CSS, and JS presentation engine built for developers, speakers, and creators.

This codebase provides a highly-customizable and high-performance presentation template out of the box with zero dependencies. It supports multiple color presets, touch swipe gestures, dynamic slide transitions, interactive overview modes, keyboard hotkeys, and speaker notes.

---

## 📂 Project Structure

- **[index.html](file:///index.html)**: The main slide structure. Edit this file to add, modify, or remove slides.
- **[style.css](file:///style.css)**: The styling system. Customize CSS custom properties (variables) to tweak layout shapes, transitions, and themes.
- **[script.js](file:///script.js)**: The core ES6 engine logic. Handles navigation, shortcuts, touch swiping, hash-routing, and UI modes.
- **[package.json](file:///package.json)**: Local development scripts powered by **Vite**.

---

## ⚡ Getting Started

### Prerequisites

You need [Node.js](https://nodejs.org/) installed to run the local Vite development server.

### Local Development

1. Open a terminal in the root of the project directory.
2. Install the dev dependencies (Vite):
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Open your browser to the local address displayed in the terminal (usually `http://localhost:5173`).

Vite includes Hot Module Replacement (HMR), so editing your HTML, CSS, or JS will refresh the presentation instantly in your browser!

---

## ➕ Adding New Slides

To add a new slide to your presentation, simply insert a new `<section>` tag within the `<div id="slides-wrapper">` container in **[index.html](file:///index.html)**:

```html
<section class="slide" id="slide-my-new-slide" data-transition="zoom">
    <div class="slide-content slide-layout-title">
        <span class="badge">Optional Category Tag</span>
        <h2>Your Slide Title</h2>
        <p>A description or bullet list goes here.</p>
    </div>
    
    <!-- Presenter Notes: Displayed in Speaker Notes Mode (N Key) -->
    <div class="notes">
        This content is only visible to the speaker in notes mode.
    </div>
</section>
```

### Transition Effects

You can set custom entry and exit transition effects per-slide by changing the `data-transition` attribute. Supported transitions out of the box:
- `zoom` - Scales from back to front.
- `slide-horizontal` - Slides left to right.
- `slide-vertical` - Slides top to bottom.
- `fade` - Smooth opacity transitions.

### Slide Layouts

The foundation includes pre-styled layouts for standard slide formats:
1. `slide-layout-title`: Centered large typography (best for intro/outro/divider slides).
2. `slide-layout-split`: A two-column structure (left for descriptive text, right for charts or feature grids).
3. `slide-layout-code`: Features a beautiful mock editor layout for showcasing source code.
4. `slide-layout-quote`: Centered minimalist look with a large stylized quotes mark.
5. `slide-layout-summary`: A organized split list useful for highlights, key takeaways, or shortcut lists.

---

## ⌨️ Shortcuts Guide

You can control your deck using these keys during the presentation:

| Key Shortcut | Action |
| --- | --- |
| **Space** / **PageDown** / **➔** / **▼** | Go to the **Next** slide |
| **Shift + Space** / **PageUp** / **⬅** / **▲** | Go to the **Previous** slide |
| **Home** / **End** | Jump to the **First / Last** slide |
| **O** | Toggle **Overview Grid** Mode |
| **T** | Cycle **Color Themes** (Dark Glass, Cyberpunk, Sunset, Light) |
| **N** | Toggle **Speaker Notes Drawer** |
| **F** | Toggle **Fullscreen** mode |
| **?** or **H** | Open/Close **Keyboard Help Dialog** |
| **Escape** | Close open overlays (Overview, Notes, Help) |

---

## 🎨 Theme Customization

The CSS uses custom variables to power four gorgeous theme presets:
- `theme-glass-dark`: Default glossy dark theme with purple and blue gradients.
- `theme-cyberpunk`: High-contrast black, cyan, and neon magenta cyberpunk styling.
- `theme-warm-sunset`: Crimson dark background with sunset orange gradients.
- `theme-minimal-light`: Sleek, minimal light grey layout with clean slate typography.

To add your own custom theme:
1. Define a CSS class selector in **[style.css](file:///style.css)** (e.g. `.theme-my-brand`).
2. Add your colors to the variables inside that selector.
3. Update the `this.themes` array inside **[script.js](file:///script.js)** to register it in the cycling rotation:
   ```javascript
   this.themes = ['theme-glass-dark', 'theme-cyberpunk', 'theme-warm-sunset', 'theme-minimal-light', 'theme-my-brand'];
   ```
