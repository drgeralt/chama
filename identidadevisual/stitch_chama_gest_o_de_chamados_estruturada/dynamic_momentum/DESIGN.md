---
name: Dynamic Momentum
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#5d4038'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#926f66'
  outline-variant: '#e7bdb2'
  surface-tint: '#b12d00'
  primary: '#ad2c00'
  on-primary: '#ffffff'
  primary-container: '#d83900'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb5a0'
  secondary: '#904d00'
  on-secondary: '#ffffff'
  secondary-container: '#fd8b00'
  on-secondary-container: '#603100'
  tertiary: '#705d00'
  on-tertiary: '#ffffff'
  tertiary-container: '#c9a900'
  on-tertiary-container: '#4c3f00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbd1'
  primary-fixed-dim: '#ffb5a0'
  on-primary-fixed: '#3b0900'
  on-primary-fixed-variant: '#872000'
  secondary-fixed: '#ffdcc3'
  secondary-fixed-dim: '#ffb77d'
  on-secondary-fixed: '#2f1500'
  on-secondary-fixed-variant: '#6e3900'
  tertiary-fixed: '#ffe16d'
  tertiary-fixed-dim: '#e9c400'
  on-tertiary-fixed: '#221b00'
  on-tertiary-fixed-variant: '#544600'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  metadata:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  sidebar-width: 280px
  container-max: 1440px
  gutter: 24px
  margin-desktop: 32px
  margin-mobile: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
---

## Brand & Style

The design system is engineered for high-velocity corporate environments where clarity and productivity are paramount. It strikes a balance between **Corporate Modernism** and **Dynamic Energy**, utilizing a high-contrast palette to signal urgency and progress without sacrificing professional stability.

The visual narrative is built on the concept of "controlled heat"—using the energetic warmth of the logo's gradients against a stabilizing, deep slate foundation. The interface remains intentionally spacious to allow complex task data to breathe, ensuring that users feel focused rather than overwhelmed.

## Colors

This design system utilizes a "Warm-on-Cold" strategy. The primary actions and critical statuses use high-chroma orange and red tones to draw immediate attention, while the structural framework (navigation, sidebars, and primary text) is anchored in a deep slate blue to provide a premium, authoritative feel.

- **Primary Action (#FF4500):** Reserved for the highest priority tasks, primary CTAs, and destructive actions that require focus.
- **Secondary Action (#FF8C00):** Used for "In Progress" states and interactive hover transitions to provide a softer kinetic feel.
- **Status Gold (#FFD700):** Specifically for "In Review" or warning states, ensuring distinct visibility from success markers.
- **Structural Dark (#0F172A):** This is the bedrock of the UI, used for the main navigation sidebar to create a strong silhouette against the light content area.

## Typography

Typography in the design system is built exclusively on **Inter** to leverage its exceptional legibility in data-heavy environments. 

The hierarchy is strictly enforced: 
- **Bold (700)** is reserved for top-level page headers and section titles to provide clear entry points.
- **Medium (500)** is the workhorse for metadata, table headers, and status labels, providing enough visual weight to be distinct from body copy.
- **Regular (400)** is used for all descriptive text and user-generated content to maintain a clean, readable flow.

For mobile, headlines scale down significantly to prevent awkward word wrapping in task cards, while body sizes remain at 16px for touch-target accessibility.

## Layout & Spacing

The design system employs a **Fixed-Fluid hybrid grid**. 

1. **The Navigation Rail:** A fixed 280px sidebar persists on the left for desktop, providing constant access to global task views and project filters.
2. **The Content Canvas:** A fluid 12-column grid that fills the remaining viewport, maxing out at 1440px to prevent excessive line lengths. 

Spacing follows a strict **8px base unit**. All task cards and modular elements use 24px (stack-lg) of internal padding to reinforce the "Professional/Clean" aesthetic requested. On mobile devices, the sidebar collapses into a bottom navigation bar or a hamburger menu, and side margins compress to 16px.

## Elevation & Depth

Visual hierarchy is established through a combination of **Tonal Layers** and **Ambient Shadows**.

The background is a flat `#F8FAFC`, which serves as the lowest floor. Task cards and interactive modules sit on "Elevated" surfaces—pure white (`#FFFFFF`) backgrounds with a subtle, diffused shadow.

**Shadow Specification:**
- **Level 1 (Cards):** `0 4px 6px -1px rgba(15, 23, 42, 0.1), 0 2px 4px -2px rgba(15, 23, 42, 0.05)` — This uses the slate blue neutral for the shadow tint to keep it "cool" and professional.
- **Level 2 (Modals/Dropdowns):** `0 10px 15px -3px rgba(15, 23, 42, 0.15)` — Used for elements that temporarily interrupt the workflow.

Low-contrast outlines (`#E2E8F0`) are used on all input fields and inactive card borders to maintain structure without adding visual noise.

## Shapes

The design system adopts a **Rounded** shape language to soften the serious nature of task management and make the UI feel approachable.

- **Standard Radius:** 8px (0.5rem) for all primary components including Task Cards, Input Fields, and Buttons.
- **Large Radius:** 16px (1rem) for larger containers like modals or highlighted dashboard widgets.
- **Pill Shape:** Used exclusively for Status Badges (badges/chips) to distinguish them from interactive buttons.

## Components

### Sidebar Navigation
The sidebar uses the `#0F172A` Slate Blue. Active states should use a left-edge accent bar in `#FF4500` with a subtle white opacity layer (10%) over the menu item background. Icons should be monoline and 20px in size.

### Task Cards
Cards are the primary data containers. 
- **Surface:** White with Level 1 shadow.
- **Indicator:** A 4px vertical bar on the left edge indicates priority (Red for High, Gold for Medium).
- **Status Badges:** Use the Pill shape. Backgrounds should be 10-15% opacity of the status color with 100% opacity text for high legibility (e.g., Green text on light green background for "Completed").

### Buttons
- **Primary:** Solid `#FF4500` with white text. 8px radius.
- **Secondary:** Outlined `#E2E8F0` with `#0F172A` text.
- **Hover States:** Primary buttons shift to `#FF8C00` on hover to provide visual feedback of "warming up."

### Input Fields
Inputs use a white background, 8px radius, and an `#E2E8F0` border. On focus, the border transitions to `#FF4500` with a 2px soft outer glow (ring) in the same color at 20% opacity.

### Progress Bars
Track background should be `#E2E8F0` with the active fill using a gradient from `#FF8C00` to `#FF4500`, reinforcing the dynamic brand personality.