---
version: 1.0
name: Perigee Design System
description: Token-driven visual and interaction system for the Perigee marketplace application. Light and dark themes are first-class.
---

# Perigee Design System

## Design Personality

Perigee is **clean, minimal, professional, intuitive, interactive, and lightly playful**.

The visual system should feel deliberate and product-grade, not decorative or AI-generated.

Playfulness comes from restrained accents, subtle motion, friendly empty-state illustration, and polished interaction feedback.

Do not use decorative visual effects as a substitute for hierarchy.

---

## Colors

### Primitive palette

```yaml
colors:
  ember-50: '#FFF1EC'
  ember-100: '#FFE0D7'
  ember-200: '#FFC2B1'
  ember-300: '#F49A80'
  ember-400: '#E66A45'
  ember-500: '#D95D39'
  ember-600: '#B9482A'
  ember-700: '#93381F'

  atmospheric-blue-50: '#EEF7FA'
  atmospheric-blue-100: '#DCEEF4'
  atmospheric-blue-200: '#B9DCE8'
  atmospheric-blue-300: '#7FB6CA'
  atmospheric-blue-400: '#4A90B2'
  atmospheric-blue-500: '#367B9D'
  atmospheric-blue-600: '#2C657F'
  atmospheric-blue-700: '#245369'

  canvas-light: '#ECEFF4'
  surface-light: '#F7F9FC'
  text-primary-light: '#1E232D'
  text-muted-light: '#6B7280'
  border-light: '#D5D9E0'

  canvas-dark: '#0A0D14'
  surface-dark: '#131722'
  text-primary-dark: '#E4E7EC'
  text-muted-dark: '#8B95A5'
  border-dark: '#1F2430'

  white: '#FFFFFF'
  black: '#000000'

  success-500: '#2E8B68'
  success-100: '#E6F5EF'
  warning-500: '#B7791F'
  warning-100: '#FFF4D6'
  danger-500: '#C74646'
  danger-100: '#FDEAEA'
  info-500: '#367B9D'
  info-100: '#E7F3F7'
```

## Semantic tokens

```yaml
semantic:
  light:
    background: '#ECEFF4'
    surface: '#F7F9FC'
    surface-raised: '#FFFFFF'
    surface-subtle: '#E5E9EF'
    surface-hover: '#F0F3F7'
    surface-active: '#E7EBF1'

    text-primary: '#1E232D'
    text-secondary: '#4F5663'
    text-tertiary: '#6B7280'
    text-disabled: '#9AA1AD'
    text-inverse: '#FFFFFF'

    border-default: '#D5D9E0'
    border-subtle: '#E3E6EB'
    border-strong: '#B9BEC8'
    border-focus: '#D95D39'

    accent: '#D95D39'
    accent-hover: '#B9482A'
    accent-active: '#93381F'
    accent-subtle: '#FFF1EC'
    on-accent: '#FFFFFF'

    secondary-accent: '#367B9D'
    secondary-accent-hover: '#2C657F'
    secondary-accent-subtle: '#EEF7FA'

    success: '#2E8B68'
    success-subtle: '#E6F5EF'
    warning: '#B7791F'
    warning-subtle: '#FFF4D6'
    danger: '#C74646'
    danger-subtle: '#FDEAEA'
    info: '#367B9D'
    info-subtle: '#E7F3F7'

  dark:
    background: '#0A0D14'
    surface: '#131722'
    surface-raised: '#191E2A'
    surface-subtle: '#10141D'
    surface-hover: '#1B202C'
    surface-active: '#202633'

    text-primary: '#E4E7EC'
    text-secondary: '#B5BBC6'
    text-tertiary: '#8B95A5'
    text-disabled: '#626B7A'
    text-inverse: '#1E232D'

    border-default: '#1F2430'
    border-subtle: '#181D27'
    border-strong: '#343B49'
    border-focus: '#E66A45'

    accent: '#E66A45'
    accent-hover: '#F08060'
    accent-active: '#FF9476'
    accent-subtle: '#321C17'
    on-accent: '#FFFFFF'

    secondary-accent: '#4A90B2'
    secondary-accent-hover: '#68A8C4'
    secondary-accent-subtle: '#142833'

    success: '#55B78F'
    success-subtle: '#12271F'
    warning: '#D5A24D'
    warning-subtle: '#2B2415'
    danger: '#E47777'
    danger-subtle: '#2C1818'
    info: '#68A8C4'
    info-subtle: '#142833'
```

