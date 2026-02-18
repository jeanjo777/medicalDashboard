/**
 * Accessibility Utilities
 *
 * Utilities for checking WCAG 2.1 AA compliance and improving accessibility
 */

export const getContrastRatio = (foreground: string, background: string): number => {
  const getLuminance = (hex: string): number => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;

    const [rs, gs, bs] = [r, g, b].map(c => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);

  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);

  return (brightest + 0.05) / (darkest + 0.05);
};

export const meetsWCAGAA = (
  foreground: string,
  background: string,
  largeText: boolean = false
): boolean => {
  const ratio = getContrastRatio(foreground, background);
  return largeText ? ratio >= 3 : ratio >= 4.5;
};

export const meetsWCAGAAA = (
  foreground: string,
  background: string,
  largeText: boolean = false
): boolean => {
  const ratio = getContrastRatio(foreground, background);
  return largeText ? ratio >= 4.5 : ratio >= 7;
};

export const WCAG_COLORS = {
  background: {
    primary: '#0f172a',
    secondary: '#1e293b',
    tertiary: '#334155',
  },
  text: {
    primary: '#ffffff',
    secondary: '#cbd5e1',
    tertiary: '#94a3b8',
    muted: '#64748b',
  },
  status: {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
  },
};

export const validateColorPalette = (): {
  color: string;
  background: string;
  ratio: number;
  meetsAA: boolean;
  meetsAAA: boolean;
}[] => {
  const results: any[] = [];

  Object.entries(WCAG_COLORS.text).forEach(([textKey, textColor]) => {
    Object.entries(WCAG_COLORS.background).forEach(([bgKey, bgColor]) => {
      const ratio = getContrastRatio(textColor, bgColor);
      results.push({
        color: `${textKey} on ${bgKey}`,
        foreground: textColor,
        background: bgColor,
        ratio: Math.round(ratio * 100) / 100,
        meetsAA: meetsWCAGAA(textColor, bgColor),
        meetsAAA: meetsWCAGAAA(textColor, bgColor),
      });
    });
  });

  return results;
};

export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const liveRegion = document.createElement('div');
  liveRegion.setAttribute('role', 'status');
  liveRegion.setAttribute('aria-live', priority);
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.className = 'sr-only';
  liveRegion.textContent = message;

  document.body.appendChild(liveRegion);

  setTimeout(() => {
    document.body.removeChild(liveRegion);
  }, 1000);
};

export const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  const selectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ];

  return Array.from(container.querySelectorAll(selectors.join(',')));
};

export const trapFocus = (container: HTMLElement, event: KeyboardEvent) => {
  if (event.key !== 'Tab') return;

  const focusableElements = getFocusableElements(container);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
};

export const generateAriaLabel = (action: string, target: string, context?: string): string => {
  let label = `${action} ${target}`;
  if (context) {
    label += ` - ${context}`;
  }
  return label;
};
