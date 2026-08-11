# Sidebar Smooth Animation Design Spec

## Overview
Enhance the collapse and expand transitions of `Sidebar.jsx` in the Budgetly web application using Framer Motion with spring physics, fluid text opacity/slide transitions, and animated tooltips.

## Architecture & Scope
- **Target Component**: `client/src/shared/components/Sidebar.jsx`
- **Library**: `framer-motion` (v12.23.24)
- **Scope**:
  1. Main sidebar width spring animation.
  2. Toggle button rotation animation.
  3. Text label & group title enter/exit animations via `AnimatePresence`.
  4. Tooltip hover animations in collapsed state.

## Detailed Component Changes

### 1. Main Sidebar (`motion.aside`)
- Dynamic width animation: `animate={{ width: collapsed ? 80 : 256 }}`
- Transition physics: `transition={{ type: "spring", stiffness: 300, damping: 30 }}`
- Layout isolation: prevent flex child reflow glitches with `overflow-hidden` during transitions.

### 2. Header & Toggle Button (`motion.button` & `motion.div`)
- Toggle chevron icon smoothly rotates 180 degrees depending on `collapsed` state:
  `animate={{ rotate: collapsed ? 180 : 0 }}` with spring transition.
- Logo fades out/in smoothly with `AnimatePresence`.

### 3. Nav Labels & Headers (`AnimatePresence` + `motion.span` / `motion.h3`)
- Nav item labels render inside `AnimatePresence`:
  - `initial={{ opacity: 0, x: 10, width: 0 }}`
  - `animate={{ opacity: 1, x: 0, width: "auto" }}`
  - `exit={{ opacity: 0, x: 10, width: 0 }}`
- Keeps text from line-wrapping during animation by using `whitespace-nowrap`.

### 4. Collapsed Hover Tooltips (`AnimatePresence` + `motion.div`)
- Tooltips animate smoothly on hover in collapsed mode:
  - `initial={{ opacity: 0, x: 6, scale: 0.95 }}`
  - `animate={{ opacity: 1, x: 0, scale: 1 }}`
  - `exit={{ opacity: 0, x: 6, scale: 0.95 }}`
  - `transition={{ duration: 0.15 }}`

## Verification Strategy
- Run `npm run build` in `client/` to verify TypeScript/Vite compilation.
- Run `npm run lint` in `client/` to ensure zero ESLint warnings or errors.
- Test collapse/expand interaction in browser for 60fps performance and absence of layout jumps.