## Color rules

```yaml
color_rules:
  - Components consume semantic tokens, never raw hex values.
  - Ember is the primary action/conversion color.
  - Atmospheric blue is informational and secondary, not a competing primary CTA.
  - Success, warning, danger, and info are reserved for semantic feedback.
  - Accent colors are not used as decorative page backgrounds.
  - Dark mode uses intentional dark surfaces; it is not a color inversion.
```

---

## Typography

### Font family

```yaml
fontFamily:
  sans: 'Geist, Inter, Helvetica, Arial, sans-serif'
  mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
```

Geist is the only product typeface. Use the mono stack only for technical values such as IDs, code, or machine-readable data.

### Type scale

```yaml
typography:
  display-xl:
    fontFamily: 'Geist, Inter, Helvetica, Arial, sans-serif'
    fontSize: 48px
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: -1.2px

  display-lg:
    fontFamily: 'Geist, Inter, Helvetica, Arial, sans-serif'
    fontSize: 40px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -0.8px

  display-md:
    fontFamily: 'Geist, Inter, Helvetica, Arial, sans-serif'
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: -0.5px

  heading-xl:
    fontFamily: 'Geist, Inter, Helvetica, Arial, sans-serif'
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.35px

  heading-lg:
    fontFamily: 'Geist, Inter, Helvetica, Arial, sans-serif'
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: -0.25px

  heading-md:
    fontFamily: 'Geist, Inter, Helvetica, Arial, sans-serif'
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: -0.15px

  heading-sm:
    fontFamily: 'Geist, Inter, Helvetica, Arial, sans-serif'
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0

  body-lg:
    fontFamily: 'Geist, Inter, Helvetica, Arial, sans-serif'
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: 0

  body-md:
    fontFamily: 'Geist, Inter, Helvetica, Arial, sans-serif'
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0

  body-strong:
    fontFamily: 'Geist, Inter, Helvetica, Arial, sans-serif'
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: 0

  body-sm:
    fontFamily: 'Geist, Inter, Helvetica, Arial, sans-serif'
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: 0

  label:
    fontFamily: 'Geist, Inter, Helvetica, Arial, sans-serif'
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0

  caption:
    fontFamily: 'Geist, Inter, Helvetica, Arial, sans-serif'
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0.1px

  code:
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
```

### Typography usage

```yaml
usage:
  display: 'Page-level marketing or major product moments only'
  heading-xl: 'Primary page heading'
  heading-lg: 'Major section heading'
  heading-md: 'Card, panel, and subsection heading'
  heading-sm: 'Compact component heading'
  body-lg: 'Important supporting copy'
  body-md: 'Default interface and reading text'
  body-strong: 'Emphasized body text'
  body-sm: 'Dense metadata and secondary content'
  label: 'Controls, form labels, navigation labels'
  caption: 'Supporting metadata and helper text'
  code: 'Technical or machine-readable content'
```

---

## Spacing

Base unit: **4px**.

```yaml
spacing:
  xxs: 2px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 20px
  2xl: 24px
  3xl: 32px
  4xl: 40px
  5xl: 48px
  6xl: 64px
  7xl: 80px
  8xl: 96px
```

Use the smallest token that preserves readable grouping. Avoid arbitrary spacing values.

---

## Radius

```yaml
rounded:
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  2xl: 20px
  pill: 9999px
```

Perigee uses rounded geometry, but not excessive rounding.

Buttons, inputs, cards, dialogs, and surfaces should use the defined scale. Do not invent page-specific radii.

---

## Sizing

```yaml
sizing:
  control-sm: 32px
  control-md: 40px
  control-lg: 48px

  icon-xs: 12px
  icon-sm: 16px
  icon-md: 20px
  icon-lg: 24px
  icon-xl: 32px

  avatar-sm: 32px
  avatar-md: 40px
  avatar-lg: 48px
  avatar-xl: 64px

  touch-target-min: 44px
```

---

## Z-Index

```yaml
zIndex:
  base: 0
  sticky: 100
  dropdown: 200
  popover: 300
  overlay: 400
  modal: 500
  toast: 600
  tooltip: 700
```

