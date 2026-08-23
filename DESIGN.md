---
name: Budgetly
description: Shared-expense tracker for Egyptian housemates — warm gold, kitchen-ledger clarity.
colors:
  primary: "#ca8a04"
  primary-dark: "#ffc400"
  primary-bg: "#fefce8"
  primary-border: "#fef08a"
  ink: "#0e1628"
  bg: "#ffffff"
  surface: "#f8fafc"
  secondary: "#475569"
  muted: "#64748b"
  border: "#c3cedd"
  hover: "#f1f5f9"
  success: "#16a34a"
  error: "#dc2626"
  warning: "#ca8a04"
  info: "#0284c7"
  status-pending: "#b45309"
  status-pending-bg: "#fff5e6"
  status-approved: "#047857"
  status-approved-bg: "#edfdf4"
  status-rejected: "#b91c1c"
  status-rejected-bg: "#feecec"
  dark-bg: "#0b0b0d"
  dark-surface: "#151518"
  dark-primary: "#ffc400"
  dark-ink: "#f2f2f2"
  dark-muted: "#b5b5b5"
  dark-border: "#2a2a2e"
  dark-hover: "#1e1e22"
  dark-status-pending: "#f59e0b"
  dark-status-approved: "#10b981"
  dark-status-rejected: "#ef4444"
typography:
  display:
    fontFamily: "Poppins, sans-serif"
    fontWeight: 600
  body:
    fontFamily: "Cairo, system-ui, sans-serif"
    fontWeight: 400
  numbers:
    fontFamily: "Roboto Mono, monospace"
    fontWeight: 500
  decorative:
    fontFamily: "Amiri, serif"
rounded:
  lg: "12px"
  xl: "16px"
  "2xl": "24px"
  full: "9999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.xl}"
    padding: "12px 20px"
  button-primary-dark:
    backgroundColor: "{colors.dark-primary}"
    textColor: "{colors.dark-bg}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "20px"
  input-default:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "12px 16px"
  chip:
    backgroundColor: "{colors.light}"
    textColor: "{colors.secondary}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
  status-pending:
    backgroundColor: "{colors.status-pending-bg}"
    textColor: "{colors.status-pending}"
    rounded: "{rounded.full}"
  status-approved:
    backgroundColor: "{colors.status-approved-bg}"
    textColor: "{colors.status-approved}"
    rounded: "{rounded.full}"
  status-rejected:
    backgroundColor: "{colors.status-rejected-bg}"
    textColor: "{colors.status-rejected}"
    rounded: "{rounded.full}"
---

# Design System: Budgetly

## Overview

**Creative North Star: "The Kitchen Ledger"**

Budgetly is the ledger that lives on the shared kitchen table — a warm, honest record of who paid for what, trusted because every line is plain and every balance is checkable. The gold accent is the pencil that underlines the total; the calm slate-and-white surfaces are the paper it's written on. In dark mode the paper becomes a night desk: near-black, with the gold turning to candlelight so numbers stay legible at midnight.

The system is deliberately warm rather than institutional: rounded corners everywhere, generous padding, and Egyptian colloquial voice make money feel like housemate conversation, not banking. But precision is never sacrificed for friendliness — amounts are set in mono type, statuses carry exact color triads, and WCAG AAA contrast is a binding constraint across all four theme states. The aesthetic is iOS-inspired: glassy blurred navigation, tactile rounded cards, subtle lift on interaction, flat at rest.

**Key Characteristics:**
- Gold-led: one accent (Ledger Gold `#ca8a04`, Candlelight `#ffc400` in dark) used for actions, active nav, and emphasis — never decoration
- Paper-and-ink surfaces: white/slate-light palette with a soft diagonal gradient wash
- Four voice fonts with strict roles: Cairo for reading, Poppins for headings, Roboto Mono for every number, Amiri for decorative flourishes
- Big radii (16–24px), generous padding, tactile but calm
- Receipt zigzag edges as the signature flourish on financial documents
- Flat by default; depth appears only as hover/active lift and glassy blur

## Colors

The palette is a gold accent on calm paper tones — warm, honest, and precise. Light mode is ledger paper; dark mode is the night desk with candlelight gold.

