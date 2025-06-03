# Rules Management App

A React app for managing medical imaging rules and rulesets.

## Live Demo

🔗 **[View Live Demo](https://sarcmediq-test.vercel.app)**

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## What it does

- Create and manage rulesets
- Add/edit/delete rules within rulesets
- Drag and drop to reorder rules
- Form validation for required fields
- Copy rulesets

## Tech Stack

- React + TypeScript
- Redux Toolkit for state management
- Tailwind CSS for styling
- react-dnd for drag and drop
- Vite for development

## Usage

1. Select a ruleset from the dropdown or create a new one
2. Click "Edit Rules" to modify rules
3. Use "Add New Rule" to create rules
4. Drag the ≡≡ handle to reorder rules
5. Click ✓ to save changes or ✕ to cancel

Rules require: measurement name, finding name, action, and unit (when using >= or < comparators).

## Project Structure

```
src/
├── components/     # UI components
├── pages/          # Main page
├── redux/          # State management
└── ...
```
