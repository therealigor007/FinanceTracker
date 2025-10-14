# Student Finance Tracker

A comprehensive web application for students to track expenses, manage budgets, and achieve financial goals. Built with vanilla HTML, CSS, and JavaScript.

## Features

### Core Functionality

- **Transaction Management**: Add, edit, delete, and view financial transactions
- **Budget Tracking**: Set spending caps and monitor progress with visual indicators
- **Statistics Dashboard**: View spending trends, top categories, and financial summaries
- **Multi-Currency Support**: Track expenses in USD, EUR, or GBP with manual exchange rates
- **Data Persistence**: All data stored locally using localStorage API
- **Import/Export**: Backup and restore data using JSON format

### Advanced Features

- **Regex Validation**: 5 comprehensive validation patterns including advanced back-reference detection
- **Live Search**: Real-time regex-based search with pattern highlighting
- **Sorting**: Multi-column sorting for transactions table
- **Responsive Design**: Mobile-first approach with breakpoints for tablet and desktop
- **Accessibility**: WCAG 2.1 Level AA compliant with full keyboard navigation

## Project Structure

\`\`\`
student-finance-tracker/
├── index.html # Dashboard page
├── transactions.html # All transactions view
├── add.html # Add/Edit transaction form
├── settings.html # Settings and preferences
├── about.html # About page
├── tests.html # Regex validation test suite
├── seed.json # Sample data for import
├── README.md # This file
├── styles/
│ └── main.css # All styles (mobile-first, no frameworks)
└── scripts/
├── storage.js # localStorage operations
├── validators.js # Regex validation patterns
├── state.js # State management
├── ui.js # UI rendering functions
└── main.js # Main application logic
\`\`\`

## Getting Started

### Installation

1. Download or clone this repository
2. Open `index.html` in a modern web browser
3. No build process or dependencies required!

### Loading Sample Data

1. Go to Settings page
2. Click "Import Data"
3. Select the `seed.json` file
4. Sample transactions will be loaded

## Regex Validation Patterns

### 1. Description Validation

**Pattern**: `/^[a-zA-Z0-9\s\-,.!?]{3,100}$/`

- 3-100 characters
- Letters, numbers, spaces, and basic punctuation (- , . ! ?)
- Examples: "Coffee at Starbucks", "Grocery shopping - Walmart"

### 2. Amount Validation

**Pattern**: `/^(?!0+(\.0{1,2})?$)\d{1,6}(\.\d{1,2})?$/`

- Positive numbers only (no zero)
- Up to 6 digits before decimal
- Up to 2 digits after decimal
- Range: 0.01 to 999999.99
- Examples: "10.50", "100", "0.01"

### 3. Date Validation

**Pattern**: `/^(19|20)\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/`

- YYYY-MM-DD format
- Years: 1900-2099
- Months: 01-12
- Days: 01-31
- Examples: "2025-01-15", "2024-12-31"

### 4. Category Validation

**Pattern**: `/^(Food|Transport|Entertainment|Shopping|Bills|Other)$/`

- Exact match of predefined categories
- Case-sensitive
- Examples: "Food", "Transport", "Entertainment"

### 5. Duplicate Words Detection (Advanced)

**Pattern**: `/\b(\w+)\s+\1\b/`

- Uses back-reference `\1` to detect repeated words
- Matches word boundaries
- Examples: "the the", "coffee coffee shop"

## Usage Guide

### Adding a Transaction

1. Click "Add Transaction" in navigation
2. Fill in all required fields:
   - Description (3-100 characters)
   - Amount (positive number)
   - Category (select from dropdown)
   - Date (YYYY-MM-DD format)
3. Click "Add Transaction"
4. Real-time validation provides immediate feedback

### Searching Transactions

1. Go to Transactions page
2. Use the search box with regex patterns:
   - Find coffee purchases: `coffee`
   - Find amounts over $50: `[5-9]\d\.\d{2}|[1-9]\d{2,}\.\d{2}`
   - Find specific dates: `2025-01-1[0-5]`
3. Results update in real-time
4. Matching text is highlighted

### Setting a Budget

1. Go to Settings page
2. Enter your monthly budget cap
3. Dashboard shows progress bar
4. ARIA live regions announce budget status

### Currency Conversion

1. Go to Settings page
2. Select your preferred currency
3. Update exchange rates if needed
4. All amounts convert automatically
5. Use the currency converter tool

## Keyboard Navigation

### Global

- **Tab**: Move forward through interactive elements
- **Shift + Tab**: Move backward
- **Enter/Space**: Activate buttons and links
- **Escape**: Close modals and cancel operations

### Forms

- **Tab**: Move between fields
- **Enter**: Submit form
- **Escape**: Cancel edit mode

### Tables

- **Tab**: Navigate through action buttons
- **Enter/Space**: Activate edit or delete

## Accessibility Features

### WCAG 2.1 Level AA Compliance

- Semantic HTML with proper landmarks
- Logical heading hierarchy (h1 → h2 → h3)
- All inputs have associated labels
- ARIA attributes for dynamic content
- Full keyboard navigation support
- Visible focus indicators (2px outline)
- Minimum 4.5:1 color contrast ratio
- Screen reader support with descriptive text

### Live Regions

- Budget status announcements
- Search results count
- Form validation messages
- Success/error notifications

## Color Palette

- **Primary Green**: `#4C763B`
- **Dark Green**: `#043915`
- **Light Green**: `#B0CE88`
- **Background**: `#FAFAF9`
- **Surface**: `#FFFFFF`
- **Text**: `#1C1917`
- **Text Secondary**: `#78716C`
- **Border**: `#E7E5E4`

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

## Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Custom properties, Flexbox, Grid, Media Queries
- **JavaScript (ES6+)**: Modules, Classes, Arrow Functions
- **localStorage API**: Data persistence
- **Regular Expressions**: Validation and search

### No Frameworks or Libraries

This project demonstrates modern web development using only vanilla technologies.

## Testing

### Automated Tests

Open `tests.html` to run the regex validation test suite with 35+ test cases.

### Manual Testing Checklist

- [ ] Add transaction with valid data
- [ ] Try invalid data (should show errors)
- [ ] Edit existing transaction
- [ ] Delete transaction (confirmation modal)
- [ ] Search with regex patterns
- [ ] Sort transactions by different columns
- [ ] Set budget cap and verify progress
- [ ] Convert between currencies
- [ ] Export data to JSON
- [ ] Import data from JSON
- [ ] Test keyboard navigation
- [ ] Test with screen reader
- [ ] Test on mobile device

## Assignment Compliance

This project meets all requirements for the Student Finance Tracker assignment:

- ✅ Semantic HTML structure
- ✅ Mobile-first responsive CSS
- ✅ 5+ regex validation patterns (including advanced back-reference)
- ✅ Form validation with real-time feedback
- ✅ Table with sorting and regex search
- ✅ Stats dashboard with metrics
- ✅ Budget cap tracking with progress bar
- ✅ Multi-currency support (3 currencies)
- ✅ Import/Export JSON functionality
- ✅ localStorage persistence
- ✅ Full keyboard navigation
- ✅ WCAG 2.1 Level AA accessibility
- ✅ Comprehensive documentation

## License

MIT License - Free to use for educational purposes.

## Contact

Built for educational purposes as part of a web development course.

---

**Note**: This is a client-side only application. All data is stored locally in your browser. Clearing browser data will delete all transactions.