---

## Borders

```yaml
border:
  width-thin: 1px
  width-strong: 2px
```

Default borders are 1px.

---

## Focus

```yaml
focus:
  ringWidth: 2px
  ringOffset: 2px
  ringColor: '{semantic.border-focus}'
```

---

## Elevation

Perigee prefers borders and surface contrast over heavy shadows.

```yaml
shadow:
  none: 'none'
  sm: '0 1px 2px rgba(30, 35, 45, 0.06)'
  md: '0 4px 12px rgba(30, 35, 45, 0.10)'
  lg: '0 12px 32px rgba(30, 35, 45, 0.14)'
  overlay: '0 16px 48px rgba(30, 35, 45, 0.18)'
```

Dark mode shadows should remain subtle; surface separation should do most of the work.

---

## Motion

Motion is functional feedback, not decoration.

```yaml
motion:
  duration-instant: 0ms
  duration-fast: 120ms
  duration-normal: 180ms
  duration-moderate: 240ms
  duration-slow: 320ms

  easing-standard: 'cubic-bezier(0.2, 0, 0, 1)'
  easing-emphasized: 'cubic-bezier(0.2, 0.8, 0.2, 1)'
  easing-linear: 'linear'
```

### Motion usage

```yaml
motion_usage:
  hover: 120ms
  press: 120ms
  focus: 120ms
  tooltip: 120ms
  popover: 180ms
  dialog: 240ms
  page-transition: 240ms
```

Do not animate layout-heavy properties when transform or opacity can achieve the same result.

Respect reduced-motion preferences.

---

## Iconography

```yaml
icons:
  style: 'outline'
  default-size: 20px
  stroke-width: 1.75px
  small-size: 16px
  large-size: 24px
```

Use one icon family consistently.

Icons communicate meaning; they do not replace labels when the meaning is not universally obvious.

---

## Components

### button-primary

```yaml
button-primary:
  backgroundColor: '{semantic.accent}'
  textColor: '{semantic.on-accent}'
  typography: '{typography.label}'
  height: '{sizing.control-md}'
  padding: 0 16px
  rounded: '{rounded.md}'
  transition: 'background-color {motion.duration-fast} {motion.easing-standard}'
```

## button-secondary

```yaml
button-secondary:
  backgroundColor: '{semantic.surface-raised}'
  textColor: '{semantic.text-primary}'
  borderColor: '{semantic.border-default}'
  borderWidth: '{border.width-thin}'
  typography: '{typography.label}'
  height: '{sizing.control-md}'
  padding: 0 16px
  rounded: '{rounded.md}'
```

## button-ghost

```yaml
button-ghost:
  backgroundColor: 'transparent'
  textColor: '{semantic.text-secondary}'
  typography: '{typography.label}'
  height: '{sizing.control-md}'
  padding: 0 12px
  rounded: '{rounded.md}'
```

## button-danger

```yaml
button-danger:
  backgroundColor: '{semantic.danger}'
  textColor: '#FFFFFF'
  typography: '{typography.label}'
  height: '{sizing.control-md}'
  padding: 0 16px
  rounded: '{rounded.md}'
```

## icon-button

```yaml
icon-button:
  backgroundColor: 'transparent'
  textColor: '{semantic.text-secondary}'
  size: '{sizing.control-md}'
  rounded: '{rounded.md}'
  iconSize: '{sizing.icon-md}'
```

## text-input

```yaml
text-input:
  backgroundColor: '{semantic.surface-raised}'
  textColor: '{semantic.text-primary}'
  placeholderColor: '{semantic.text-tertiary}'
  borderColor: '{semantic.border-default}'
  borderWidth: '{border.width-thin}'
  typography: '{typography.body-md}'
  height: '{sizing.control-lg}'
  padding: 0 12px
  rounded: '{rounded.md}'
```

## text-area

```yaml
text-area:
  backgroundColor: '{semantic.surface-raised}'
  textColor: '{semantic.text-primary}'
  borderColor: '{semantic.border-default}'
  borderWidth: '{border.width-thin}'
  typography: '{typography.body-md}'
  padding: 12px
  rounded: '{rounded.md}'
```

## select

