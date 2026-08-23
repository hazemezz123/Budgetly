# Sidebar Smooth Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the `Sidebar.jsx` collapse and uncollapse transition into a buttery smooth, 60fps spring-physics animation using Framer Motion with fluid label fading, icon rotation, and animated tooltips.

**Architecture:** Replace CSS static width transitions in `Sidebar.jsx` with Framer Motion `motion.aside`, `AnimatePresence`, and `motion.div` / `motion.span` elements. Use spring physics (`stiffness: 300, damping: 30`) for the sidebar container width and chevron rotation while using opacity and slide transitions for child text labels.

**Tech Stack:** React 19, Framer Motion v12, Tailwind CSS v4, Lucide React icons.

## Global Constraints
- Target File: `client/src/shared/components/Sidebar.jsx`
- Main sidebar width: expanded `256px` (`w-64`), collapsed `80px` (`w-20`)
- Spring settings: `{ type: "spring", stiffness: 300, damping: 30 }`
- Zero ESLint warnings or build errors on `npm run build` and `npm run lint`.

---

### Task 1: Refactor Sidebar.jsx to Framer Motion Animation

**Files:**
- Modify: `client/src/shared/components/Sidebar.jsx`

**Interfaces:**
- Consumes: `useAuth`, `useTheme`, `useLocation`, `framer-motion` (`motion`, `AnimatePresence`)
- Produces: Smoothly animating responsive Sidebar component

- [ ] **Step 1: Import Framer Motion in Sidebar.jsx**

Add `motion` and `AnimatePresence` imports from `framer-motion`:
```javascript
import { motion, AnimatePresence } from "framer-motion";
```

- [ ] **Step 2: Replace `<aside>` with `<motion.aside>` and spring physics**

Update the root `<aside>` to `<motion.aside>`:
```jsx
<motion.aside
  initial={false}
  animate={{ width: collapsed ? 80 : 256 }}
  transition={{ type: "spring", stiffness: 300, damping: 30 }}
  className="hidden md:flex flex-col h-screen sticky top-0 border-l z-40 select-none overflow-hidden"
  style={{
    backgroundColor: "var(--color-surface)",
    borderColor: "var(--color-border)",
  }}
>
```

- [ ] **Step 3: Animate Logo & Chevron Button**

Animate header logo and chevron toggle rotation:
```jsx
<div
  className={`p-4 flex items-center border-b ${
    collapsed ? "justify-center" : "justify-between"
  }`}
  style={{ borderColor: "var(--color-border)" }}
>
  <AnimatePresence mode="wait">
    {!collapsed && (
      <motion.div
        key="logo"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-2 overflow-hidden"
      >
        <img
          src="/assets/logo.png"
          alt="Budgetly"
          className="h-14 dark:invert transition-all shrink-0"
        />
      </motion.div>
    )}
  </AnimatePresence>
  <button
    onClick={() => setCollapsed(!collapsed)}
    className="p-2.5 rounded-xl hover:bg-(--color-hover) transition-colors hover:text-(--color-primary) text-(--color-secondary) cursor-pointer"
    title={collapsed ? "توسيع القائمة" : "طي القائمة"}
  >
    <motion.div
      animate={{ rotate: collapsed ? 180 : 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <ChevronRight size={20} />
    </motion.div>
  </button>
</div>
```

- [ ] **Step 4: Animate Nav Labels & Group Headers**

Wrap nav item text and group titles in `AnimatePresence`:
```jsx
<AnimatePresence>
  {!collapsed && (
    <motion.span
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      transition={{ duration: 0.15 }}
      className={`font-medium text-sm whitespace-nowrap ${
        active ? "text-(--color-on-fill)" : "text-(--color-dark)"
      }`}
    >
      {item.label}
    </motion.span>
  )}
</AnimatePresence>
```

- [ ] **Step 5: Animate Hover Tooltips in Collapsed Mode**

Animate tooltips using `AnimatePresence` and `motion.div`:
```jsx
<AnimatePresence>
  {collapsed && (
    <motion.div
      initial={{ opacity: 0, x: 6, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 6, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="absolute right-full top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 dark:bg-gray-800 text-white text-xs font-medium rounded-lg whitespace-nowrap z-50 pointer-events-none mr-2.5 shadow-xl border border-gray-700/50 flex items-center gap-1.5"
    >
      {itemLocked && <Lock size={12} className="text-amber-400" />}
      <span>{item.label}</span>
      {itemLocked && (
        <span className="text-[10px] text-amber-300 font-normal">
          (مقفل)
        </span>
      )}
      <div className="absolute top-1/2 -translate-y-1/2 -right-1 border-y-4 border-y-transparent border-l-4 border-l-gray-900 dark:border-l-gray-800" />
    </motion.div>
  )}
</AnimatePresence>
```

- [ ] **Step 6: Test build and linting**

Run: `npm run build && npm run lint` in `client/`
Expected: 0 build errors, 0 ESLint errors.

- [ ] **Step 7: Commit changes**

Run: `git add client/src/shared/components/Sidebar.jsx && git commit -m "feat(ui): smooth Sidebar collapse animation using Framer Motion"`
