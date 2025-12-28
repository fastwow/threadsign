# Visual Design Guidelines
## ThreadSign (MVP)

This document defines **directional visual guidance**.
It is not a final design spec.

---

## 1. Design Principles

- Dark-theme–first
- Minimal, product-focused
- High signal-to-noise
- Content > decoration
- Optimized for scanning, not browsing

The UI should feel:
- Calm
- Analytical
- Founder-oriented

---

## 2. Theme & Framework

- Theme: **Dark**
- Styling: **Tailwind CSS**
- Component library: **shadcn/ui**

Tailwind handles layout, spacing, color tokens  
shadcn/ui provides accessible, composable primitives

---

## 3. Color Roles (Dark Theme)

### Backgrounds
- **App background:** near-black / very dark neutral
- **Surface / cards:** slightly elevated dark gray

### Text
- **Primary text:** near-white
- **Secondary text:** muted gray
- **Disabled text:** low-contrast gray

### Brand / Primary
- Used for:
  - Primary actions
  - Active filters
  - Key highlights
- Should be restrained and not overpower content

### Accent
- Used sparingly for:
  - “New” badge
  - Scores
  - Status indicators

### States
- Success: muted green
- Warning: muted amber
- Error: muted red

Avoid pure neon or highly saturated colors.

---

## 4. Accessibility Considerations

- Maintain sufficient contrast for all text
- Avoid relying on color alone for meaning
- Font sizes must be readable at default zoom
- Interactive elements must have clear hover/focus states

Dark theme must remain readable in low-light environments.

---

## 5. Layout & Components

### Expected Usage of shadcn/ui
- Buttons
- Badges
- Cards
- Inputs
- Tabs / filters
- Dropdowns

Components should:
- Be composable
- Avoid heavy visual overrides
- Respect shadcn defaults where possible

---

## 6. Interaction Notes

- Filters should feel instant
- Loading states should be subtle (skeletons, muted spinners)
- Empty states should explain *why* content is missing

---

## 7. Visual Anti-Goals

- No gradients-heavy marketing UI
- No glassmorphism
- No dashboard clutter
- No unnecessary animations

ThreadSign should feel like a **tool**, not a landing page builder.
