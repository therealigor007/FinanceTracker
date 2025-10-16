// Search utilities for Student Finance Tracker

/**
 * Safely compile a regex pattern with error handling
 * @param {string} input - The regex pattern or search string
 * @param {string} flags - Regex flags (default: 'i' for case-insensitive)
 * @returns {RegExp|null} - Compiled regex or null if invalid
 */
export function compileRegex(input, flags = 'i') {
  try {
    if (!input || input.trim() === '') {
      return null;
    }

    // Check if input is in /pattern/flags format
    const match = input.match(/^\/(.+)\/([gimuy]*)$/);
    if (match) {
      return new RegExp(match[1], match[2] || flags);
    }

    // Default to case-insensitive search
    return new RegExp(input, flags);
  } catch (error) {
    console.warn('Invalid regex pattern:', input, error);
    return null;
  }
}

/**
 * Highlight matches in text using <mark> tags
 * @param {string} text - The text to search in
 * @param {RegExp} regex - The compiled regex pattern
 * @returns {string} - Text with highlighted matches
 */
export function highlight(text, regex) {
  if (!text || !regex) return text;
  
  try {
    return text.replace(regex, (match) => `<mark>${match}</mark>`);
  } catch (error) {
    console.warn('Error highlighting text:', error);
    return text;
  }
}

/**
 * Search transactions with regex pattern
 * @param {Array} transactions - Array of transaction objects
 * @param {RegExp} pattern - Compiled regex pattern
 * @returns {Array} - Filtered transactions
 */
export function searchTransactions(transactions, pattern) {
  if (!pattern) return transactions;
  
  return transactions.filter(transaction => {
    return pattern.test(transaction.description) ||
           pattern.test(transaction.category) ||
           pattern.test(transaction.amount.toString()) ||
           pattern.test(transaction.date);
  });
}

/**
 * Toggle case sensitivity for regex pattern
 * @param {RegExp} regex - Current regex pattern
 * @param {boolean} caseSensitive - Whether to make it case sensitive
 * @returns {RegExp|null} - New regex with updated flags
 */
export function toggleCaseSensitivity(regex, caseSensitive) {
  if (!regex) return null;
  
  const flags = caseSensitive ? 'g' : 'gi';
  try {
    return new RegExp(regex.source, flags);
  } catch (error) {
    console.warn('Error toggling case sensitivity:', error);
    return regex;
  }
}

/**
 * Parse search input and return compiled regex with error info
 * @param {string} input - User input
 * @param {boolean} caseSensitive - Whether search should be case sensitive
 * @returns {Object} - { regex, error, isValid }
 */
export function parseSearchInput(input, caseSensitive = false) {
  if (!input || input.trim() === '') {
    return { regex: null, error: null, isValid: true };
  }

  try {
    const flags = caseSensitive ? 'g' : 'gi';
    const regex = compileRegex(input, flags);
    
    if (!regex) {
      return { 
        regex: null, 
        error: 'Invalid regex pattern', 
        isValid: false 
      };
    }

    return { regex, error: null, isValid: true };
  } catch (error) {
    return { 
      regex: null, 
      error: `Invalid pattern: ${error.message}`, 
      isValid: false 
    };
  }
}
