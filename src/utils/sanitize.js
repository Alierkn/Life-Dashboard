import DOMPurify from 'dompurify';

/**
 * Sanitizes user input to prevent XSS attacks
 * Uses DOMPurify to strip all HTML tags and potentially malicious content
 * @param {string} dirty - Potentially unsafe string
 * @returns {string} - Safe plain text string
 */
export function sanitize(dirty) {
  if (!dirty || typeof dirty !== 'string') return '';

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [], // Strip all HTML tags - return plain text only
    ALLOWED_ATTR: [], // Strip all attributes
    KEEP_CONTENT: true // Keep text content
  });
}

/**
 * Sanitizes user input but allows basic text formatting tags
 * @param {string} dirty - Potentially unsafe string
 * @returns {string} - Safe HTML string with basic formatting
 */
export function sanitizeWithFormatting(dirty) {
  if (!dirty || typeof dirty !== 'string') return '';

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p'],
    ALLOWED_ATTR: []
  });
}