```yaml
select:
  backgroundColor: '{semantic.surface-raised}'
  textColor: '{semantic.text-primary}'
  borderColor: '{semantic.border-default}'
  borderWidth: '{border.width-thin}'
  typography: '{typography.body-md}'
  height: '{sizing.control-lg}'
  padding: 0 12px
  rounded: '{rounded.md}'
```

## checkbox

```yaml
checkbox:
  size: 20px
  borderColor: '{semantic.border-strong}'
  checkedBackground: '{semantic.accent}'
  checkedIconColor: '{semantic.on-accent}'
  rounded: '{rounded.xs}'
```

## radio

```yaml
radio:
  size: 20px
  borderColor: '{semantic.border-strong}'
  selectedBorderColor: '{semantic.accent}'
  selectedIndicatorColor: '{semantic.accent}'
```

## switch

```yaml
switch:
  width: 40px
  height: 24px
  trackOff: '{semantic.border-strong}'
  trackOn: '{semantic.accent}'
  thumb: '#FFFFFF'
  rounded: '{rounded.pill}'
```

## card

```yaml
card:
  backgroundColor: '{semantic.surface-raised}'
  textColor: '{semantic.text-primary}'
  borderColor: '{semantic.border-default}'
  borderWidth: '{border.width-thin}'
  rounded: '{rounded.lg}'
  padding: 24px
```

## compact-card

```yaml
compact-card:
  backgroundColor: '{semantic.surface-raised}'
  textColor: '{semantic.text-primary}'
  borderColor: '{semantic.border-default}'
  borderWidth: '{border.width-thin}'
  rounded: '{rounded.md}'
  padding: 16px
```

## badge

```yaml
badge:
  typography: '{typography.caption}'
  height: 24px
  padding: 0 8px
  rounded: '{rounded.pill}'
```

## Semantic variants

```yaml
badge-success:
  backgroundColor: '{semantic.success-subtle}'
  textColor: '{semantic.success}'

badge-warning:
  backgroundColor: '{semantic.warning-subtle}'
  textColor: '{semantic.warning}'

badge-danger:
  backgroundColor: '{semantic.danger-subtle}'
  textColor: '{semantic.danger}'

badge-info:
  backgroundColor: '{semantic.info-subtle}'
  textColor: '{semantic.info}'

badge-neutral:
  backgroundColor: '{semantic.surface-subtle}'
  textColor: '{semantic.text-secondary}'
```

## tabs

```yaml
tabs:
  typography: '{typography.label}'
  activeTextColor: '{semantic.text-primary}'
  inactiveTextColor: '{semantic.text-tertiary}'
  activeIndicatorColor: '{semantic.accent}'
  indicatorHeight: 2px
  gap: 24px
```

## dialog

```yaml
dialog:
  backgroundColor: '{semantic.surface-raised}'
  textColor: '{semantic.text-primary}'
  rounded: '{rounded.xl}'
  padding: 24px
  shadow: '{shadow.overlay}'
  maxWidth: 480px
```

## popover

```yaml
popover:
  backgroundColor: '{semantic.surface-raised}'
  textColor: '{semantic.text-primary}'
  borderColor: '{semantic.border-default}'
  borderWidth: '{border.width-thin}'
  rounded: '{rounded.md}'
  padding: 8px
  shadow: '{shadow.md}'
```

## tooltip

```yaml
tooltip:
  backgroundColor: '{semantic.text-primary}'
  textColor: '{semantic.text-inverse}'
  typography: '{typography.caption}'
  rounded: '{rounded.sm}'
  padding: 6px 8px
```

## table

```yaml
table:
  headerTypography: '{typography.label}'
  bodyTypography: '{typography.body-sm}'
  headerBackground: '{semantic.surface-subtle}'
  rowBackground: '{semantic.surface-raised}'
  rowHoverBackground: '{semantic.surface-hover}'
  borderColor: '{semantic.border-default}'
  borderWidth: '{border.width-thin}'
  cellPadding: 12px 16px
```

## pagination

```yaml
pagination:
  itemSize: 40px
  typography: '{typography.label}'
  rounded: '{rounded.md}'
  activeBackground: '{semantic.accent}'
  activeTextColor: '{semantic.on-accent}'
  inactiveBackground: 'transparent'
  inactiveTextColor: '{semantic.text-secondary}'
```

