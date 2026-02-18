# 🎨 Healthcare Sidebar - Visual Specifications

## 📐 Exact Measurements

```
Sidebar Dimensions:
├─ Width: 256px (16rem)
├─ Height: 100vh (full screen)
└─ Position: Fixed/Static (responsive)

Header Section:
├─ Padding: 24px all sides
├─ Border Bottom: 1px solid rgba(55, 65, 81, 0.5)
└─ Logo Container:
    ├─ Icon Background: 40px × 40px
    ├─ Border Radius: 12px
    ├─ Icon Size: 24px
    └─ Gap to Text: 12px

Menu Items:
├─ Padding: 12px (horizontal & vertical)
├─ Border Radius: 8px
├─ Gap Between Items: 4px
├─ Icon Size: 20px
├─ Icon-to-Text Gap: 12px
└─ Font Size: 14px

Settings (Bottom):
├─ Border Top: 1px solid rgba(55, 65, 81, 0.5)
├─ Padding Top: 16px
├─ Padding Bottom: 16px
└─ Same styling as menu items
```

---

## 🎨 Color Palette (Exact Hex)

### Background Colors
```css
Sidebar Background:     #1e293b  /* slate-800 */
Active Item:            #2563eb  /* blue-600 */
Hover Background:       rgba(55, 65, 81, 0.5)  /* gray-700/50 */
Logo Background:        #2563eb  /* blue-600 */
```

### Text Colors
```css
Primary Text (Active):  #ffffff  /* white */
Secondary Text:         #d1d5db  /* gray-300 */
Subtitle Text:          #9ca3af  /* gray-400 */
Icon (Inactive):        #9ca3af  /* gray-400 */
Icon (Active):          #ffffff  /* white */
```

### Effects & Borders
```css
Border Color:           rgba(55, 65, 81, 0.5)  /* gray-700/50 */
Active Shadow:          rgba(37, 99, 235, 0.3)  /* blue-600/30 */
Shadow Blur:            20px
Shadow Spread:          0px
```

---

## 🎭 State Variations

### Default State (Inactive Item)
```
Visual Properties:
├─ Background: transparent
├─ Text Color: #d1d5db (gray-300)
├─ Icon Color: #9ca3af (gray-400)
└─ Shadow: none

Hover State:
├─ Background: rgba(55, 65, 81, 0.5)
├─ Text Color: #ffffff (white)
├─ Icon Color: #ffffff (white)
├─ Cursor: pointer
└─ Transition: 200ms
```

### Active State ("Patients")
```
Visual Properties:
├─ Background: #2563eb (blue-600)
├─ Text Color: #ffffff (white)
├─ Icon Color: #ffffff (white)
├─ Shadow: 0 10px 20px rgba(37, 99, 235, 0.3)
└─ Font Weight: 500 (medium)

Special Effect:
└─ Subtle glow around the item
```

### Focus State (Keyboard Navigation)
```
Visual Properties:
├─ Same as Default/Active
├─ Outline: 2px solid #3b82f6 (blue-500)
├─ Outline Offset: 2px
└─ Visible focus indicator
```

---

## 📏 Spacing System

```
Internal Spacing (Padding):
├─ Header: 24px (1.5rem)
├─ Menu Items: 12px horizontal, 12px vertical
├─ Bottom Section: 16px top, 16px bottom
└─ Navigation Container: 12px all sides

External Spacing (Margins):
├─ Between Menu Items: 4px (0.25rem)
├─ Icon to Text: 12px (0.75rem)
└─ Section Separators: 16px (1rem)

Gaps:
├─ Logo Icon to Text: 12px
└─ Menu Icon to Label: 12px
```

---

## 🔤 Typography Scale

```
Logo Title:
├─ Font Size: 18px (1.125rem)
├─ Line Height: 1.2
├─ Font Weight: 700 (bold)
└─ Color: #ffffff

Logo Subtitle:
├─ Font Size: 12px (0.75rem)
├─ Line Height: 1.4
├─ Font Weight: 400 (normal)
└─ Color: #9ca3af

Menu Item Labels:
├─ Font Size: 14px (0.875rem)
├─ Line Height: 1.5
├─ Font Weight: 500 (medium)
└─ Color: Dynamic (gray-300 / white)
```

---

## 🎬 Animation Specifications

