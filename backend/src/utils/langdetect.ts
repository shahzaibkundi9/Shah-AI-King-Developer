// simple wrapper around franc for auto-detection
import franc from "franc";

export function detectLanguage(text: string) {
  try {
    const code = franc(text || "", { minLength: 3 });
    return code === "und" ? "und" : code;
  } catch (e) {
    return "und";
  }
}
