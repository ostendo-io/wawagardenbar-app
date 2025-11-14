## Wawa Cafe Web App Development Project

### Project Overview

Build a comprehensive, full-stack food ordering platform for Wawa Cafe. The entire application (frontend, backend, and admin dashboard) will be built as a single, unified **Next.js 14+ (App Router)** project.

The application will be a **mobile-first, responsive web app** that facilitates table service, pickup, and delivery orders. It will be built following a strict set of modern architectural principles, including a Server-Component-first philosophy, a clear separation of concerns, and a type-safe codebase.

---

### Core Features Required

#### 1. User Interface & Experience
* **Welcome Screen:** Wawa Cafe branding with order type selection (responsive).
* **Authentication Options:**
    * **Sign In / Register (Passwordless):** Users register/log in via email. A mandatory 4-digit PIN is sent to their email for verification.
    * **Continue as Guest:** Anonymous checkout.
* **Order Type Selection:** Dine-in, Pickup, Delivery.
* **Menu Navigation:** Intuitive category-based Browse.
* **Shopping Cart:** Real-time order summary.
* **Order Tracking:** Live status updates.

#### 2. Menu Categories & Items
* **Drinks Category:** Beer (Local, Imported, Craft), Wine, Soft Drinks.
* **Food Category:** Starters, Main Courses, Desserts.
* **Menu Item Details:** High-quality images, descriptions, pricing, customization, availability.

#### 3. Ordering System
* **Table Service:** Table number input/QR code scanning.
* **Pickup Orders:** Customer details and preferred pickup time.
* **Delivery Orders:** Address input with delivery radius validation.
* **Special Instructions:** Text field for dietary requirements.
* **Order Modification:** Ability to edit orders before confirmation.

#### 4. Payment Integration
* **Monnify One-Time Payments** with the following methods:
    * Pay with Card
    * Pay with Transfer
    * Pay with USSD
    * Pay with Phone Number
* Payment security with encryption and tokenization.
* Webhook integration for payment confirmations.

#### 5. Order Management & Communication
* **Order Confirmation:** Immediate confirmation.
* **Wait Time Estimation:** Dynamic timing.
* **Status Updates:** Real-time notifications (Order received $\rightarrow$ Preparing $\rightarrow$ Ready $\rightarrow$ Delivered).
* **Random Rewards System:** Configurable spend thresholds trigger random benefits (discounts, free items, etc.).
* **Issue Resolution:** Contact, report issues, request modifications, cancel order.

#### 6. Admin Dashboard
* **Location:** Built as part of the application, located under the `/app/dashboard` route group.
* **Inventory Management:** Add/edit/remove items, stock tracking, bulk import/export.
* **Order Management:** Live order queue, kitchen display integration, order history.
* **Customer Management:** User profiles, order history, loyalty program.
* **Rewards Configuration:** Set spend thresholds, configure reward types, track redemptions.
* **Analytics Dashboard:** Sales reports, popular items, peak hours, revenue tracking.
* **Settings Management:** Restaurant hours, delivery radius, payment toggles.

---

### Technical & Architectural Requirements

#### 1. General Architecture & Code Standards
* **Architecture:** The project must use the **Next.js App Router**.
* **Code Style:** Follow the **Airbnb Style Guide**.
* **Principles:** Adhere to **S.O.L.I.D** principles.
* **TypeScript:** The entire codebase must be in TypeScript.
    * Prefer **interfaces over types**.
    * **Avoid `any`**.
    * All variables, functions (parameters and returns) must be explicitly typed.
* **Exports:** Use **named exports** for components. One export per file.
* **Naming:**
    * Files & Directories: **kebab-case** (e.g., `auth-wizard`).
    * Components & Interfaces: `PascalCase`.
    * Variables & Functions: `camelCase`.
* **File Structure:**
    * `/app/dashboard`: Admin panel pages.
    * `/app/api`: API Route Handlers.
    * `/services`: Backend business logic.
    * `/models`: Mongoose database models.
    * `/hooks`: Client-side React hooks.
    * `/interfaces`: Shared types and interfaces.
    * `/lib`: Utility functions, DB connection (`mongodb.ts`).
    * `/components/ui`: Shadcn UI components.
    * `/components/shared`: Reusable application components.

#### 2. Frontend (Client Components)
* **RSC First:** **Minimize 'use client'**. Favor Server Components for fetching and rendering. Client components should be small, interactive "islands."
* **UI Framework:** **Shadcn UI**, **Radix UI**, and **Tailwind CSS**. No other UI libraries (like MUI or Chakra) are permitted.
* **State Management:**
    * **Server State:** Managed by **React Server Components (RSC)**.
    * **Client URL State:** Managed with **`nuqs`**.
    * **Global Client State:** Managed with **Zustand** (use sparingly).
    * **Local Client State:** Managed with **React Context** or `useState`.