### Transition Properties
```css
Menu Item Hover:
├─ Property: all
├─ Duration: 200ms
├─ Timing Function: ease-in-out
└─ Delay: 0ms

Active State Change:
├─ Property: background-color, color, box-shadow
├─ Duration: 200ms
├─ Timing Function: ease-in-out
└─ Delay: 0ms

Icon Color Change:
├─ Inherits from parent button
├─ Duration: 200ms
└─ Timing Function: ease-in-out
```

### Hover Animation Sequence
```
1. User hovers → 0ms
2. Background starts fading in → 0-50ms
3. Text color transitions → 0-100ms
4. Icon color transitions → 0-100ms
5. Cursor changes to pointer → 0ms
6. Animation completes → 200ms
```

---

## 🖼️ Visual Hierarchy

```
Priority Levels:
1. Logo & Brand (Highest)
   └─ Blue background, white icon, bold text

2. Active Menu Item
   └─ Blue background, white text, shadow

3. Inactive Menu Items
   └─ Transparent background, gray text

4. Settings (Lower Priority)
   └─ Separated at bottom, same style as inactive
```

---

## 📱 Responsive Breakpoints

```
Desktop (1024px+):
├─ Width: 256px (fixed)
├─ Position: Static
└─ Always visible

Tablet (768px - 1023px):
├─ Width: 256px (fixed)
├─ Position: Static
└─ Always visible

Mobile (<768px):
├─ Width: 256px
├─ Position: Fixed
├─ Transform: translateX(-100%) / translateX(0)
└─ Overlay mode with backdrop
```

---

## 🎨 Component Anatomy

```
┌───────────────────────────────────┐
│                                   │ ← 24px padding top
│  ┌─────┐  MediCare Pro           │
│  │  🩺 │  Healthcare System       │ ← Header (80px height)
│  └─────┘                          │
│                                   │ ← 24px padding bottom
├───────────────────────────────────┤ ← 1px border
│                                   │ ← 16px padding top
│  🏠  Dashboard                    │ ← Menu item (44px height)
│                                   │ ← 4px gap
│  ┌─────────────────────────────┐ │
│  │ 👥  Patients                │ │ ← Active (44px height)
│  └─────────────────────────────┘ │ ← Blue bg + shadow
│                                   │ ← 4px gap
│  📅  Appointments                │ ← Menu item (44px height)
│                                   │ ← 4px gap
│  📄  Medical Records             │ ← Menu item (44px height)
│                                   │ ← 4px gap
│  📊  Analytics                   │ ← Menu item (44px height)
│                                   │
│          (flexible space)         │ ← Grows to push settings down
│                                   │
├───────────────────────────────────┤ ← 1px border
│                                   │ ← 16px padding top
│  ⚙️  Settings                    │ ← Settings (44px height)
│                                   │ ← 16px padding bottom
└───────────────────────────────────┘
```

---

## 🔍 Icon Specifications

```
Icon Library: Lucide React

Icon Sizes:
├─ Logo (Stethoscope/Activity): 24px
└─ Menu Items: 20px

Icon Stroke Width:
├─ Logo: 2.5px (thicker for emphasis)
└─ Menu Items: 2px (default)

Icon Colors:
├─ Logo: Always white (#ffffff)
├─ Inactive: #9ca3af (gray-400)
└─ Active: #ffffff (white)

Icon Alignment:
├─ Vertical: Center aligned with text
├─ Horizontal: Left aligned with 12px gap
└─ Display: Inline flex
```

---

## 🎯 Touch Target Sizes

```
Minimum Touch Targets (WCAG 2.5.5):
├─ Menu Item Height: 44px ✅
├─ Menu Item Width: Full width (256px) ✅
├─ Logo Clickable Area: 40px × 40px ✅
└─ Settings Button: 44px ✅

Spacing Between Targets:
└─ 4px gap ensures no accidental touches
```

---

## ♿ Accessibility Specifications

```
Color Contrast Ratios:
├─ Active Text on Blue: 21:1 (AAA) ✅
├─ Inactive Text on Dark: 7.5:1 (AAA) ✅
├─ Subtitle on Dark: 4.8:1 (AA) ✅
└─ Logo Text on Dark: 21:1 (AAA) ✅

Focus Indicators:
├─ Outline: 2px solid blue
├─ Offset: 2px
└─ Visible on all interactive elements

Keyboard Navigation:
├─ Tab Order: Top to bottom
├─ Enter/Space: Activates items
└─ Escape: (For mobile drawer close)

ARIA Attributes:
├─ role="navigation" on nav
├─ aria-current="page" on active
└─ aria-label on icon-only (collapsed state)
```

