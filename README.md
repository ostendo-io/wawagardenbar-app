# Wawa Garden Bar

A comprehensive food ordering platform built with Next.js 14+ App Router, featuring dine-in, pickup, and delivery options.

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript (Strict Mode)
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn UI + Radix UI
- **Database:** MongoDB with Mongoose ODM
- **State Management:** Zustand, nuqs, React Context
- **Forms:** React Hook Form + Zod
- **Data Fetching:** TanStack Query
- **Authentication:** Iron Session (Passwordless)
- **Payments:** Monnify (Card, Transfer, USSD, Phone)
- **Email:** Zoho via Nodemailer
- **Real-time:** Socket.io

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth route group
│   ├── (customer)/        # Customer route group
│   ├── dashboard/         # Admin dashboard
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/
│   ├── ui/                # Shadcn UI components
│   └── shared/            # Shared app components
├── services/              # Business logic
├── models/                # Mongoose models
├── hooks/                 # React hooks
├── interfaces/            # TypeScript interfaces
├── lib/                   # Utilities
│   ├── mongodb.ts         # Database connection
│   └── utils.ts           # Helper functions
└── public/
    └── uploads/           # File uploads
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account or local MongoDB
- Monnify merchant account

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials.

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Install Shadcn UI Components

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add form
npx shadcn-ui@latest add input
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add toast
```

## Development Guidelines

### Code Style

- Follow Airbnb Style Guide
- Use TypeScript strict mode (no `any`)
- Prefer interfaces over types
- Use named exports
- Keep functions under 20 lines
- Use kebab-case for files/directories
- Use camelCase for variables/functions
- Use PascalCase for components/interfaces

### Architecture Principles

- **Server Components First:** Minimize `use client`
- **Mobile-First:** Responsive design from the start
- **Type Safety:** Explicit types for all functions
- **Separation of Concerns:**
  - Services handle business logic
  - API routes call services
  - Hooks call API routes
  - Components use hooks

### File Organization

- One export per file
- Structure: component → subcomponents → utils → interfaces
- No blank lines within functions
- Use JSDoc for public methods

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Features

### Customer Features
- Passwordless authentication (email + PIN)
- Guest checkout
- Menu browsing by category
- Shopping cart with customizations
- Multiple payment methods
- Order tracking
- Random rewards system

### Admin Features
- Inventory management
- Order management
- Customer management
- Analytics dashboard
- Rewards configuration
- Settings management

## Payment Integration

Using Monnify for payments with four methods:
- Pay with Card
- Pay with Transfer
- Pay with USSD
- Pay with Phone Number

See `monnify-integration-guide.md` for detailed implementation.

## Environment Variables

See `.env.local.example` for all required environment variables.

## License

Private - All Rights Reserved
