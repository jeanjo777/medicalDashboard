# 🎯 COMPONENT INTERACTION MATRIX

Quick reference guide for all component interactions.

## 📊 Component States Reference

| Component | Default | Hover | Active | Focus | Disabled | Error |
|-----------|---------|-------|--------|-------|----------|-------|
| **Button Primary** | Blue gradient | Lift 2px + glow | Scale 0.98 | Outline 2px | Opacity 0.5 | N/A |
| **Button Secondary** | Transparent | BG tertiary | Scale 0.98 | Outline 2px | Opacity 0.5 | N/A |
| **Input Field** | Border tertiary | Border primary | N/A | Ring blue 3px | BG disabled | Border red |
| **Table Row** | Transparent | BG blue 5% | N/A | Outline 2px | N/A | N/A |
| **Card** | Static | Lift 4px + border | N/A | Outline 2px | Opacity 0.6 | N/A |
| **Sidebar Item** | Text secondary | BG tertiary | N/A | Outline 2px | N/A | N/A |
| **Sidebar Active** | Gradient blue | Enhanced glow | N/A | Outline 2px | N/A | N/A |

## 🎬 Animation Durations

| Animation Type | Duration | Easing |
|---------------|----------|--------|
| Micro-interaction | 150ms | cubic-bezier(0.4, 0, 0.6, 1) |
| Standard transition | 200ms | cubic-bezier(0.4, 0, 0.2, 1) |
| Entrance/Exit | 300ms | cubic-bezier(0.0, 0, 0.2, 1) |
| Complex animation | 500ms | cubic-bezier(0.4, 0, 0.2, 1) |
| Spinner | 800ms | linear infinite |
| Shimmer | 1500ms | ease-in-out infinite |

## 📱 Responsive Breakpoints

| Device | Breakpoint | Layout Changes |
|--------|-----------|----------------|
| Mobile Small | 0-639px | Single column, hamburger menu |
| Mobile Large | 640-767px | Single column, larger targets |
| Tablet Portrait | 768-1023px | 2 columns, collapsible sidebar |
| Desktop Small | 1024-1279px | 3-4 columns, full sidebar |
| Desktop | 1280-1535px | 4 columns, full features |
| Desktop Large | 1536px+ | 4+ columns, spacious layout |

## ♿ Accessibility Minimum Requirements

| Element | Requirement |
|---------|-------------|
| **Color Contrast** | 4.5:1 minimum (WCAG AA) |
| **Touch Targets** | 44x44px minimum (mobile) |
| **Focus Indicators** | 2px outline, visible on all |
| **Keyboard Navigation** | Tab order logical, ESC closes |
| **Screen Reader** | ARIA labels on all interactive |
| **Form Errors** | aria-invalid + aria-describedby |
| **Loading States** | aria-busy + role="status" |

## 🎨 Color Usage Guide

### Backgrounds
- Primary: `#0f172a` - Main background
- Secondary: `#1e293b` - Cards, sidebar
- Tertiary: `#334155` - Hover states

### Text
- Primary: `#ffffff` - Headings, important
- Secondary: `#cbd5e1` - Body text
- Tertiary: `#94a3b8` - Secondary info
- Muted: `#64748b` - Placeholder, disabled

### Status
- Success: `#10b981` - Green
- Error: `#ef4444` - Red
- Warning: `#f59e0b` - Orange
- Info: `#3b82f6` - Blue

### Actions
- Primary: `#3b82f6` - Buttons, links
- Primary Hover: `#2563eb`
- Primary Active: `#1d4ed8`

Build Status: ✅ Success (8.99s)
