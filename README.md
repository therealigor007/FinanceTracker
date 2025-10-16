# Student Finance Tracker

A comprehensive web application that helps students manage personal finances, track expenses, and achieve financial goals. Built with **vanilla HTML, CSS, and JavaScript (ES6+)**, it emphasizes **responsive design, accessibility, and offline functionality**.

---

## 🌐 Demo & Video

- **Live Demo:** [Click here to view the app](https://therealigor007.github.io/frontend-web-dev-summative-Igor-Ntwali/)  
- **YouTube Demo Video:** [Watch here](https://youtu.be/nZulTHwQsAw)

---

## 🚀 Overview

The **Student Finance Tracker** is a progressive web application designed for students to:

- Track financial transactions (add, edit, delete)  
- Set and monitor budgets  
- Visualize spending trends  
- Work offline using localStorage  
- Use advanced regex-based search and validation  

This project demonstrates modern web development techniques without external frameworks, focusing on **modular architecture, accessibility, and responsive design**.

---

## ✨ Key Features

- **Transaction Management:** Full CRUD operations on transactions  
- **Advanced Search:** Regex-based filtering by description, category, amount, or date  
- **Budget Tracking:** Real-time progress indicators with warnings  
- **Statistics Dashboard:** Spending trends, category breakdowns, last 7 days summary  
- **Multi-Currency Support:** USD, EUR, and RWF with instant conversion  
- **Offline Storage:** localStorage-based persistence  
- **Service Worker Support:** Progressive Web App offline capabilities  
- **Dark Mode:** Light/dark theme toggle with saved preference  

---

## 🛠 Technical Implementation

### Technologies Used

- HTML5 (semantic and accessible)  
- CSS3 (Grid, Flexbox, custom properties)  
- JavaScript (ES6+ modules, arrow functions, template literals)  
- localStorage API for data persistence  
- Regex for input validation and search  
- Service Workers for offline support  
- Google Fonts for typography  

### Architecture

- `storage.js` – localStorage operations  
- `validators.js` – Regex validation for all input fields  
- `state.js` – State management, sorting, and formatting  
- `ui.js` – UI rendering utilities and notifications  
- `dashboard.js` – Dashboard logic and budget tracking  
- `form.js` – Add/Edit transaction handling  
- `main.js` – Transaction list and routing  
- `settings.js` – Budget & currency management  
- `theme.js` – Dark mode toggle  
- `sw.js` & `sw-register.js` – Service Worker setup  

---

## ✅ Validation Rules

- **Description:** 3–100 characters, alphanumeric + basic punctuation, no duplicate consecutive words  
- **Amount:** Decimal numbers (0.01–9999.99), up to 2 decimal places  
- **Date:** ISO format (YYYY-MM-DD), cannot be in the future  
- **Category:** Predefined list: Food, Transport, Entertainment, Education, Shopping, Bills, Health, Other  

---

## 📁 Project Structure

```
student-finance-tracker/
├── index.html # Dashboard
├── transactions.html # Transaction list & search
├── add.html # Add/Edit transaction form
├── settings.html # Budget & currency settings
├── about.html # About page
├── styles/
│ └── main.css # All responsive styles
├── scripts/
│ ├── storage.js # localStorage operations
│ ├── validators.js # Regex validation
│ ├── state.js # State management
│ ├── ui.js # UI rendering
│ ├── dashboard.js # Dashboard logic
│ ├── form.js # Add/Edit form
│ ├── main.js # Transactions & routing
│ ├── settings.js # Settings logic
│ ├── theme.js # Dark mode
│ ├── sw.js # Service Worker
│ └── sw-register.js # SW registration
├── seed.json # Sample data
└── README.md # Documentation
```

---

## 🎨 Accessibility Features

- WCAG 2.1 Level AA compliant  
- Full keyboard navigation (Tab, Shift+Tab, Enter, Escape)  
- ARIA labels, live regions, and semantic landmarks  
- High contrast color scheme (≥4.5:1)  
- Skip navigation links for keyboard users  
- Responsive design for all device sizes  
- Focus management and visible focus indicators  

---

## 📊 Browser Compatibility

Tested and works on modern browsers:

- Chrome 90+  
- Firefox 88+  
- Safari 14+  
- Edge 90+  

---

## 💾 Data Persistence

- All data stored in **localStorage** (offline support)  
- Export and import JSON for backups or migration  
- Complete privacy: data never leaves your device  

---

## 🧪 Testing

- Open `tests.html` to run **regex validation test suite**  
- Manual testing checklist included: adding/editing/deleting transactions, search, sorting, budgets, currency conversion, keyboard navigation, mobile support  

---

## 🎓 Educational Purpose

This project demonstrates proficiency in:

- Semantic HTML5 & accessibility  
- Responsive CSS design  
- JavaScript ES6+ modules & functional programming  
- Regular expressions for validation & search  
- Client-side state management and localStorage  
- Event-driven programming & DOM manipulation  
- UX design and progressive enhancement  

---

## 📫 Contact

- **Email:** [i.ntwali@alustudent.com](mailto:i.ntwali@alustudent.com)  
- **GitHub:** [@realigor007](https://github.com/realigor007)  

---

## 📄 License

MIT License – Free for educational purposes.
