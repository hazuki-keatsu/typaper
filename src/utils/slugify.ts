import kebabcase from "lodash.kebabcase";
import slugify from "slugify";

/**
 * Check if string contains non-Latin characters
 */
const hasNonLatin = (str: string): boolean => /[^\x00-\x7F]/.test(str);

/**
 * Slugify a string using a hybrid approach:
 * - For Latin-only strings: use slugify (eg: "E2E Testing" -> "e2e-testing", "TypeScript 5.0" -> "typescript-5.0")
 * - For strings with non-Latin characters: use lodash.kebabcase (preserves non-Latin chars)
 */
export const slugifyStr = (str: string): string => {
  if (hasNonLatin(str)) {
    // Preserve non-Latin characters (e.g., Burmese, Chinese, etc.)
    return kebabcase(str);
  }
  // Handle Latin strings with better number/acronym handling
  return slugify(str, { lower: true });
};

export const slugifyAll = (arr: string[]) => arr.map(str => slugifyStr(str));

/**
 * Produce a valid CSS <custom-ident> for view-transition-name.
 * CSS idents only allow [a-zA-Z0-9_-] plus Unicode U+00A0+.
 * Non-ASCII chars are hex-encoded, ASCII special chars (:, /, etc.)
 * are replaced with hyphens to keep the browser from ignoring the name.
 */
export const toTransitionName = (str: string): string => {
  const base = slugifyStr(str.replaceAll(".", "-"));
  let result = base
    // encode non-ASCII chars (Chinese, Japanese, etc.)
    .replace(/[^\x00-\x7F]/g, c =>
      "u" + c.charCodeAt(0).toString(16).padStart(4, "0")
    )
    // replace any remaining invalid chars (colons, slashes, etc.)
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    // collapse consecutive hyphens and trim
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  // CSS ident must not start with a digit
  if (/^\d/.test(result)) result = "p-" + result;
  // CSS ident must not have a hyphen followed immediately by a digit
  if (/^-\d/.test(result)) result = "p" + result;
  if (!result) result = "post";
  return result;
};
