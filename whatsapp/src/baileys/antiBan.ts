/**
 * antiBan.ts
 * - Human-like typing simulation
 * - Small delays before sending
 * - Randomized typing durations between min/max
 *
 * Roman Urdu: Yeh logic send karne se pehle call karein taake
 * behaviour zyada human-like lagay aur WA ban risk kam ho.
 */

import { WA_TYPING_MIN_MS, WA_TYPING_MAX_MS } from "../config/env";
import { sleep } from "../utils/sleep";

export function randomTypingDelay() {
  const min = WA_TYPING_MIN_MS;
  const max = WA_TYPING_MAX_MS;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function simulateTyping() {
  const delay = randomTypingDelay();
  await sleep(delay);
}
