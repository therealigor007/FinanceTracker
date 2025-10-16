export const PATTERNS = {
  // Description: 3-100 characters, letters, numbers, spaces, and basic punctuation
  description: /^[a-zA-Z0-9\s.,!?'-]{3,100}$/,

  // Amount: decimal format with up to 2 decimal places, max 9999.99
  amount: /^\d{1,4}(\.\d{1,2})?$/,

  // Date: ISO format YYYY-MM-DD
  date: /^\d{4}-\d{2}-\d{2}$/,

  // Category: predefined list
  category:
    /^(Food|Transport|Entertainment|Education|Shopping|Bills|Health|Other)$/,

  // Duplicate words detection (advanced regex with back-references)
  duplicateWords: /\b(\w+)\s+\1\b/gi,
};

export function validateDescription(value) {
  if (!value || value.trim() === "") {
    return { valid: false, message: "Description is required" };
  }

  if (!PATTERNS.description.test(value)) {
    return {
      valid: false,
      message:
        "Description must be 3-100 characters, letters, numbers, spaces, and basic punctuation only",
    };
  }

  const duplicates = value.match(PATTERNS.duplicateWords);
  if (duplicates) {
    return {
      valid: false,
      message: `Duplicate words detected: "${duplicates[0]}". Please remove repeated words.`,
    };
  }

  return { valid: true, message: "" };
}

export function validateAmount(value) {
  if (!value || value.trim() === "") {
    return { valid: false, message: "Amount is required" };
  }

  if (!PATTERNS.amount.test(value)) {
    return {
      valid: false,
      message:
        "Amount must be a valid number (0.00 to 9999.99) with up to 2 decimal places",
    };
  }

  const numValue = Number.parseFloat(value);
  if (numValue <= 0) {
    return { valid: false, message: "Amount must be greater than 0" };
  }

  if (numValue > 9999.99) {
    return { valid: false, message: "Amount cannot exceed 9999.99" };
  }

  return { valid: true, message: "" };
}

export function validateDate(value) {
  if (!value || value.trim() === "") {
    return { valid: false, message: "Date is required" };
  }

  if (!PATTERNS.date.test(value)) {
    return {
      valid: false,
      message: "Date must be in YYYY-MM-DD format",
    };
  }

  const date = new Date(value);
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
  if (!value || value.trim() === "") {
    return { valid: false, message: "Category is required" };
  }

  if (!PATTERNS.category.test(value)) {
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
