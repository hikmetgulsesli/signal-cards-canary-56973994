---
name: Signal Cards Canary
colors:
  surface: '#fcf8fa'
  surface-dim: '#dcd9db'
  surface-bright: '#fcf8fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f5'
  surface-container: '#f0edef'
  surface-container-high: '#eae7e9'
  surface-container-highest: '#e4e2e4'
  on-surface: '#1b1b1d'
  on-surface-variant: '#45464d'
  inverse-surface: '#303032'
  inverse-on-surface: '#f3f0f2'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#0058be'
  on-secondary: '#ffffff'
  secondary-container: '#2170e4'
  on-secondary-container: '#fefcff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#2a1700'
  on-tertiary-container: '#b87500'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#fcf8fa'
  on-background: '#1b1b1d'
  surface-variant: '#e4e2e4'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  display-sm:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  container-padding: 24px
  stack-gap-dense: 8px
  stack-gap-normal: 16px
  gutter: 12px
  cell-padding-v: 10px
  cell-padding-h: 12px
---

## Brand & Style
The design system is engineered for high-performance operational workflows where information density and clarity are paramount. The brand personality is **utilitarian, dependable, and precise**, stripping away decorative "fluff" in favor of a "dense but calm" aesthetic. 

The visual style follows a **Modern Corporate/Minimalist** approach, leaning into a systematic grid that prioritizes data hierarchy. It evokes an emotional response of focused control—ideal for users managing high-volume note counting and financial utility tasks. The interface should feel like a precision instrument: quiet when idling, but highly legible during active use.

## Colors
The palette is rooted in a sophisticated neutral base to minimize cognitive load, using Slate and Gray scales for structural elements. 

- **Primary (Slate 900):** Used for core text and high-level navigation.
- **Counter A (Vibrant Blue):** The primary action and primary data stream color.
- **Counter B (Focused Amber):** For secondary streams or cautionary data states.
- **Counter C (Steady Emerald):** For tertiary streams or "success/verified" states.
- **Neutrals:** A tight range of Slate (50-900) provides the canvas, with subtle borders (Slate 200) to define density without adding visual weight.

## Typography
This design system utilizes **Inter** for its exceptional legibility in dense UI environments. A clear typographic hierarchy is established to differentiate between instructional text and operational data.

- **Data Density:** `body-sm` (13px) is the workhorse size for table rows and input fields to maximize vertical real estate.
- **Monospace Integration:** **JetBrains Mono** is introduced for numeric values and counters to ensure character alignment and rapid scanning.
- **Case Usage:** All-caps `label-caps` are reserved for table headers and section titles to create a clear visual break between structural labels and dynamic content.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy on desktop to maintain predictable scanning patterns for data.

- **Density Model:** A strict 4px baseline grid governs all spacing. Vertical rhythm is tight (8px-12px gaps) to allow more information to be visible above the fold.
- **Grid Structure:** A 12-column system is used for dashboards. Content is typically housed in "Metric Cards" that span 3 or 4 columns.
- **Responsive Behavior:** 
  - **Desktop:** Sidebar is persistent (240px). 
  - **Tablet:** Sidebar collapses to an icon-rail (64px).
  - **Mobile:** Layout shifts to a single column with "sticky" counter summaries at the bottom of the viewport.

## Elevation & Depth
To maintain a "calm" environment, this design system eschews heavy shadows in favor of **Tonal Layers** and **Low-Contrast Outlines**.

- **Surface Strategy:** The background uses a very light tint (Slate 50). Primary containers use a pure white background with a 1px border (Slate 200).
- **Depth Hierarchy:**
  - **Level 0 (Background):** Slate 50.
  - **Level 1 (Cards/Tables):** White surface + 1px Slate 200 border. No shadow.
  - **Level 2 (Modals/Popovers):** White surface + subtle 4px blur shadow (6% opacity) to provide just enough separation from the data grid.
- **Focus States:** High-contrast 2px ring in Counter A (Blue) for keyboard navigation and active inputs.

## Shapes
The shape language is **Soft (0.25rem)**, providing a subtle professional touch that keeps the UI from feeling "sharp" or "aggressive" while maintaining the efficiency of a grid-based system.

- **Standard Elements:** Buttons, inputs, and small cards use the `rounded` (4px) token.
- **Data Containers:** Large data tables or dashboard sections use `rounded-lg` (8px).
- **Status Indicators:** Small chips use `rounded-full` (pill) to distinguish them from interactive buttons.

## Components
Consistent utility is driven by these specific component executions:

- **Metric Cards:** Large-format counters using `display-lg` in monospace. Each card features a top-accent border color corresponding to its specific counter (Blue, Amber, or Emerald).
- **Data Tables:** High-density rows with 10px vertical padding. Headers are `label-caps` with a Slate 100 background. Zebra-striping is applied for lists exceeding 10 rows.
- **Buttons:** 
  - **Primary:** Solid Slate 900 for general actions.
  - **Counter-Specific:** Outline buttons using the specific counter color for filtered actions.
- **Input Fields:** 1px Slate 300 borders. Validation states use the Emerald (success) or a standard Red 600 (error), with small icons to ensure accessibility.
- **Persistent Navigation:** A slim vertical sidebar with icons and `body-sm` labels, utilizing a "high-contrast tab" to indicate the active state.
- **Status Chips:** Small, low-saturation backgrounds with high-saturation text for categorized notes (e.g., "Verified," "Pending," "Flagged").