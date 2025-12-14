// ai/src/engine/safety.ts
/**
 * Safety filter pipeline (basic)
 *
 * Responsibilities:
 * - Quickly detect unsafe content (profanity, payment-scams, PII, adult)
 * - Return sanitized text + verdict
 * - Provide hooks to plug external safety models later
 *
 * Roman Urdu:
 * - Yeh initial filter hai — strict/loose modes later add kar sakte ho.
 */

const bannedWords = [
  // small sample — extend with real list or use third-party safety API
  "bomb",
  "terror",
  "explode",
  "password",
  "ssn",
  "credit card",
  "card number",
  "kill",
  "murder"
];

// naive profanity list (example)
const profanity = ["fuck", "shit", "bitch", "asshole"];

export type SafetyResult = {
  safe: boolean;
  reason?: string;
  cleaned?: string;
};

function containsAny(text: string, arr: string[]) {
  const t = text.toLowerCase();
  return arr.some((w) => t.includes(w));
}

export async function runSafetyChecks(text: string): Promise<SafetyResult> {
  try {
    if (!text || text.trim().length === 0) return { safe: true, cleaned: "" };

    // 1) banned words
    if (containsAny(text, bannedWords)) {
      return { safe: false, reason: "banned_content_detected", cleaned: "" };
    }

    // 2) profanity (we allow but mark)
    if (containsAny(text, profanity)) {
      // optional: sanitize with stars
      let cleaned = text;
      for (const p of profanity) {
        const re = new RegExp(p, "gi");
        cleaned = cleaned.replace(re, (m) => "*".repeat(m.length));
      }
      return { safe: true, reason: "profanity_masked", cleaned };
    }

    // 3) PII heuristics (naive: long digit sequences)
    const digits = text.replace(/[^0-9]/g, "");
    if (digits.length >= 12) {
      return { safe: false, reason: "possible_pii", cleaned: "" };
    }

    // 4) too long / suspicious
    if (text.length > 5000) {
      return { safe: false, reason: "too_long" };
    }

    // otherwise OK
    return { safe: true, cleaned: text };
  } catch (e) {
    return { safe: true, cleaned: text };
  }
}
