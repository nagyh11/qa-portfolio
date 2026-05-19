const HTML_TAG_RE = /<[^>]*>/g;
const SCRIPT_RE = /javascript\s*:/gi;
const NULL_BYTE_RE = /\0/g;

export function sanitize(input: string): string {
  return input
    .replace(NULL_BYTE_RE, "")
    .replace(HTML_TAG_RE, "")
    .replace(SCRIPT_RE, "")
    .trim()
    .slice(0, 5000);
}

export function sanitizeEmail(email: string): string {
  return email
    .replace(NULL_BYTE_RE, "")
    .replace(HTML_TAG_RE, "")
    .trim()
    .toLowerCase()
    .slice(0, 320);
}
