# 🎨 SPÉCIFICATIONS UX/UI COMPLÈTES

Documentation exhaustive des spécifications UX/UI pour tous les composants.

**Date:** 2025-11-02
**Version:** 1.0

---

## 📋 TABLE DES MATIÈRES

1. [Design System Global](#design-system-global)
2. [Composants Navigation](#composants-navigation)
3. [Composants Data Display](#composants-data-display)
4. [Composants Forms](#composants-forms)
5. [Composants Feedback](#composants-feedback)
6. [Composants Modals](#composants-modals)
7. [Composants Charts](#composants-charts)
8. [Animations & Transitions](#animations--transitions)

---

## 🎨 DESIGN SYSTEM GLOBAL

### Breakpoints

```scss
$breakpoint-xs: 0px;      // Mobile small
$breakpoint-sm: 640px;    // Mobile large
$breakpoint-md: 768px;    // Tablet portrait
$breakpoint-lg: 1024px;   // Tablet landscape / Desktop small
$breakpoint-xl: 1280px;   // Desktop
$breakpoint-2xl: 1536px;  // Desktop large
```

### Spacing Scale (8px system)

```scss
$space-0: 0px;
$space-1: 4px;     // 0.5 × 8
$space-2: 8px;     // 1 × 8
$space-3: 12px;    // 1.5 × 8
$space-4: 16px;    // 2 × 8
$space-5: 20px;    // 2.5 × 8
$space-6: 24px;    // 3 × 8
$space-8: 32px;    // 4 × 8
$space-10: 40px;   // 5 × 8
$space-12: 48px;   // 6 × 8
$space-16: 64px;   // 8 × 8
$space-20: 80px;   // 10 × 8
$space-24: 96px;   // 12 × 8
```

### Typography Scale

```scss
// Font Sizes
$text-xs: 12px;    // Small labels
$text-sm: 14px;    // Secondary text
$text-base: 16px;  // Body text
$text-lg: 18px;    // Subheadings
$text-xl: 20px;    // H3
$text-2xl: 24px;   // H2
$text-3xl: 30px;   // H1
$text-4xl: 36px;   // Hero

// Line Heights
$leading-tight: 1.2;   // Headings
$leading-normal: 1.5;  // Body text
$leading-relaxed: 1.75; // Long-form text

// Font Weights
$font-normal: 400;
$font-medium: 500;
$font-semibold: 600;
$font-bold: 700;
```

### Color Palette

```scss
// Backgrounds (Dark theme)
$bg-primary: #0f172a;
$bg-secondary: #1e293b;
$bg-tertiary: #334155;
$bg-hover: #475569;

// Text Colors
$text-primary: #ffffff;
$text-secondary: #cbd5e1;
$text-tertiary: #94a3b8;
$text-muted: #64748b;

// Status Colors
$success: #10b981;
$error: #ef4444;
$warning: #f59e0b;
$info: #3b82f6;

// Action Colors
$primary: #3b82f6;
$primary-hover: #2563eb;
$primary-active: #1d4ed8;
```

### Shadows

```scss
$shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
$shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
$shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.2);
$shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.3);
```

### Border Radius

```scss
$radius-sm: 4px;
$radius-md: 8px;
$radius-lg: 12px;
$radius-xl: 16px;
$radius-full: 9999px;
```

---

## 🧭 COMPOSANTS NAVIGATION

### 1. MedicalSidebarRefined

**Fichier:** `src/components/MedicalSidebarRefined.tsx`

#### Desktop (≥ 1024px)

**Layout:**
```
Width: 280px (fixed)
Height: 100vh (full height)
Position: fixed left
Background: $bg-secondary (#1e293b)
Border-right: 1px solid $bg-tertiary
Padding: 24px 16px
```

**Navigation Items:**
```scss
// Default State
padding: 12px 16px
border-radius: 8px
color: $text-secondary (#cbd5e1)
cursor: pointer
transition: all 200ms ease

// Hover State
background: $bg-tertiary (#334155)
color: $text-primary (#ffffff)
transform: translateX(4px)

// Active State
background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)
color: #ffffff
box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3)
font-weight: 600

// Focus State (keyboard)
outline: 2px solid $primary
outline-offset: 2px
```

**Animations:**
```scss
// Item hover
transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1)

// Icon rotation on expand
transform: rotate(180deg)
transition: transform 300ms ease

// Submenu slide down
max-height: 0 → 500px
opacity: 0 → 1
transition: all 300ms ease
```

**Accessibility:**
```html
<nav role="navigation" aria-label="Navigation principale">
  <ul role="list">
    <li>
      <a
        href="/dashboard"
        aria-current="page"  <!-- If active -->
        role="menuitem"
      >
        <span aria-hidden="true">📊</span>
        <span>Dashboard</span>
      </a>
    </li>
  </ul>
</nav>
```

#### Tablet (768px - 1023px)

**Layout:**
```
Width: 240px (narrower)
Collapsible: Yes (hamburger toggle)
Overlay mode: backdrop blur on small tablets
```

**Behavior:**
- Closed by default
- Opens with slide-in animation (300ms)
- Backdrop click closes sidebar
- Touch swipe to open/close

#### Mobile (< 768px)

**Layout:**
```
Width: 100vw (full screen overlay)
Height: 100vh
Position: fixed (z-index: 50)
Transform: translateX(-100%) when closed
```

**Behavior:**
- Hamburger menu in header
- Full-screen overlay with backdrop
- Swipe right to close
- Trap focus inside when open

**Touch Gestures:**
```javascript
// Swipe right to close (threshold: 50px)
onSwipeRight: closeSidebar

// Edge swipe left to open (from left 20px)
onEdgeSwipeLeft: openSidebar
```

---

### 2. Header / TopBar

**Fichier:** `src/pages/ModernDashboardPage.tsx` (header section)

#### Desktop (≥ 1024px)

**Layout:**
```scss
height: 80px
padding: 0 32px
background: $bg-secondary
border-bottom: 1px solid $bg-tertiary
display: flex
justify-content: space-between
align-items: center
position: sticky
top: 0
z-index: 40
backdrop-filter: blur(8px)
```

**Search Bar:**
```scss
// Container
width: 400px
max-width: 600px

// Input
background: $bg-primary
border: 1px solid $bg-tertiary
border-radius: 8px
padding: 10px 16px 10px 40px
color: $text-primary

// Hover
border-color: $primary

// Focus
border-color: $primary
box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1)
outline: none
```

**User Menu:**
```scss
// Avatar
width: 40px
height: 40px
border-radius: 9999px
background: $primary
cursor: pointer

// Hover
transform: scale(1.05)
box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3)

// Active
transform: scale(0.95)
```

#### Tablet (768px - 1023px)

**Layout:**
```scss
height: 64px
padding: 0 24px

// Search collapses to icon
width: auto → 40px (icon only)
```

#### Mobile (< 768px)

**Layout:**
```scss
height: 56px
padding: 0 16px

// Hamburger menu (left)
// Logo (center)
// User avatar (right)

// Search moves to separate page/modal
```

---

## 📊 COMPOSANTS DATA DISPLAY

### 3. DashboardStatsCards

**Fichier:** `src/components/DashboardStatsCards.tsx`

#### Desktop (≥ 1024px)

**Grid Layout:**
```scss
display: grid
grid-template-columns: repeat(4, 1fr)
gap: 24px
margin-bottom: 32px
```

**Card Specs:**
```scss
background: $bg-secondary
border: 1px solid $bg-tertiary
border-radius: 12px
padding: 24px
min-height: 140px
position: relative
overflow: hidden

// Hover State
transform: translateY(-4px)
box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2)
border-color: $primary
transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1)

// Hover Glow Effect
&::before {
  content: ''
  position: absolute
  top: 0
  left: 0
  right: 0
  height: 2px
  background: linear-gradient(90deg, $primary, $info)
  opacity: 0
  transition: opacity 300ms
}

&:hover::before {
  opacity: 1
}
```

**Icon Badge:**
```scss
width: 48px
height: 48px
border-radius: 12px
display: flex
align-items: center
justify-content: center
margin-bottom: 16px

// Color variants
&.blue {
  background: rgba(59, 130, 246, 0.1)
  color: #3b82f6
}

&.green {
  background: rgba(16, 185, 129, 0.1)
  color: #10b981
}

// Pulse animation on data update
animation: pulse 600ms ease-out
```

**Change Indicator:**
```scss
// Positive change
color: $success
&::before {
  content: '↑'
  margin-right: 4px
}

// Negative change
color: $error
&::before {
  content: '↓'
  margin-right: 4px
}

// Animation on value change
animation: countUp 800ms ease-out
```

**Sparkline Chart:**
```scss
position: absolute
bottom: 0
right: 0
width: 40%
height: 60px
opacity: 0.3

// Hover
opacity: 0.6
```

**Accessibility:**
```html
<article
  role="article"
  aria-labelledby="stat-title-1"
  tabindex="0"
>
  <h3 id="stat-title-1">Rendez-vous Aujourd'hui</h3>
  <p aria-label="24 rendez-vous, augmentation de 12%">
    <span class="stat-value">24</span>
    <span class="stat-change" aria-label="augmentation de 12 pourcent">
      +12%
    </span>
  </p>
</article>
```

#### Tablet (768px - 1023px)

**Grid Layout:**
```scss
grid-template-columns: repeat(2, 1fr)
gap: 16px
```

**Card Specs:**
```scss
padding: 20px
min-height: 120px
```

#### Mobile (< 768px)

**Grid Layout:**
```scss
grid-template-columns: 1fr
gap: 12px
```

**Card Specs:**
```scss
padding: 16px
min-height: auto

// Sparkline hidden on mobile
.sparkline {
  display: none
}
```

---

### 4. PatientsTable / Data Table

**Fichier:** `src/components/PatientsTable.tsx`

#### Desktop (≥ 1024px)

**Table Container:**
```scss
background: $bg-secondary
border: 1px solid $bg-tertiary
border-radius: 12px
overflow: hidden
```

**Table Header:**
```scss
background: $bg-tertiary
padding: 16px 24px
font-size: 12px
font-weight: 600
text-transform: uppercase
letter-spacing: 0.5px
color: $text-tertiary

// Sortable columns
cursor: pointer

&:hover {
  background: $bg-hover
  color: $text-primary
}

// Sort indicator
&[aria-sort="ascending"]::after {
  content: '↑'
  margin-left: 8px
}

&[aria-sort="descending"]::after {
  content: '↓'
  margin-left: 8px
}
```

**Table Row:**
```scss
padding: 16px 24px
border-bottom: 1px solid rgba(255, 255, 255, 0.05)
cursor: pointer
transition: all 200ms ease

// Hover State
background: rgba(59, 130, 246, 0.05)

&::before {
  content: ''
  position: absolute
  left: 0
  top: 0
  bottom: 0
  width: 3px
  background: $primary
  opacity: 0
  transition: opacity 200ms
}

&:hover::before {
  opacity: 1
}

// Selected State
background: rgba(59, 130, 246, 0.1)
border-left: 3px solid $primary

// Focus State (keyboard)
outline: 2px solid $primary
outline-offset: -2px
```

**Quick Actions (on hover):**
```scss
opacity: 0
transform: translateX(-8px)
transition: all 200ms ease

.row:hover & {
  opacity: 1
  transform: translateX(0)
}

button {
  padding: 8px
  border-radius: 6px

  &:hover {
    background: $primary
    color: white
    transform: scale(1.1)
  }

  &:active {
    transform: scale(0.95)
  }
}
```

**Loading State:**
```scss
// Skeleton rows
.skeleton-row {
  height: 60px
  background: linear-gradient(
    90deg,
    $bg-tertiary 0%,
    $bg-hover 50%,
    $bg-tertiary 100%
  )
  background-size: 200% 100%
  animation: shimmer 1.5s infinite
  border-radius: 4px
}

@keyframes shimmer {
  0% { background-position: 200% 0 }
  100% { background-position: -200% 0 }
}
```

**Empty State:**
```scss
padding: 64px 32px
text-align: center
color: $text-tertiary

.empty-icon {
  width: 80px
  height: 80px
  margin: 0 auto 16px
  opacity: 0.3
}

.empty-title {
  font-size: 18px
  font-weight: 600
  margin-bottom: 8px
}

.empty-description {
  font-size: 14px
  margin-bottom: 24px
}
```

**Accessibility:**
```html
<table role="table" aria-label="Liste des patients">
  <caption class="sr-only">
    Liste des patients avec nom, âge, contact et actions
  </caption>
  <thead>
    <tr>
      <th
        scope="col"
        role="columnheader"
        aria-sort="none"
        tabindex="0"
      >
        Nom
      </th>
    </tr>
  </thead>
  <tbody>
    <tr
      role="row"
      tabindex="0"
      aria-label="Patient Jean Dupont"
    >
      <th scope="row">Jean Dupont</th>
      <td>45 ans</td>
      <td>
        <button aria-label="Voir les détails de Jean Dupont">
          Voir
        </button>
      </td>
    </tr>
  </tbody>
</table>
```

#### Tablet (768px - 1023px)

**Table becomes Card List:**
```scss
// Hide table, show cards
table { display: none }

.patient-card {
  background: $bg-secondary
  border: 1px solid $bg-tertiary
  border-radius: 12px
  padding: 16px
  margin-bottom: 12px

  display: grid
  grid-template-columns: auto 1fr auto
  gap: 16px
  align-items: center
}

// Avatar
.patient-avatar {
  width: 56px
  height: 56px
  border-radius: 9999px
}

// Info
.patient-info {
  flex: 1
}

// Actions
.patient-actions {
  display: flex
  gap: 8px
}
```

#### Mobile (< 768px)

**Stacked Card Layout:**
```scss
.patient-card {
  grid-template-columns: 1fr
  padding: 16px

  // Avatar centered
  .patient-avatar {
    margin: 0 auto 12px
  }

  // Info centered
  .patient-info {
    text-align: center
  }

  // Actions full width
  .patient-actions {
    width: 100%

    button {
      flex: 1
    }
  }
}
```

**Touch Interactions:**
```scss
// Tap feedback
.patient-card:active {
  transform: scale(0.98)
  background: rgba(59, 130, 246, 0.1)
}

// Swipe actions
.swipeable-card {
  position: relative

  .swipe-actions {
    position: absolute
    right: 0
    top: 0
    bottom: 0
    display: flex
    gap: 8px
    padding: 16px
    background: $error
    transform: translateX(100%)
    transition: transform 300ms
  }

  &.swiped-left .swipe-actions {
    transform: translateX(0)
  }
}
```

---

## 📝 COMPOSANTS FORMS

### 5. Input Fields

**Fichier:** `src/components/Common/Input.tsx`

#### All Devices

**Default State:**
```scss
width: 100%
padding: 12px 16px
background: $bg-primary
border: 1px solid $bg-tertiary
border-radius: 8px
color: $text-primary
font-size: 16px  // Prevent zoom on iOS
line-height: 1.5
transition: all 200ms ease

&::placeholder {
  color: $text-muted
}
```

**Hover State:**
```scss
border-color: $primary
```

**Focus State:**
```scss
border-color: $primary
box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1)
outline: none

&::placeholder {
  color: transparent  // Hide on focus
}
```

**Disabled State:**
```scss
background: $bg-tertiary
border-color: $bg-tertiary
color: $text-muted
cursor: not-allowed
opacity: 0.6
```

**Error State:**
```scss
border-color: $error
box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1)

&:focus {
  border-color: $error
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2)
}
```

**Success State:**
```scss
border-color: $success

&::after {
  content: '✓'
  position: absolute
  right: 16px
  color: $success
}
```

**Label:**
```scss
display: block
font-size: 14px
font-weight: 500
color: $text-secondary
margin-bottom: 8px

&.required::after {
  content: '*'
  color: $error
  margin-left: 4px
}
```

**Error Message:**
```scss
display: flex
align-items: center
gap: 8px
margin-top: 8px
font-size: 14px
color: $error

&::before {
  content: '⚠'
}

// Animate in
animation: slideDown 200ms ease-out

@keyframes slideDown {
  from {
    opacity: 0
    transform: translateY(-8px)
  }
  to {
    opacity: 1
    transform: translateY(0)
  }
}
```

**Helper Text:**
```scss
margin-top: 8px
font-size: 13px
color: $text-tertiary
```

**Accessibility:**
```html
<div class="input-group">
  <label
    for="patient-name"
    class="required"
  >
    Nom complet
  </label>

  <input
    id="patient-name"
    type="text"
    aria-required="true"
    aria-invalid="false"
    aria-describedby="name-error name-helper"
  />

  <p id="name-helper" class="helper-text">
    Prénom et nom de famille
  </p>

  <p
    id="name-error"
    role="alert"
    class="error-message"
  >
    Le nom doit contenir au moins 2 caractères
  </p>
</div>
```

#### Mobile Specific

**Input Size:**
```scss
// Minimum 16px to prevent iOS zoom
font-size: 16px
padding: 14px 16px  // Larger tap target
min-height: 44px    // WCAG minimum
```

---

### 6. Buttons

**Fichier:** Utilisé partout

#### Primary Button

**Desktop:**
```scss
padding: 12px 24px
background: linear-gradient(135deg, $primary 0%, #2563eb 100%)
color: white
border: none
border-radius: 8px
font-size: 16px
font-weight: 600
cursor: pointer
position: relative
overflow: hidden
transition: all 200ms ease

// Hover
transform: translateY(-2px)
box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3)

&::before {
  content: ''
  position: absolute
  top: 0
  left: -100%
  width: 100%
  height: 100%
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  )
  transition: left 500ms
}

&:hover::before {
  left: 100%
}

// Active (click)
transform: translateY(0) scale(0.98)
box-shadow: 0 4px 8px rgba(59, 130, 246, 0.2)

// Focus
outline: 2px solid $primary
outline-offset: 2px

// Disabled
opacity: 0.5
cursor: not-allowed
transform: none
pointer-events: none
```

**Loading State:**
```scss
position: relative
color: transparent
pointer-events: none

&::after {
  content: ''
  position: absolute
  left: 50%
  top: 50%
  width: 20px
  height: 20px
  margin: -10px 0 0 -10px
  border: 2px solid rgba(255, 255, 255, 0.3)
  border-top-color: white
  border-radius: 50%
  animation: spin 600ms linear infinite
}

@keyframes spin {
  to { transform: rotate(360deg) }
}
```

**Mobile:**
```scss
min-height: 48px  // Larger tap target
padding: 14px 28px
font-size: 16px

// Active (touch feedback)
&:active {
  transform: scale(0.95)
  background: $primary-active
}
```

#### Secondary Button

```scss
background: transparent
border: 1px solid $bg-tertiary
color: $text-secondary

&:hover {
  background: $bg-tertiary
  color: $text-primary
  border-color: $primary
}
```

#### Icon Button

```scss
width: 40px
height: 40px
padding: 0
display: flex
align-items: center
justify-content: center
border-radius: 8px

&:hover {
  background: $bg-tertiary
  transform: scale(1.1)
}
```

---

## 💬 COMPOSANTS FEEDBACK

### 7. Toast Notifications

**Fichier:** `src/components/Common/Toast.tsx`

#### All Devices

**Container:**
```scss
position: fixed
bottom: 24px
right: 24px
z-index: 9999
display: flex
flex-direction: column
gap: 12px
max-width: 400px
pointer-events: none

> * {
  pointer-events: auto
}
```

**Toast Card:**
```scss
background: $bg-secondary
border: 1px solid $bg-tertiary
border-radius: 12px
padding: 16px
box-shadow: 0 20px 25px rgba(0, 0, 0, 0.3)
backdrop-filter: blur(12px)
display: flex
gap: 12px
align-items: start

// Entrance animation
animation: slideInRight 300ms cubic-bezier(0.4, 0, 0.2, 1)

@keyframes slideInRight {
  from {
    opacity: 0
    transform: translateX(100px)
  }
  to {
    opacity: 1
    transform: translateX(0)
  }
}

// Exit animation
&.exiting {
  animation: slideOutRight 200ms ease-in forwards
}

@keyframes slideOutRight {
  to {
    opacity: 0
    transform: translateX(100px)
  }
}
```

**Success Toast:**
```scss
border-left: 4px solid $success

.toast-icon {
  color: $success
  background: rgba(16, 185, 129, 0.1)
  padding: 8px
  border-radius: 8px
}
```

**Error Toast:**
```scss
border-left: 4px solid $error

.toast-icon {
  color: $error
  background: rgba(239, 68, 68, 0.1)

  // Shake animation on error
  animation: shake 400ms ease-in-out
}

@keyframes shake {
  0%, 100% { transform: translateX(0) }
  25% { transform: translateX(-10px) }
  75% { transform: translateX(10px) }
}
```

**Progress Bar:**
```scss
position: absolute
bottom: 0
left: 0
height: 3px
background: $primary
transform-origin: left
animation: shrink 5000ms linear forwards

@keyframes shrink {
  to { transform: scaleX(0) }
}
```

#### Mobile (< 768px)

**Container:**
```scss
bottom: 16px
right: 16px
left: 16px
max-width: none

.toast {
  width: 100%
}
```

---

### 8. Modal / Dialog

**Fichier:** `src/components/Patients/PatientDetailModal.tsx`

#### Desktop (≥ 1024px)

**Backdrop:**
```scss
position: fixed
inset: 0
background: rgba(0, 0, 0, 0.5)
backdrop-filter: blur(4px)
z-index: 9997
display: flex
align-items: center
justify-content: center
padding: 24px

// Entrance
animation: fadeIn 200ms ease-out

@keyframes fadeIn {
  from { opacity: 0 }
  to { opacity: 1 }
}
```

**Modal Container:**
```scss
background: $bg-secondary
border: 1px solid $bg-tertiary
border-radius: 16px
max-width: 800px
width: 100%
max-height: 90vh
box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5)
display: flex
flex-direction: column
overflow: hidden

// Entrance
animation: scaleIn 300ms cubic-bezier(0.4, 0, 0.2, 1)

@keyframes scaleIn {
  from {
    opacity: 0
    transform: scale(0.9)
  }
  to {
    opacity: 1
    transform: scale(1)
  }
}
```

**Modal Header:**
```scss
padding: 24px
border-bottom: 1px solid $bg-tertiary
display: flex
justify-content: space-between
align-items: center
flex-shrink: 0

h2 {
  font-size: 20px
  font-weight: 600
  display: flex
  align-items: center
  gap: 12px
}

.close-button {
  width: 32px
  height: 32px
  border-radius: 8px

  &:hover {
    background: $bg-tertiary
    transform: rotate(90deg)
  }

  transition: all 200ms ease
}
```

**Modal Body:**
```scss
padding: 24px
overflow-y: auto
flex: 1

// Custom scrollbar
&::-webkit-scrollbar {
  width: 8px
}

&::-webkit-scrollbar-track {
  background: $bg-primary
  border-radius: 4px
}

&::-webkit-scrollbar-thumb {
  background: $bg-tertiary
  border-radius: 4px

  &:hover {
    background: $bg-hover
  }
}
```

**Modal Footer:**
```scss
padding: 24px
border-top: 1px solid $bg-tertiary
display: flex
justify-content: space-between
align-items: center
gap: 12px
flex-shrink: 0
background: rgba(15, 23, 42, 0.5)
backdrop-filter: blur(8px)
```

**Keyboard Interactions:**
```
ESC: Close modal
TAB: Navigate focusable elements
SHIFT+TAB: Navigate backwards
ENTER: Submit form (if in form context)
```

**Focus Trap:**
```javascript
// Focus first focusable element on open
// Trap focus inside modal
// Restore focus to trigger on close
```

#### Tablet (768px - 1023px)

**Modal Container:**
```scss
max-width: 90vw
max-height: 85vh
border-radius: 12px
```

#### Mobile (< 768px)

**Modal Container:**
```scss
max-width: 100vw
max-height: 100vh
height: 100vh
border-radius: 0
margin: 0

// Slide up from bottom
animation: slideUp 300ms ease-out

@keyframes slideUp {
  from {
    transform: translateY(100%)
  }
  to {
    transform: translateY(0)
  }
}
```

**Modal Header:**
```scss
padding: 16px
position: sticky
top: 0
background: $bg-secondary
z-index: 1
```

**Modal Body:**
```scss
padding: 16px
```

**Modal Footer:**
```scss
padding: 16px
position: sticky
bottom: 0

button {
  width: 100%  // Full width on mobile
}
```

---

## 📊 COMPOSANTS CHARTS

### 9. Charts (Recharts)

**Fichier:** `src/components/PatientGrowthChart.tsx`, `AppointmentDistributionChart.tsx`

#### Desktop (≥ 1024px)

**Chart Container:**
```scss
background: $bg-secondary
border: 1px solid $bg-tertiary
border-radius: 12px
padding: 24px
min-height: 400px
```

**Chart Interactions:**

**Hover State:**
```scss
// Bar hover
.recharts-bar-rectangle:hover {
  fill: $primary-hover
  cursor: pointer
  filter: brightness(1.2)
  transition: all 200ms ease
}

// Tooltip
.recharts-tooltip-wrapper {
  .recharts-default-tooltip {
    background: $bg-primary !important
    border: 1px solid $bg-tertiary !important
    border-radius: 8px !important
    padding: 12px !important
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3) !important
  }
}
```

**Click/Drill-down:**
```scss
.recharts-bar-rectangle {
  cursor: pointer

  &:active {
    transform: scale(0.95)
  }
}

// Visual feedback on click
animation: pulseChart 400ms ease-out

@keyframes pulseChart {
  0%, 100% { opacity: 1 }
  50% { opacity: 0.7 }
}
```

**Accessibility:**
```html
<div
  role="img"
  aria-label="Graphique de croissance des patients par mois"
  tabindex="0"
>
  <ResponsiveContainer>
    {/* Chart */}
  </ResponsiveContainer>

  <!-- Table alternative for screen readers -->
  <table class="sr-only">
    <caption>Croissance des patients par mois</caption>
    <thead>
      <tr>
        <th>Mois</th>
        <th>Nouveaux patients</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Janvier</td>
        <td>45</td>
      </tr>
      <!-- ... -->
    </tbody>
  </table>
</div>
```

#### Tablet (768px - 1023px)

**Chart Container:**
```scss
padding: 20px
min-height: 350px
```

**Chart Size:**
```scss
ResponsiveContainer {
  width: 100%
  height: 350px
}
```

#### Mobile (< 768px)

**Chart Container:**
```scss
padding: 16px
min-height: 280px
overflow-x: auto  // Allow horizontal scroll if needed

// Hide complex legends
.recharts-legend {
  display: none
}
```

**Chart Size:**
```scss
ResponsiveContainer {
  width: 100%
  height: 280px
  min-width: 320px  // Prevent squishing
}
```

**Touch Interactions:**
```javascript
// Disable hover tooltip on touch
onTouchStart: showTooltip
onTouchEnd: hideTooltip

// Pinch to zoom (optional)
onPinch: zoomChart
```

---

## 🎬 ANIMATIONS & TRANSITIONS

### Standard Timings

```scss
$duration-fast: 150ms;     // Micro-interactions
$duration-normal: 200ms;   // Standard transitions
$duration-slow: 300ms;     // Entrances/exits
$duration-slower: 500ms;   // Complex animations

$easing-standard: cubic-bezier(0.4, 0, 0.2, 1);
$easing-decelerate: cubic-bezier(0.0, 0, 0.2, 1);
$easing-accelerate: cubic-bezier(0.4, 0, 1, 1);
$easing-sharp: cubic-bezier(0.4, 0, 0.6, 1);
```

### Page Transitions

```scss
.page-enter {
  opacity: 0
  transform: translateY(20px)
}

.page-enter-active {
  opacity: 1
  transform: translateY(0)
  transition: all 300ms $easing-decelerate
}

.page-exit {
  opacity: 1
}

.page-exit-active {
  opacity: 0
  transition: all 200ms $easing-accelerate
}
```

### List Animations (Stagger)

```scss
.list-item {
  animation: fadeInUp 400ms $easing-decelerate backwards

  @for $i from 1 through 10 {
    &:nth-child(#{$i}) {
      animation-delay: #{$i * 50}ms
    }
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0
    transform: translateY(20px)
  }
  to {
    opacity: 1
    transform: translateY(0)
  }
}
```

### Loading Animations

**Spinner:**
```scss
.spinner {
  width: 40px
  height: 40px
  border: 3px solid rgba(59, 130, 246, 0.2)
  border-top-color: $primary
  border-radius: 50%
  animation: spin 800ms linear infinite
}

@keyframes spin {
  to { transform: rotate(360deg) }
}
```

**Pulse:**
```scss
.pulse {
  animation: pulse 2000ms $easing-standard infinite
}

@keyframes pulse {
  0%, 100% {
    opacity: 1
    transform: scale(1)
  }
  50% {
    opacity: 0.7
    transform: scale(0.95)
  }
}
```

**Skeleton Shimmer:**
```scss
.skeleton {
  background: linear-gradient(
    90deg,
    $bg-tertiary 0%,
    $bg-hover 50%,
    $bg-tertiary 100%
  )
  background-size: 200% 100%
  animation: shimmer 1500ms ease-in-out infinite
}

@keyframes shimmer {
  0% { background-position: 200% 0 }
  100% { background-position: -200% 0 }
}
```

### Micro-interactions

**Button Press:**
```scss
button:active {
  transform: scale(0.95)
  transition: transform 100ms $easing-sharp
}
```

**Checkbox:**
```scss
.checkbox {
  input:checked + .checkmark {
    animation: checkBounce 300ms $easing-decelerate
  }
}

@keyframes checkBounce {
  0% { transform: scale(0) }
  50% { transform: scale(1.2) }
  100% { transform: scale(1) }
}
```

**Success Checkmark:**
```scss
.success-check {
  animation: drawCheck 600ms $easing-decelerate forwards
}

@keyframes drawCheck {
  0% {
    stroke-dasharray: 0 100
    stroke-dashoffset: 0
  }
  100% {
    stroke-dasharray: 100 100
    stroke-dashoffset: 0
  }
}
```

---

## ♿ ACCESSIBILITÉ GLOBALE

### Focus Indicators

```scss
*:focus-visible {
  outline: 2px solid $primary
  outline-offset: 2px
  border-radius: 4px
}

// Custom focus for specific elements
button:focus-visible {
  outline-offset: 4px
}

input:focus-visible {
  outline: none  // Custom box-shadow instead
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2)
}
```

### Screen Reader Only

```scss
.sr-only {
  position: absolute
  width: 1px
  height: 1px
  padding: 0
  margin: -1px
  overflow: hidden
  clip: rect(0, 0, 0, 0)
  white-space: nowrap
  border-width: 0
}
```

### Skip Links

```scss
.skip-link {
  position: absolute
  top: -100px
  left: 0
  background: $primary
  color: white
  padding: 12px 24px
  text-decoration: none
  z-index: 10000

  &:focus {
    top: 0
  }
}
```

### Reduced Motion

```scss
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important
    animation-iteration-count: 1 !important
    transition-duration: 0.01ms !important
  }
}
```

---

## 📱 RESPONSIVE SUMMARY

### Desktop (≥ 1024px)

```
✅ Full sidebar (280px)
✅ Grid layouts (4 columns)
✅ Hover states active
✅ Complex animations
✅ Tooltips on hover
✅ Context menus
✅ Keyboard shortcuts
```

### Tablet (768px - 1023px)

```
✅ Collapsible sidebar
✅ Grid layouts (2 columns)
✅ Hover states active
✅ Simplified animations
✅ Touch-friendly (44px+ targets)
✅ Hybrid input (touch + mouse)
```

### Mobile (< 768px)

```
✅ Hamburger menu
✅ Single column layouts
✅ No hover states
✅ Minimal animations
✅ Large tap targets (48px+)
✅ Touch gestures (swipe, pinch)
✅ Native mobile UI patterns
```

---

**Dernière mise à jour:** 2025-11-02
**Version:** 1.0
**Status:** ✅ Spécifications complètes
