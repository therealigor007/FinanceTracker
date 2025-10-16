export const PATTERNS = {
  description: /^[a-zA-Z0-9\s.,!?'-]{3,100}$/,
  amount: /^\d{1,4}(\.\d{1,2})?$/,
  date: /^\d{4}-\d{2}-\d{2}$/,
  category:
    /^(Food|Transport|Entertainment|Education|Shopping|Bills|Health|Other)$/,
  duplicateWords: /\b(\w+)\s+\1\b/gi,
};

export function validateDescription(value) {
  const strValue = String(value || "");

  if (!strValue || strValue.trim() === "") {
    return { valid: false, message: "Description is required" };
  }

  if (!PATTERNS.description.test(strValue)) {
    return {
      valid: false,
      message:
        "Description must be 3-100 characters, letters, numbers, spaces, and basic punctuation only",
    };
  }

  const duplicates = strValue.match(PATTERNS.duplicateWords);
  if (duplicates) {
    return {
      valid: false,
      message: `Duplicate words detected: "${duplicates[0]}". Please remove repeated words.`,
    };
  }

  return { valid: true, message: "" };
}

export function validateAmount(value) {
  const strValue = String(value ?? "").trim();

  if (!strValue) {
    return { valid: false, message: "Amount is required" };
  }
  const AMOUNT_PATTERN = /^(?!0\.00$)\d{1,4}(\.\d{1,2})?$/;

  if (!AMOUNT_PATTERN.test(strValue)) {
    return {
      valid: false,
      message: "Enter a valid amount (max 9999.99, 2 decimals)",
    };
  }

  const numValue = parseFloat(strValue);
  if (isNaN(numValue) || numValue <= 0) {
    return { valid: false, message: "Amount must be greater than 0" };
  }

  return { valid: true, message: "" };
}

export function validateDate(value) {
  const strValue = String(value || "");

  if (!strValue || strValue.trim() === "") {
    return { valid: false, message: "Date is required" };
  }

  if (!PATTERNS.date.test(strValue)) {
    return {
      valid: false,
      message: "Date must be in YYYY-MM-DD format",
    };
  }

  const date = new Date(strValue);
  if (isNaN(date.getTime())) {
    return { valid: false, message: "Invalid date" };
  }

  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (date > today) {
    return { valid: false, message: "Date cannot be in the future" };
  }

  return { valid: true, message: "" };
}

export function validateCategory(value) {
  const strValue = String(value || "");

  if (!strValue || strValue.trim() === "") {
    return { valid: false, message: "Category is required" };
  }

  if (!PATTERNS.category.test(strValue)) {
    return {
      valid: false,
      message: "Please select a valid category",
    };
  }

  return { valid: true, message: "" };
}

export function validateTransaction(transaction) {
  const errors = {};

  const descResult = validateDescription(transaction.description);
  if (!descResult.valid) errors.description = descResult.message;

  const amountResult = validateAmount(transaction.amount);
  if (!amountResult.valid) errors.amount = amountResult.message;

  const dateResult = validateDate(transaction.date);
  if (!dateResult.valid) errors.date = dateResult.message;

  const categoryResult = validateCategory(transaction.category);
  if (!categoryResult.valid) errors.category = categoryResult.message;

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function parseRegexPattern(input) {
  try {
    const match = input.match(/^\/(.+)\/([gimuy]*)$/);
    if (match) {
      return new RegExp(match[1], match[2]);
    }
    return new RegExp(input, "i");
  } catch (error) {
    throw new Error("Invalid regex pattern");
  }
}
