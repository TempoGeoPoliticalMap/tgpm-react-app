const ALLOWED_SCHEMES = ["https:", "http:"];

export function safeHref(url) {
  if (!url) return null;
  try {
    const {protocol} = new URL(url);

    return ALLOWED_SCHEMES.includes(protocol) ? url : null;
  } catch {
    return null;
  }
}