## avatar

```yaml
avatar:
  backgroundColor: '{semantic.surface-subtle}'
  textColor: '{semantic.text-secondary}'
  rounded: '{rounded.pill}'
```

## skeleton

```yaml
skeleton:
  backgroundColor: '{semantic.surface-subtle}'
  rounded: '{rounded.sm}'
  animationDuration: '1200ms'
```

## toast

```yaml
toast:
  backgroundColor: '{semantic.surface-raised}'
  textColor: '{semantic.text-primary}'
  borderColor: '{semantic.border-default}'
  borderWidth: '{border.width-thin}'
  rounded: '{rounded.lg}'
  padding: 12px 16px
  shadow: '{shadow.md}'
```

---

## Component States

Every interactive component supports these states where applicable:

```yaml
states:
  - default
  - hover
  - focus-visible
  - pressed
  - disabled
  - loading
  - selected
  - invalid
```

State treatment must use semantic tokens and must not change component geometry.

Loading must preserve the component's dimensions.

Focus must remain visibly distinguishable in both themes.

---

## Form Field Structure

```yaml
form-field:
  label: '{typography.label}'
  input: '{components.text-input}'
  helper: '{typography.caption}'
  error: '{typography.caption}'
  labelGap: 8px
  helperGap: 6px
```

A field consists of:

```text
Label
↓
Control
↓
Helper / validation message
```

Never use placeholder text as the only label.

---

## Responsive Tokens

```yaml
breakpoints:
  sm: 640px
  md: 768px
  lg: 1024px
  xl: 1280px
  2xl: 1536px

content:
  maxWidth: 1280px
  mobileGutter: 16px
  tabletGutter: 24px
  desktopGutter: 32px
```

Responsive layouts must adapt hierarchy and interaction, not merely shrink desktop geometry.

---

## Theme Contract

Every component must work in both themes.

```yaml
theme:
  light:
    canvas: '{semantic.background}'
    surface: '{semantic.surface}'
    elevated: '{semantic.surface-raised}'
    text: '{semantic.text-primary}'
    muted: '{semantic.text-tertiary}'
    border: '{semantic.border-default}'
    accent: '{semantic.accent}'

  dark:
    canvas: '{semantic.background}'
    surface: '{semantic.surface}'
    elevated: '{semantic.surface-raised}'
    text: '{semantic.text-primary}'
    muted: '{semantic.text-tertiary}'
    border: '{semantic.border-default}'
    accent: '{semantic.accent}'
```

Never implement dark mode by applying a generic inversion/filter.

---

## Media

### Product media

```yaml
product-media:
  aspectRatio: '1 / 1'
  objectFit: 'cover'
  background: '{semantic.surface-subtle}'
  rounded: '{rounded.lg}'
```

Product imagery must not be distorted.

Missing media uses a neutral placeholder rather than broken-image UI.

### Illustrations

Use illustrations primarily for:

```yaml
onboarding;
empty states;
recoverable errors;
success;
offline/connectivity states.
```

Illustrations must use one coherent visual language.

Do not combine unrelated illustration styles.

---

## Accessibility

```yaml
accessibility:
  minimumTarget: 'WCAG 2.1 AA'
  minimumTouchTarget: '44px'
  focus: 'visible focus-visible state'
  labels: 'every form control has an accessible label'
  errors: 'errors are programmatically associated with fields'
  contrast: 'text and controls meet WCAG AA contrast'
  motion: 'respect prefers-reduced-motion'
```

---

## Non-Negotiable Visual Rules

```yaml
rules:
  - Use design tokens instead of arbitrary visual values.
  - Use semantic colors instead of raw palette colors in components.
  - Use Geist throughout the product UI.
  - Keep the visual hierarchy quiet and deliberate.
  - Use borders and surface contrast before adding shadows.
  - Use accent color to direct attention, not decorate every surface.
  - Keep equivalent actions visually consistent.
  - Keep light and dark themes intentionally designed.
  - Preserve component geometry across interaction states.
  - Do not use decorative gradients, glassmorphism, animated backgrounds, or excessive effects.
  - Do not make every section a floating card.
  - Do not introduce one-off typography, radius, spacing, or button styles.
```
