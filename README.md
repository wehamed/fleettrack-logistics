# FleetTrack-Logistics

**A self-hosted fleet and logistics management system** — track trucks, drivers, employees, revenues, expenses, and payroll from a single Arabic-first (RTL) dashboard, with detailed PDF and Excel financial reports.

![MIT License](https://img.shields.io/badge/license-MIT-green)
![Next.js](https://img.shields.io/badge/Next.js-16.2-blue?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-7.8-2D3748?logo=prisma)
![SQLite](https://img.shields.io/badge/SQLite-libsql-003B57?logo=sqlite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss)
![CI](https://img.shields.io/badge/CI-passing-brightgreen)

---

## Overview

FleetTrack-Logistics is a complete financial and operational hub for small-to-medium trucking companies. It consolidates trucks, drivers, employees, revenues, expenses, and payroll into one place, and produces a detailed income-statement report that can be exported as **PDF** or **Excel**.

The system is designed to run **fully locally** on a single machine using a SQLite database — no separate database server, no cloud accounts, and no internet connection required. The interface is entirely in Arabic with full **RTL** support and a polished light/dark theme.

---

## Features

### Fleet & Truck Management
- Create, edit, and soft-delete trucks (plate number, model, year, purchase date, purchase value)
- Track truck status: **Operational** | **In Maintenance** | **Stopped**
- Assign drivers to trucks with start/end dates
- Per-truck detail view with a summary of associated revenues and expenses
- Two list layouts: **Table** and **Kanban**

### Drivers & Employees
- Create, edit, and manage employees (name, role, salary type, base salary, phone)
- Three salary types: **Monthly Fixed** | **Per Trip** | **Revenue Share**
- Assign drivers to trucks and track assignment history

### Revenues & Expenses
- Record revenues per truck (date, client, destination, revenue type)
- Revenue types: **Freight** | **Monthly Contract** | **Truck Rental**
- Record general or truck-specific expenses with dynamic categories (maintenance, fuel, etc.)
- Per-truck revenue and expense summaries

### Payroll
- Monthly payroll sheets with automatic net calculation: `net = baseAmount − deductions − advances`
- Payment status tracking (paid / unpaid)
- Unique constraint preventing duplicate payroll entries for the same employee in the same month
- Auto-fill of the base salary when an employee is selected

### Company Settings
- Company profile: name, currency, fiscal year, logo, contact details, tax number
- Customizable brand colors (primary, secondary, accent) applied across the UI
- Light/dark theme with instant switching and persisted preference

### Reports
- Detailed **income statement**: total revenues, direct expenses, overheads, payroll, and net profit
- Date-range filtering (from / to)
- Export as **PDF** via Puppeteer with embedded Arabic Tajawal font
- Export as **Excel** via ExcelJS with professional RTL formatting
- Direct browser printing

### Bilingual & RTL
- Fully Arabic interface (RTL), designed with Arabic fonts (**Cairo** for UI, **Tajawal** for printed reports)
- Modern responsive layout with light and dark modes

### Security
- Passwords hashed with Node.js built-in **scrypt** (no external libraries)
- Sessions signed with **HMAC SHA-256** via Web Crypto (Node + Edge compatible)
- Route protection via Next.js Middleware (except login and report routes)
- Timing-safe password and signature comparisons

### Audit Log & Backup
- Automatic activity logging of every create / update / delete via Prisma middleware
- Full system backup to **JSON** and restore within a database transaction

---

## Tech Stack

| Technology | Role | Why |
|------------|------|-----|
| **Next.js 16** | Framework (App Router) | File-based routing, Server Components, built-in API routes and Middleware |
| **React 19** | UI library | Declarative components, improved performance via Server Components |
| **TypeScript** | Language | Type safety, early error detection, self-documenting data contracts |
| **Tailwind CSS v4** | Styling | Utility-first CSS, native RTL support, effortless dark mode |
| **Prisma 7** | ORM | Type-safe schema, secure queries, middleware for activity logging |
| **SQLite (libsql)** | Database | Single-file, serverless, fast, ideal for fully local operation |
| **decimal.js** | Financial math | Exact decimal precision, avoiding float rounding errors |
| **Puppeteer** | PDF export | High-fidelity HTML→PDF with embedded Arabic fonts |
| **ExcelJS** | Excel export | Professional formatting with RTL, colors, and fonts |
| **next-themes** | Theming | Flicker-free dark/light switching with persisted preference |
| **lucide-react** | Icons | Lightweight, customizable icon set |
| **shadcn/ui + Radix UI** | Components | Accessible, unstyled primitives (Dialog, Select, Tabs, Toast, etc.) |
| **Cairo / Tajawal** | Fonts | Modern Arabic UI font and professional print font |

---

## Architecture

The app follows Next.js App Router conventions: Server Components fetch data directly through Prisma, mutations run through Server Actions, and specialized operations (auth, exports, backup, health) live in API routes. Route protection is centralized in a single Middleware file.

### Project Structure

```
FleetTrack-Logistics/
├── prisma/
│   ├── schema.prisma              # Database schema (8 models)
│   ├── seed.mjs                   # Demo seed data
│   ├── migrations/                # Prisma migrations
│   └── dev.db                     # SQLite database
├── public/
│   └── fonts/                     # Embedded Arabic fonts (Tajawal) for reports
├── src/
│   ├── app/
│   │   ├── (app)/                 # Protected pages (require authentication)
│   │   │   ├── page.tsx           # Dashboard
│   │   │   ├── trucks/            # Truck management
│   │   │   ├── employees/         # Employee management
│   │   │   ├── revenues/          # Revenue management
│   │   │   ├── expenses/          # Expense management
│   │   │   ├── payroll/           # Payroll management
│   │   │   ├── reports/           # Financial reports
│   │   │   ├── settings/          # Company settings & profile
│   │   │   ├── activity/          # Activity log
│   │   │   └── search/            # Global search
│   │   ├── api/
│   │   │   ├── auth/login/        # Login route
│   │   │   ├── backup/            # Backup export/import
│   │   │   ├── health/            # System health check
│   │   │   └── reports/
│   │   │       ├── pdf/           # PDF report export
│   │   │       └── excel/         # Excel report export
│   │   ├── login/                 # Login page
│   │   ├── layout.tsx             # Root layout (fonts, theme script)
│   │   └── globals.css            # Global styles + theme variables
│   ├── components/
│   │   ├── layout/                # App shell (Sidebar, Topbar, Breadcrumb)
│   │   ├── dashboard/             # Dashboard widgets and charts
│   │   ├── trucks/                # Truck components (table, kanban, form, detail)
│   │   ├── employees/             # Employee components
│   │   ├── revenues/              # Revenue components
│   │   ├── expenses/              # Expense components
│   │   ├── payroll/               # Payroll components
│   │   ├── reports/               # Report components
│   │   ├── settings/              # Settings components
│   │   ├── activity/              # Activity log components
│   │   ├── theme-provider.tsx     # Light/dark theme provider
│   │   └── ui/                    # shadcn/ui primitives
│   ├── lib/
│   │   ├── auth.ts                # scrypt password hashing & default user
│   │   ├── auth-actions.ts        # Authentication server actions
│   │   ├── session.ts             # Session management (HMAC SHA-256)
│   │   ├── prisma.ts              # Prisma client + activity-log middleware
│   │   ├── money.ts               # Currency conversion & formatting (decimal.js)
│   │   ├── validation.ts          # Amount/date validation helpers
│   │   ├── constants.ts           # Enums (truck status, roles, revenue types)
│   │   ├── compute-reports.ts     # Financial report computations
│   │   ├── reports-data.ts        # Report data aggregation
│   │   ├── pdf-export.ts          # PDF generation (Puppeteer)
│   │   ├── excel-export.ts        # Excel generation (ExcelJS)
│   │   ├── theme.ts               # Dynamic theme CSS variables
│   │   ├── upload.ts              # File upload helpers
│   │   └── utils.ts               # Shared utilities
│   └── middleware.ts              # Session-based route protection
├── seed-demo.mjs                  # Optional demo data seeder
├── dev.db                         # SQLite database (file:./dev.db)
├── .env.example                   # Environment variable template
└── package.json
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     UI (React)                               │
│   Server Components ←→ Client Components ("use client")      │
└───────────────────────────────┬─────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────┐
│            Server Actions / API Routes                       │
│   src/app/(app)/*/actions.ts   ↔   src/app/api/*             │
└───────────────────────────────┬─────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────┐
│                    Prisma ORM (Client)                       │
│   prisma.ts — PrismaClient + activity-log middleware         │
└───────────────────────────────┬─────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────┐
│               SQLite Database (dev.db)                       │
│                libsql adapter (file:./dev.db)                │
└─────────────────────────────────────────────────────────────┘
```

### Data Model Notes

The Prisma schema defines **8 models**: `Truck`, `Employee`, `TruckDriverAssignment`, `ExpenseCategory`, `Revenue`, `Expense`, `Payroll`, `CompanySettings`, plus `SystemUser` (authentication) and `ActivityLog` (audit trail).

- **Money**: All amounts are stored as integers in the smallest currency unit (fils/paisa = 1/100). For example, `123456` = `1234.56`. All calculations go through `decimal.js`.
- **Soft delete**: Every business entity supports soft deletion via a `deletedAt` field instead of hard deletion.
- **Indexes**: High-frequency query fields (`truckId`, `date`, `month`, `deletedAt`, `status`) are indexed.
- **Unique constraints**: `@@unique([employeeId, month])` on `Payroll` prevents duplicate payroll records per employee per month.

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 20 (built with Node 24)
- **npm** (or yarn / pnpm)
- Any OS supporting `file:` URIs (Windows / macOS / Linux)

### Setup

```bash
# 1. Clone the repository
git clone <repository-url>
cd FleetTrack-Logistics

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# or create .env manually (see "Environment Variables" below)

# 4. Create and migrate the database
npx prisma migrate dev
# or, if you prefer pushing the schema directly:
npx prisma db push

# 5. (Optional) Seed demo data — creates trucks, employees, and financial data
node seed-demo.mjs

# 6. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Default credentials:** username `admin`, password `admin123`.
> **⚠️ Change the default password immediately before real use** from the Settings page.

### Production

```bash
npm run build
npm run start
```

### Environment Variables

Create a `.env` file in the project root:

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | SQLite database file path | `file:./dev.db` |
| `AUTH_SECRET` | HMAC session signing secret (≥ 32 chars) | *(required in production)* |

```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="a-random-secret-string-at-least-32-characters-long"
```

---

## Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `next dev` | Start the development server with hot reload |
| `build` | `next build` | Create a production build |
| `start` | `next start` | Start the production server |
| `lint` | `eslint` | Run ESLint across the codebase |

---

## Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change, then submit a pull request. Make sure your code passes `npm run lint` and `npm run build` before requesting a review.

## License

This project is licensed under the [MIT License](LICENSE).

## Security

Found a security vulnerability? Do **not** open a public issue. Report it privately by emailing the repository maintainer — see the [Security policy](SECURITY.md) for details. Passwords are hashed with scrypt, sessions are signed and expire after 7 days, and all routes are protected by Middleware.

---

**Built with Next.js 16 + Prisma 7 + SQLite + Tailwind CSS v4**
