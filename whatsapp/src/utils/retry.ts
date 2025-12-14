// simple retry helper with jittered backoff
export async function retry<T>(fn: () => Promise<T>, retries = 3, baseMs = 500): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      if (attempt > retries) throw err;
      const wait = baseMs * Math.pow(2, attempt) + Math.floor(Math.random() * 200);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
}
