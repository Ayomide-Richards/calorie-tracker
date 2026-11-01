# CalorieTracker 🥗

A lightweight, responsive calorie and macronutrient tracker built with **100% vanilla HTML, CSS, and JavaScript**. No frameworks, no external dependencies, no CSS variables, and no backend needed — all data is stored persistently in the browser via `localStorage`.

---

## ✨ Features

- **Daily Calorie & Macro Dashboard**:
  - Real-time visualization of consumed calories vs. daily budget.
  - Remaining calories indicator with dynamic alerts when approaching or exceeding limits.
  - Macronutrient breakdown (Protein, Carbs, Fat) in grams, percentages, and calculated caloric contribution.
- **Persistent Local Storage**:
  - All logs, historical entries, and custom goals persist in the browser's `localStorage`.
- **Date Navigation**:
  - Jump across days with `< Previous` and `Next >` controls, or jump straight to "Today" or any specific calendar date.
- **Categorized Food Logging**:
  - Log entries under Breakfast, Lunch, Dinner, or Snacks.
  - Track calories, protein, carbs, and fat per item.
  - Fast one-click presets for common foods (boiled eggs, chicken breast, apple, greek yogurt, etc.).
- **Per-Meal Breakdown**:
  - Subtotals calculated per meal category with instant item deletion.
- **Customizable Goals**:
  - Adjust daily targets for calories, protein, carbs, and fat directly from the settings modal.
- **Data Portability**:
  - Export your complete log as a JSON backup file.
  - Import and restore previous backups without data loss.
  - Quick-reset option to wipe local data on demand.

---

## 🛠️ Tech Stack

- **HTML5**: Semantic document structure.
- **Vanilla CSS**: Clean, responsive layout with flexbox and CSS grid, without Tailwind or CSS custom properties / variables.
- **Vanilla JavaScript (ES6+)**: Zero dependencies, component logic, date manipulation, and `localStorage` state management.

---

## 🚀 Getting Started

No build step or server required.

1. Clone or download this repository:
   ```bash
   git clone https://github.com/Ayomide-Richards/calorie-tracker.git
   ```
2. Open `index.html` in your web browser:
   - Double-click `index.html`, or
   - Right click `index.html` → **Open with** → your favorite browser.

---

## 📄 License

MIT License. Free to use and modify for personal or educational purposes.

