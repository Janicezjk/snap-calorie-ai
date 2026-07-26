---
name: SnapCalorie AI
version: 1.0.0
tokens:
  colors:
    bg_canvas: "#0B0F17"
    bg_card: "rgba(18, 24, 38, 0.75)"
    border_subtle: "rgba(255, 255, 255, 0.08)"
    accent_primary: "#06B6D4"
    accent_success: "#10B981"
    accent_warning: "#F59E0B"
    accent_danger: "#EF4444"
    text_primary: "#F8FAFC"
    text_muted: "#94A3B8"
    text_subdued: "#64748B"
  typography:
    font_family: "'Inter', -apple-system, sans-serif"
    heading_weight: "800"
    letter_spacing_heading: "-0.02em"
  elevation:
    card_shadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)"
    card_backdrop_filter: "blur(16px)"
  shapes:
    radius_card: "16px"
    radius_button: "12px"
    radius_pill: "9999px"
---

# DESIGN.md - SnapCalorie AI Design System Specification

## 1. Overview
SnapCalorie AI is a futuristic, dark-mode glassmorphic health and calorie tracking application. The visual system emphasizes precision, modern health technology, and instantaneous feedback through glowing visual metrics and minimal friction.

## 2. Colors & Roles
- **Canvas Base:** `#0B0F17` (Deep space navy)
- **Surface Elevation:** `rgba(18, 24, 38, 0.75)` backdrop blur `16px`.
- **Primary Action / Glow:** `#06B6D4` (Electric Cyan)
- **On-Track Calorie Budget:** `#10B981` (Vibrant Emerald)
- **Threshold Warning:** `#F59E0B` (Amber Glow)
- **Threshold Exceeded:** `#EF4444` (Vivid Crimson)

## 3. Typography Rules
- Use `'Inter', -apple-system, BlinkMacSystemFont, sans-serif` as primary stack.
- Metric values (Calories, Protein, Carbs, Fat) MUST use `font-variant-numeric: tabular-nums` to prevent layout shift during calculation animations.
- Section titles MUST be uppercase with `letter-spacing: 0.05em` and `font-weight: 700`.

## 4. Layout & Grid Principles
- Maximum container width: `1200px` centered with auto padding.
- Responsive grid: Auto-fit cards with `minmax(300px, 1fr)`.
- Spacing Scale: Base unit `8px` (`8px`, `16px`, `24px`, `32px`, `48px`).

## 5. Elevation & Depth
- Cards float above canvas using layered translucency: `background: rgba(18, 24, 38, 0.75)` + `border: 1px solid rgba(255, 255, 255, 0.08)`.
- Active / Focused cards escalate with cyan border glow: `border-color: rgba(6, 182, 212, 0.5)` and `box-shadow: 0 0 25px rgba(6, 182, 212, 0.25)`.

## 6. Shapes & Geometry
- Main Cards: `16px` border-radius.
- Interactive Buttons & Inputs: `12px` border-radius.
- Badges & Tags: `9999px` fully rounded pill geometry.

## 7. Component Specifications
- **Progress Gauge (Calorie Ring):** SVG circle with gradient stroke (`#06B6D4` to `#10B981`), `stroke-linecap: round`, animated `stroke-dashoffset`.
- **Camera Scan Zone:** Animated scan line gliding vertically across the viewport with `#06B6D4` pulse effect.
- **Nutrient Pills:** Translucent badges displaying macro distribution with color indicator dots.

## 8. Do's and Don'ts
- **DO:** Maintain high contrast between text (`#F8FAFC`) and glass surfaces.
- **DO:** Use smooth micro-transitions (`transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)`).
- **DON'T:** Use harsh pure black (`#000000`) backgrounds or solid opaque gray cards.
- **DON'T:** Overcrowd the main dashboard; prioritize the daily calorie budget and camera action button.

