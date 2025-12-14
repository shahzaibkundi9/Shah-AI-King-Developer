export function formatDate(t: string) {
  try {
    return new Date(t).toLocaleString();
  } catch {
    return t;
  }
}