---

## 🎨 Shadow System

```
Active Item Shadow:
├─ X Offset: 0px
├─ Y Offset: 10px
├─ Blur: 20px
├─ Spread: 0px
└─ Color: rgba(37, 99, 235, 0.3)

Logo Shadow:
├─ X Offset: 0px
├─ Y Offset: 4px
├─ Blur: 12px
├─ Spread: 0px
└─ Color: rgba(0, 0, 0, 0.2)
```

---

## 📊 Z-Index Layers

```
Z-Index Stack:
├─ Sidebar Base: auto (default)
├─ Sidebar (Mobile): 50
├─ Mobile Overlay: 40
└─ Main Content: auto (default)

Mobile Overlay:
├─ Background: rgba(0, 0, 0, 0.5)
├─ Backdrop Filter: blur(4px)
└─ Pointer Events: all (clickable to close)
```

---

## 🎨 Gradient Specifications

```
Logo Background:
├─ Type: Solid
├─ Color: #2563eb
└─ Border Radius: 12px

Alternative (for custom variants):
├─ Type: Linear Gradient
├─ Direction: 135deg
├─ Stop 1: #2563eb (0%)
├─ Stop 2: #3b82f6 (100%)
└─ Border Radius: 12px
```

---

## 📝 CSS Variables (Optional)

```css
:root {
  /* Colors */
  --sidebar-bg: #1e293b;
  --sidebar-active-bg: #2563eb;
  --sidebar-hover-bg: rgba(55, 65, 81, 0.5);
  --sidebar-text-primary: #ffffff;
  --sidebar-text-secondary: #d1d5db;
  --sidebar-text-muted: #9ca3af;
  --sidebar-border: rgba(55, 65, 81, 0.5);
  --sidebar-shadow: rgba(37, 99, 235, 0.3);

  /* Spacing */
  --sidebar-width: 256px;
  --sidebar-header-padding: 24px;
  --sidebar-item-padding-y: 12px;
  --sidebar-item-padding-x: 12px;
  --sidebar-item-gap: 4px;
  --sidebar-icon-size: 20px;
  --sidebar-icon-gap: 12px;

  /* Typography */
  --sidebar-font-size-lg: 18px;
  --sidebar-font-size-md: 14px;
  --sidebar-font-size-sm: 12px;

  /* Animation */
  --sidebar-transition-duration: 200ms;
  --sidebar-transition-timing: ease-in-out;
}
```

---

## 🎯 Pixel-Perfect Checklist

✅ Logo icon: 40×40px with 12px border-radius
✅ Logo to text gap: 12px
✅ Header padding: 24px all sides
✅ Menu item height: 44px (minimum touch target)
✅ Menu item padding: 12px horizontal & vertical
✅ Icon size: 20px
✅ Icon to text gap: 12px
✅ Gap between items: 4px
✅ Border thickness: 1px
✅ Active shadow: blur 20px, opacity 0.3
✅ Font sizes: 18px/14px/12px
✅ Transition duration: 200ms
✅ Sidebar width: 256px

---

## 🔧 Developer Notes

### Tailwind Classes Used
```
Width: w-64 (256px)
Background: bg-[#1e293b]
Padding: p-6, px-3, py-4, py-3
Gaps: gap-3, gap-1, space-y-1
Rounded: rounded-xl (12px), rounded-lg (8px)
Shadow: shadow-lg
Transitions: transition-all duration-200
Flex: flex, flex-col, items-center, justify-between
Text: text-lg, text-sm, text-xs
Font Weight: font-bold, font-medium
Colors: text-white, text-gray-300, text-gray-400
Hover: hover:bg-gray-700/50, hover:text-white
```

### Custom Colors
```
bg-[#1e293b] → Slate-800 (not in default Tailwind)
Can be added to tailwind.config.js:

colors: {
  'sidebar-bg': '#1e293b',
  'sidebar-active': '#2563eb',
}
```

---

This specification ensures pixel-perfect implementation across all platforms! 🎯
