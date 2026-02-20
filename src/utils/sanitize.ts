/**
 * HTML sanitization utility to prevent XSS attacks.
 * Strips all potentially dangerous HTML tags and attributes while
 * preserving safe formatting elements.
 */

// Tags that are considered safe for rendering blog/article content
const ALLOWED_TAGS = new Set([
  'p', 'br', 'strong', 'em', 'b', 'i', 'u',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'a', 'span', 'div',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'img',
  'blockquote', 'pre', 'code',
]);

// Attributes that are considered safe (per tag or global)
const ALLOWED_ATTRIBUTES: Record<string, Set<string>> = {
  '*': new Set(['class', 'id', 'style']),
  'a': new Set(['href', 'target', 'rel']),
  'img': new Set(['src', 'alt', 'width', 'height']),
};

// Protocols allowed in href/src attributes
const ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);

function isAllowedAttribute(tagName: string, attrName: string): boolean {
  const globalAllowed = ALLOWED_ATTRIBUTES['*'];
  const tagAllowed = ALLOWED_ATTRIBUTES[tagName];
  return (globalAllowed?.has(attrName) || false) || (tagAllowed?.has(attrName) || false);
}

function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url, window.location.origin);
    return ALLOWED_PROTOCOLS.has(parsed.protocol);
  } catch {
    // Relative URLs are allowed
    return !url.trim().toLowerCase().startsWith('javascript:');
  }
}

/**
 * Sanitizes an HTML string by parsing it into a DOM tree and
 * removing disallowed tags/attributes. This prevents XSS by
 * ensuring only safe HTML content is rendered.
 */
export function sanitizeHtml(dirty: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${dirty}</div>`, 'text/html');
  const container = doc.body.firstElementChild;

  if (!container) return '';

  sanitizeNode(container);

  return container.innerHTML;
}

function sanitizeNode(node: Element): void {
  // Process children in reverse so removals don't affect iteration
  const children = Array.from(node.childNodes);

  for (const child of children) {
    if (child.nodeType === Node.TEXT_NODE) {
      // Text nodes are safe
      continue;
    }

    if (child.nodeType === Node.ELEMENT_NODE) {
      const element = child as Element;
      const tagName = element.tagName.toLowerCase();

      // Remove script, style, iframe, object, embed, form, input, etc.
      if (!ALLOWED_TAGS.has(tagName)) {
        // Replace disallowed tags with their text content
        const textNode = document.createTextNode(element.textContent || '');
        node.replaceChild(textNode, element);
        continue;
      }

      // Remove disallowed attributes
      const attrsToRemove: string[] = [];
      for (let i = 0; i < element.attributes.length; i++) {
        const attr = element.attributes[i];
        const attrName = attr.name.toLowerCase();

        // Remove event handlers (onclick, onerror, etc.)
        if (attrName.startsWith('on')) {
          attrsToRemove.push(attr.name);
          continue;
        }

        if (!isAllowedAttribute(tagName, attrName)) {
          attrsToRemove.push(attr.name);
          continue;
        }

        // Validate URLs in href and src
        if ((attrName === 'href' || attrName === 'src') && !isAllowedUrl(attr.value)) {
          attrsToRemove.push(attr.name);
          continue;
        }
      }

      for (const attrName of attrsToRemove) {
        element.removeAttribute(attrName);
      }

      // For anchor tags, enforce rel="noopener noreferrer" on external links
      if (tagName === 'a' && element.getAttribute('target') === '_blank') {
        element.setAttribute('rel', 'noopener noreferrer');
      }

      // Recursively sanitize children
      sanitizeNode(element);
    } else {
      // Remove comments and other node types
      node.removeChild(child);
    }
  }
}