### Primary
- **Ledger Gold** (#ca8a04): the single accent — primary buttons, active nav state, focus rings, selection, caret, scrollbar hover, links. In dark mode it shifts to **Candlelight Gold** (#ffc400) to keep AAA contrast on near-black.
- **Gold Mist** (#fefce8): primary's tinted background — category icon tiles (Transport, Housing), hover washes behind gold elements.
- **Gold Outline** (#fef08a): primary's border variant for tinted containers.
- **Ink-Gold Text** (#a16207; #ffc400 in dark): gold-toned *text* on light surfaces — headings, stat labels, links. Never the bare fill gold, which fails 4.5:1 on white.

### Secondary
- **Slate Blue** (#475569): secondary text, muted icons, category labels, unselected nav items. Dark: **Ash** (#9ca3af).

### Neutral
- **Ink** (#0e1628): primary text — deep navy-slate, not pure black, kept soft on white. Dark: **Snow** (#f2f2f2).
- **Paper** (#ffffff): page background (light). Dark: **Night** (#0b0b0d).
- **Card Paper** (#f8fafc): cards, surfaces, filled inputs. Dark: **Night Surface** (#151518).
- **Quiet Slate** (#64748b): hints, descriptions, timestamps, footer metadata. Dark: **Dim Ash** (#b5b5b5).
- **Divider Slate** (#c3cedd): borders and dividers. Dark: **Night Line** (#2a2a2e).
- **Hover Wash** (#f1f5f9): hover background for menu items and icon buttons. Dark: **Night Wash** (#1e1e22).

### Status
- **Pending Amber** (#b45309 on #fff5e6): awaiting admin approval. Dark: #f59e0b on #422006.
- **Approved Emerald** (#047857 on #edfdf4): settled, counted in balances. Dark: #10b981 on #022c22.
- **Rejected Red** (#b91c1c on #feecec): declined payments and destructive actions. Dark: #ef4444 on #450a0a.
- **System:** Success #16a34a, Error #dc2626, Warning #ca8a04, Info #0284c7 (brightened in dark: #22c55e / #ff4d4d / #f59e0b / #60a5fa). As *text* on light surfaces use the 700-shade pair (`--color-{success,warning,info,error}-text`: #15803d / #a16207 / #0369a1 / #b91c1c; dark: the brightened fills).

### Named Rules
**The One Gold Rule.** Ledger Gold appears on action targets and active states only — buttons, current nav, focus. It never colors body text or fills a whole screen; its rarity is the point.

**The Ink-on-Gold Rule.** Text on a gold fill is always Ink (`--color-on-fill`, #0e1628; #ffc400 fill in dark stays Ink) — never white. White on Ledger Gold is 2.94:1 in light and 1.63:1 in dark; Ink passes AAA in both. Enforced globally for Tailwind utilities, and by hand for inline styles.

**The Gradient Wash Rule.** The page background is always the soft 135° diagonal (light: #f8fafc→#e5eaf1; dark: #0b0b0d→#151518). Never use a flat background color; the wash is what keeps the paper from feeling dead.

## Typography

**Display Font:** Poppins (headings, semibold 600)
**Body Font:** Cairo (system-ui fallback)
**Label/Mono Font:** Roboto Mono (numbers, currency, stats, code)
**Decorative Font:** Amiri (serif flourishes, signature quotes)

**Character:** Cairo's open, humanist letterforms carry Egyptian Arabic naturally and read warm at small sizes; Poppins adds a geometric, confident voice for headings; Roboto Mono makes every amount look like a ledger entry. The pairing is friendly-and-exact — a housemate speaking, a bookkeeper writing.

### Hierarchy
- **Headline** (Poppins, 600, 1.2): page titles and stat values (text-3xl+).
- **Title** (Cairo, 600, 1.3): card titles, section headers, input labels.
- **Body** (Cairo, 400, 1.5): primary reading text. Max ~65ch for descriptions.
- **Label** (Cairo, 500, 1.4, tracking-wider): small metadata, section labels, stat titles (text-sm, uppercase intent via tracking).
- **Mono Data** (Roboto Mono, 500): every currency amount, balance, count, and char counter — never a proportional font.

### Named Rules
**The Ledger Digits Rule.** Every money figure is set in Roboto Mono. If it's a number about money, it's mono — in cards, stats, tables, and inputs alike. `.currency`, `.stats`, `.data-value`, `input[type="number"]` carry this by default.

## Layout

The app is mobile-first with a fixed bottom navigation on phones (5 slots: home, expenses, the raised gold add-expense button, invoices, house) and a glassy blurred top nav growing into a desktop sidebar at md+. Main content sits in a max-w-7xl container with generous card columns.

- **Spacing rhythm:** 8px base scale (8/16/24/32) — cards use p-5 (20px), stacked sections gap-4/6.
- **Density:** comfortable, not tight; every tappable target ≥ 40px tall.
- **Responsive:** bottom nav → sidebar at 768px; card grids collapse 3→2→1; mobile adds 80px bottom padding so content clears the nav; iPhone safe-area inset respected (`pb-safe`).
- **RTL first:** everything flows right-to-left; icon padding flips (`pr-`/`pl-` swap) via the shared Input component.

## Elevation & Depth

The system is **flat by default, lifting on touch** — the incumbent shadow scale exists but earns its place only as a response to state.

### Shadow Vocabulary
- **Rest** (no shadow): cards, inputs, and panels at rest are flat, separated by surface tone and 1px Divider Slate borders.
- **Lift** (`box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.07)`): hover state on cards.
- **Raise** (`0 4px 6px -1px rgb(0 0 0 / 0.12)`): elevated panels, dropdown menus, palette menu.
- **Float** (`0 10px 15px -3px rgb(0 0 0 / 0.14)` / `0 20px 25px -5px rgb(0 0 0 / 0.16)`): modals and the active bottom-nav add button.
- **Glass:** navigation chrome (top bar, bottom nav) uses `backdrop-blur-xl` over the gradient wash with 1px border — depth by translucency, not shadow.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadows appear only on hover, elevation, or state — never as permanent card furniture. If a card always needs a shadow, it needs a border instead.

## Shapes

The form language is **soft and generous** — big radii that make money feel friendly, with only the receipt signature allowed to be angular.

- **Cards:** 16px (`rounded-2xl`); stat cards 24px (`rounded-3xl`).
- **Inputs:** 12px small, 16px medium/large.
- **Chips, badges, status pills:** fully round (`rounded-full`).
- **Icon tiles:** 12px; nav links 16px.
- **Focus rings:** 3px solid Ledger Gold, 2px offset, 4px radius — visible in both modes.
- **Signature silhouette:** the **receipt zigzag** — 12px radial scalloped edges top and bottom of financial documents (`.receipt-zigzag`), in the surface color so it reads as torn paper.

## Components

### Buttons
- **Shape:** rounded-2xl (16px), generous padding (12px 20px+), full-width on mobile.
- **Primary:** Ledger Gold background, Ink text (Ink-on-Gold Rule), lifts 1px on hover (`translateY(-1px)`), returns on active.
- **Hover / Focus:** 150–200ms ease transitions on all state changes; focus ring per Shapes.
- **Icon buttons:** circular (`rounded-full`, p-2.5), quiet Slate Blue at rest, gold on active/hover, error-red for destructive (logout, delete).
- **The Raised Add Button:** bottom-nav center slot — gold circle with shadow, the one permanent elevated element, signaling "this is the primary act."

### Chips
- **Style:** fully round, 12px text, `#e2e8f0`/Slate Blue fill, or tinted per category (gold mist for Transport/Housing, amber mist for Food/Utilities, red mist for Entertainment).
- **Category tiles:** rounded-xl icon squares with tinted backgrounds from the category map — never full saturation.

### Cards / Containers
- **Corner Style:** 16px (24px for stat cards).
- **Background:** Card Paper with 1px Divider Slate border; stat cards get tinted washes (success/error at 10% + 20% border) instead of color fills.
- **Shadow Strategy:** flat at rest, Lift on hover (see Elevation).
- **Internal Padding:** 20px (`p-5`); footer rows separated by a 1px top border.

### Inputs / Fields
- **Style:** three variants — default (Paper bg + Divider Slate border), filled (Card Paper, no border), outlined (2px border); sizes sm/md/lg; icons swap sides in RTL.
- **Focus:** border shifts to Ledger Gold, 2px gold ring at 20% opacity; caret is gold and pulses (`caret-glow`).
- **Error / Success:** border + ring + icon turn to Error Red / Success Green; messages 12px under the field.
- **States:** disabled at 60% opacity with Hover Wash bg.

### Navigation
- **Mobile:** fixed glassy bottom nav (5 slots, blur-xl) + compact top bar with theme toggle; active slot is gold, center add button raised.
- **Desktop:** blurred top bar (md+) and a collapsible sidebar with grouped sections (الرئيسية / المالية / الأدوات).
- **Active state:** Ledger Gold background with Ink text on top-bar links (rounded-2xl); sidebar items tint gold.
- **Locked state:** 50% opacity + `cursor-not-allowed` when the user has no house yet, with an amber notice banner.

### Status Badges
- **Pending:** amber triad (text `#b45309`, bg `#fff5e6`, border `#ffcc80`), fully round.
- **Approved:** emerald triad (`#047857` / `#edfdf4` / `#86efac`).
- **Rejected:** red triad (`#b91c1c` / `#feecec` / `#fca5a5`).
- One triad per state in both modes; badges stay pills, never filled blocks.

## Do's and Don'ts

### Do:
- **Do** use Ledger Gold only for action and active-state targets (One Gold Rule).
- **Do** set every money figure in Roboto Mono (Ledger Digits Rule).
- **Do** keep cards flat at rest and lift them only on hover (Flat-By-Default Rule).
- **Do** keep the gradient wash on the page background in both modes.
- **Do** use the receipt zigzag on financial documents and statements only.
- **Do** write UI copy in Egyptian colloquial Arabic with full RTL layout.
- **Do** hit WCAG AAA on all text/background pairs in all four theme states.

### Don't:
- **Don't** use gold as a background wash for whole screens or sections — it is a target color, not a canvas color.
- **Don't** render amounts in Cairo or any proportional font — mono or nothing.
- **Don't** stack permanent shadows on cards; borders do the separating at rest.
- **Don't** flatten the focus ring — 3px gold with offset is required for keyboard navigation.
- **Don't** invent new status colors; pending/approved/rejected triads are fixed.
- **Don't** use pure black or pure white surfaces in dark mode — always Night `#0b0b0d` / Night Surface `#151518`.
