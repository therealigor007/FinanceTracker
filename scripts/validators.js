// Validation patterns and utilities for Student Finance Tracker

export const PATTERNS = {
  // Description: forbid leading/trailing spaces and collapse doubles
  description: /^\S(?:.*\S)?$/,
  
  // Amount: positive number with up to 2 decimal places
  amount: /^(0|[1-9]\d*)(\.\d{1,2})?$/,
  
  // Date: strict YYYY-MM-DD format
  date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
  
  // Category: letters, spaces, hyphens (for free-text input)
  category: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,
  
  // Predefined categories for dropdown validation
  predefinedCategories: /^(Food|Transport|Entertainment|Education|Shopping|Bills|Health|Other)$/,
  
  // Advanced: duplicate words detection using back-references
  duplicateWords: /\b(\w+)\s+\1\b/gi,
};

export const validators = {
  description: {
    pattern: PATTERNS.description,
    validate: validateDescription
  },
  amount: {
    pattern: PATTERNS.amount,
    validate: validateAmount
  },
  date: {
    pattern: PATTERNS.date,
    validate: validateDate
  },
  category: {
    pattern: PATTERNS.category,
    validate: validateCategory
  },
  predefinedCategories: {
    pattern: PATTERNS.predefinedCategories,
    validate: validatePredefinedCategory
  },
  duplicateWords: {
    pattern: PATTERNS.duplicateWords,
    validate: validateDuplicateWords
  }
};

export function validateDescription(value) {
  if (!value || value.trim() === "") {
    return { valid: false, message: "Description is required" };
  }

  // Check for leading/trailing spaces
  if (value !== value.trim()) {
    return {
      valid: false,
      message: "Description cannot have leading or trailing spaces"
    };
  }

  // Check for collapsed doubles (no consecutive spaces)
  if (/\s{2,}/.test(value)) {
    return {
      valid: false,
      message: "Description cannot have multiple consecutive spaces"
    };
  }

  // Check basic pattern
  if (!PATTERNS.description.test(value)) {
    return {
      valid: false,
      message: "Description must be non-empty and not just whitespace"
    };
  }

  // Check for duplicate words (advanced regex)
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
      message: "Amount must be a positive number with up to 2 decimal places (e.g., 12.50)"
    };
  }

  const numValue = Number.parseFloat(value);
  if (numValue <= 0) {
    return { valid: false, message: "Amount must be greater than 0" };
  }

  if (numValue > 999999.99) {
    return { valid: false, message: "Amount cannot exceed 999,999.99" };
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
      message: "Date must be in YYYY-MM-DD format"
    };
  }

  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return { valid: false, message: "Invalid date" };
  }

  // Check if the parsed date matches the input (handles invalid dates like 2025-02-29)
  const [year, month, day] = value.split('-').map(Number);
  if (date.getFullYear() !== year || 
      date.getMonth() !== month - 1 || 
      date.getDate() !== day) {
    return { valid: false, message: "Invalid date (e.g., February 29th in non-leap year)" };
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
      message: "Category must contain only letters, spaces, and hyphens"
    };
  }

  return { valid: true, message: "" };
}

export function validatePredefinedCategory(value) {
  if (!value || value.trim() === "") {
    return { valid: false, message: "Category is required" };
  }

  if (!PATTERNS.predefinedCategories.test(value)) {
    return {
      valid: false,
      message: "Please select a valid category from the dropdown"
    };
  }

  return { valid: true, message: "" };
}

export function validateDuplicateWords(value) {
  if (!value) return { valid: true, message: "" };
  
  const duplicates = value.match(PATTERNS.duplicateWords);
  if (duplicates) {
    return {
      valid: false,
      message: `Duplicate words detected: "${duplicates[0]}"`
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

  const categoryResult = validatePredefinedCategory(transaction.category);
  if (!categoryResult.valid) errors.category = categoryResult.message;

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function parseRegexPattern(input) {
  try {
    if (!input || input.trim() === '') {
      return null;
    }

    // Check if input is in /pattern/flags format
    const match = input.match(/^\/(.+)\/([gimuy]*)$/);
    if (match) {
      return new RegExp(match[1], match[2] || 'i');
    }

    // Default to case-insensitive search
    return new RegExp(input, 'i');
  } catch (error) {
    throw new Error(`Invalid regex pattern: ${error.message}`);
  }
}

// Safe regex compiler with error handling
export function compileRegex(input, flags = 'i') {
  try {
    if (!input) return null;
    return new RegExp(input, flags);
  } catch (error) {
    return null;
  }
}
