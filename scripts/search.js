import { parseRegexPattern } from "./validators.js";

export function compileRegex(input, defaultFlags = "i") {
  if (!input || typeof input !== "string") return null;
  return parseRegexPattern(input);
}

export function searchTransactions(transactions, re) {
  if (!re) return [...transactions];
  const lowerRe = re;
  return transactions.filter((t) => {
    const fields = [t.description, t.category, String(t.date)];
    return fields.some((f) => {
      if (f == null) return false;
      return lowerRe.test(String(f));
    });
  });
}
