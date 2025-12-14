// src/utils/retry.ts
// Roman Urdu: retry helper with exponential backoff + jitter
export async function retry<T>(fn: () => Promise<T>, retries = 2, base = 500): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      if (attempt > retries) throw err;
      const wait = base * Math.pow(2, attempt) + Math.floor(Math.random() * 200);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
}