* **Data Fetching (Client):** Use **TanStack Query (react-query)** for managing client-side asynchronous state and caching.
* **Form Handling:** Use **React Hook Form** for all forms.
* **Validation:** Use **Zod** for all schema-based validation (client and server).
* **Icons:** Use **lucide-react** for all icons.
* **Suspense:** All client components and data streams must be wrapped in `<Suspense>` with an appropriate fallback (e.g., skeleton loader).

#### 3. Backend (Server Components, Actions, & Routes)
* **Framework:** All backend logic resides *within* the Next.js application. **No separate Express.js server.**
* **Database:** **MongoDB** with **Mongoose ODM**. Connection logic in `/lib/mongodb.ts`.
* **Business Logic:**
    * **Services (`/services`)** will contain all business logic and database operations (e.g., `ProductService`).
    * **API Routes (`/app/api`)** must call services and not access Mongoose models directly.
    * **Hooks (`/hooks`)** must call API routes (using TanStack Query), not services directly.
* **Mutations:** All data mutations (create, update, delete) must be handled via **Server Actions**, preferably with `useFormState` from React Hook Form.
* **Authentication:** Implement a secure, session-based system (e.g., using `iron-session`) for the passwordless PIN flow.
* **Email Service:** **Zoho (via Nodemailer)**. All email sending logic will be encapsulated within a **Server Action** or a private API route.
* **File Storage (Self-Hosted):**
    * Menu image uploads will be handled via a **Server Action** processing `FormData`.
    * Files will be saved to the server's file system (e.g., `./public/uploads/images/`).
    * Files will be served statically via Next.js's `public` directory.
* **Webhooks:** Payment confirmations from Monnify will be handled by a dedicated **API Route Handler** at `/app/api/webhooks/monnify`.
* **Real-time Updates:** Use **Socket.io** for live order status updates (this can be integrated with the Next.js custom server or run as a minimal standalone process).

---

### Database Schema (MongoDB Collections)

* **Users Collection:** User ID, name, **email (unique, verified)**, phone, addresses, payment methods, total spent, rewards earned.
* (Other collections remain the same: Menu Items, Orders, Payments, Rewards, Reward Rules, Inventory)

---

### User & Order Flows

*(This section remains unchanged as it defines business logic, not technical implementation.)*

#### User Registration & Login Flow (Passwordless)
1.  Open website $\rightarrow$ Select "Sign In / Register".
2.  Enter email $\rightarrow$ Submit (triggers a Server Action).
3.  Backend sends a 4-digit PIN to the email.
4.  User is prompted to enter the 4-digit PIN.
5.  User enters PIN $\rightarrow$ Backend verifies it.
6.  On success, a session is created, and the user is logged in.

#### Dine-in Order Flow
1.  Open website $\rightarrow$ Select "Dine-in" $\rightarrow$ Scan QR or enter table.
2.  Browse menu $\rightarrow$ Add items to cart.
3.  Review order $\rightarrow$ Select payment method.
4.  Complete payment $\rightarrow$ Receive confirmation.
5.  Track order status $\rightarrow$ Food delivered to table.

#### Delivery Order Flow
1.  Open website $\rightarrow$ Select "Delivery" $\rightarrow$ Enter/confirm address.
2.  Browse menu $\rightarrow$ Customize items.
3.  Checkout $\rightarrow$ Choose payment method.
4.  Order confirmation $\rightarrow$ Track delivery.
5.  Receive order $\rightarrow$ Rate experience.

---

### Deployment Requirements

* **Application Deployment:** The entire full-stack **Next.js application** will be deployed to a single hosting platform optimized for Next.js, such as **Vercel** or **Netlify**.
* **Domain:** Custom domain for API endpoints.
* **SSL Certificates:** HTTPS encryption for all communications.
* **Monitoring:** Application performance monitoring (APM).
* **Analytics:** User behavior tracking for business insights.

---

### Testing Strategy

* **Unit Tests:** Component and function testing (e.g., with Jest/Vitest).
* **Integration Tests:** API endpoint and Server Action testing.
* **End-to-End Tests:** Complete user journey testing (e.g., with Playwright or Cypress).
* **Payment Testing:** Test all payment methods in sandbox mode.
* **Performance Testing:** Load testing for peak hours.
* **Security Testing:** Penetration testing for vulnerabilities.

---

### Launch Preparation

* Beta Testing: Internal testing with restaurant staff.
* Soft Launch: Limited customer testing.
* Staff Training: Restaurant team training on order management.
* Marketing Materials: Promotional materials for the web platform.
* Customer Support: Help documentation and support channels.

---

### Success Metrics

* Order completion rate
* Payment success rate
* Average order value
* Customer retention rate
* Order processing time
* Customer satisfaction scores

---

### Budget Considerations

* Development team costs (**full-stack Next.js developers**).
* Third-party service fees (payment gateways, cloud hosting).
* Marketing and promotion costs.
* Ongoing maintenance and updates.
