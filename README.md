<div align="center">

# 🗂️ Life Dashboard

**Personal life management dashboard for tasks, habits, lessons, meals, and fitness tracking.**

[![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5a0fc8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Features](#-features) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [Project Structure](#-project-structure) · [Roadmap](#-roadmap) · [Contributing](#-contributing)

</div>

---

## 📸 Overview

Life Dashboard is a fully client-side personal productivity app that helps you manage every aspect of your daily life — all within a single, beautiful interface. Data stays on your device via `localStorage`, so no account or server is required.

---

## ✨ Features

### ✅ Tasks & Habits
- Sub-tasks (checklist support)
- Recurring tasks (daily / weekly)
- Tag filtering & sorting
- Habit goals (e.g., 5 days per week)
- Streak statistics (longest streak, average streak)
- Completion rate & best-day analysis

### 📚 Private Lessons
- Lesson calendar & planning
- Recurring lesson templates
- Student profiles (notes, contact info, parent details)
- Income / expense tracking
- Monthly billing & Excel / PDF reports

### 🍽️ Meals & Recipes
- Save recipes (ingredients, steps, duration, servings)
- Meal diary (breakfast, lunch, dinner, snacks)
- Quick meal entry directly from saved recipes

### 🏋️ Fitness & Health
- Workout tracking (running, swimming, fitness, yoga, etc.)
- Water & coffee intake tracking
- Weekly hydration chart

### 📊 Statistics & Reports
- Dashboard summary cards
- Task distribution by tag
- Current month vs. previous month comparison
- Weekly / monthly PDF reports

### ⚙️ General
- PWA support — installable on home screen, works offline
- Mobile-friendly with notch screen support
- Dark / light theme
- Data backup & restore (JSON export/import)

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| Framework | React 19 + Vite 7 |
| Styling | Tailwind CSS 3 |
| Icons | Lucide React |
| Excel Export | xlsx |
| PWA | vite-plugin-pwa |
| State | React Context + localStorage |

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Installation

```bash
# Clone the repository
git clone https://github.com/Alierkn/life-dashboard.git
cd life-dashboard

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build & Preview

```bash
# Production build
npm run build

# Preview the build locally
npm run preview
```

### Deployment

You can deploy to **Vercel** or **Netlify** by connecting the repository for automatic deployments. See [DEPLOY.md](DEPLOY.md) for detailed instructions.

---

## 📁 Project Structure

```
life-dashboard/
├── public/
├── src/
│   ├── components/
│   │   ├── layout/        # Page layouts
│   │   └── widgets/       # Dashboard widgets
│   ├── contexts/          # React Context (global state)
│   ├── hooks/             # Custom hooks
│   ├── utils/             # Helper functions
│   └── constants/         # App-wide constants
├── index.html
└── dist/                  # Production build output
```

---

## 🔒 Data & Privacy

All data is stored locally in your browser's `localStorage`. **No data is ever sent to any server.**

To back up your data, use the **"Backup"** button on the Profile page to export a JSON file, which can later be re-imported.

---

## 🗺️ Roadmap

See [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md) for the full roadmap. Highlights:

- [ ] **Phase 1** — Code quality improvements & bug fixes
- [ ] **Phase 2** — Modular architecture (component split, custom hooks)
- [ ] **Phase 3** — New features (reminders, goal tracking, AI tips)
- [ ] **Phase 4** — Accessibility (a11y), performance & testing
- [ ] **Phase 5** — Backend sync (Supabase), multi-device support

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a pull request

---

## 📄 License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for more information.

---

<div align="center">
Made with ❤️ by <a href="https://github.com/Alierkn">Alierkn</a>
</div>
