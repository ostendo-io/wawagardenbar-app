# Wawa Garden Bar Deliverables Strategy

## Executive Summary
This document outlines the strategic approach for delivering the Wawa Cafe Web App through IDE-based vibe coding, following Next.js 14+ App Router architecture with a Server-Component-first philosophy.

---

## Pre-Development Preparation

### 1. **Environment Setup** (Priority: CRITICAL)
- [ ] Initialize Next.js 14+ project with App Router
- [ ] Configure TypeScript with strict mode
- [ ] Set up ESLint with Airbnb style guide
- [ ] Configure Prettier for consistent formatting
- [ ] Install and configure Tailwind CSS
- [ ] Set up Shadcn UI components library
- [ ] Create `.env.local` with required environment variables

### 2. **Development Infrastructure** (Priority: CRITICAL)
- [ ] Set up MongoDB Atlas or local MongoDB instance
- [ ] Configure MongoDB connection in `/lib/mongodb.ts`
- [ ] Set up Zoho email service credentials
- [ ] Configure Monnify test API keys
- [ ] Set up Monnify payment methods (Card, Transfer, USSD, Phone Number)
- [ ] Create project file structure according to requirements

### 3. **Design System Preparation** (Priority: HIGH)
- [ ] Define color palette and design tokens
- [ ] Create Figma/design mockups for key screens
- [ ] Prepare Wawa Cafe brand assets (logos, fonts)
- [ ] Define responsive breakpoints
- [ ] Create loading skeleton templates
- [ ] Define animation and transition standards

### 4. **Data Architecture** (Priority: HIGH)
- [ ] Design complete MongoDB schema
- [ ] Create TypeScript interfaces for all entities
- [ ] Define Zod validation schemas
- [ ] Document API endpoint structure
- [ ] Plan real-time event architecture (Socket.io)

---

## Phase 1: Foundation (Week 1-2)

### Feature 1.1: Project Scaffold & Configuration
**Priority:** P0 - Blocker  
**Dependencies:** None  
**Prompt:**
```
Create a Next.js 14+ project with App Router, TypeScript strict mode, and the following structure:
- /app (with route groups for (auth), (customer), dashboard)
- /components (with /ui for shadcn and /shared for app components)
- /services, /models, /hooks, /interfaces, /lib
- Configure MongoDB connection in /lib/mongodb.ts
- Set up ESLint with Airbnb config and Prettier
- Install: shadcn-ui, radix-ui, tailwindcss, lucide-react, mongoose, zod, react-hook-form, tanstack-query, nuqs, zustand
- Create base layout with mobile-first responsive design
```

### Feature 1.2: Database Models & Interfaces
**Priority:** P0 - Blocker  
**Dependencies:** 1.1  
**Prompt:**
```
Create Mongoose models and TypeScript interfaces for:
1. User model with passwordless auth fields (email, verificationPin, sessionToken)
2. MenuItem model with categories, customizations, and pricing
3. Order model with status tracking and order types
4. Payment model supporting multiple payment methods
5. Rewards and RewardRules models for the random rewards system
6. Inventory model for stock management
All models in /models, interfaces in /interfaces, following TypeScript strict typing
```

### Feature 1.3: Authentication System (Passwordless)
**Priority:** P0 - Blocker  
**Dependencies:** 1.2  
**Prompt:**
```
Implement passwordless authentication system:
1. Create Server Actions for email/PIN authentication in /app/actions/auth
2. Set up iron-session for session management
3. Create auth API routes in /app/api/auth
4. Build email service using Zoho/Nodemailer for PIN delivery
5. Create AuthContext for client-side auth state
6. Implement guest checkout flow
Use Server Components by default, minimal 'use client' for PIN input form
```

### Feature 1.4: Base UI Components
**Priority:** P1 - Critical  
**Dependencies:** 1.1  
**Prompt:**
```
Set up Shadcn UI components and create shared components:
1. Install all necessary shadcn components (button, form, input, card, dialog, etc.)
2. Create responsive navigation component with mobile menu
3. Build loading skeletons for all major sections
4. Create error boundary components
5. Implement toast notification system
6. Build reusable form components with React Hook Form integration
All components must follow the mobile-first approach with Tailwind CSS
```

---

## Phase 2: Core Customer Experience (Week 3-4)

### Feature 2.1: Welcome & Order Type Selection
**Priority:** P1 - Critical  
**Dependencies:** Phase 1  
**Prompt:**
```
Create the welcome screen and order type selection:
1. Build RSC welcome page at /app/page.tsx with Wawa Cafe branding
2. Implement order type selection (Dine-in, Pickup, Delivery) using Server Components
3. For Dine-in: QR scanner component and table number input
4. For Delivery: Address input with radius validation
5. For Pickup: Time selection component
6. Use nuqs for URL state management of order type
Minimize client components, use Server Actions for form submissions
```

### Feature 2.2: Menu Display System
**Priority:** P1 - Critical  
**Dependencies:** 2.1  
**Prompt:**
```
Build the menu browsing system:
1. Create CategoryService in /services for menu data fetching
2. Build menu page at /app/menu using RSC with Suspense boundaries
3. Implement category navigation (Drinks: Beer/Wine/Soft, Food: Starters/Mains/Desserts)
4. Create MenuItem component with image optimization using Next.js Image
5. Build item detail modal with customization options
6. Implement availability checking and real-time stock updates
Use parallel data fetching, implement proper caching with revalidate
```

### Feature 2.3: Shopping Cart System
**Priority:** P1 - Critical  
**Dependencies:** 2.2  
**Prompt:**
```
Implement shopping cart functionality:
1. Create CartContext using Zustand for client-side cart state
2. Build cart sidebar component with item management
3. Implement Server Actions for cart operations (add, update, remove)
4. Create order summary component with pricing calculations
5. Add special instructions field for dietary requirements
6. Implement cart persistence using localStorage
Keep cart UI as RSC where possible, only interactive elements as client components
```

### Feature 2.4: Checkout & Payment Integration
**Priority:** P1 - Critical  
**Dependencies:** 2.3  
**Prompt:**
```
Build checkout and payment system using Monnify:
1. Create multi-step checkout flow using React Hook Form
2. Integrate Monnify SDK for one-time payments (https://developers.monnify.com/docs/collections/one-time-payment)
3. Implement four payment methods:
   - Pay with Card
   - Pay with Transfer
   - Pay with USSD
   - Pay with Phone Number
4. Build PaymentService in /services for Monnify API integration
5. Create webhook handler at /app/api/webhooks/monnify for payment confirmations
6. Implement payment security with encryption and proper API key management
7. Add payment method selection UI with clear instructions for each method
Use Server Actions for payment initialization, minimize client-side payment logic
```

---

## Phase 3: Order Management & Tracking (Week 5-6)

### Feature 3.1: Order Processing System
**Priority:** P1 - Critical  
**Dependencies:** Phase 2  
**Prompt:**
```
Create order processing workflow:
1. Build OrderService in /services for order CRUD operations
2. Implement Server Actions for order creation and updates
3. Create order confirmation page with dynamic wait time estimation
4. Build order status tracking component (Received → Preparing → Ready → Delivered)
5. Set up Socket.io integration for real-time status updates
6. Create order history page at /app/orders
Use RSC for order display, WebSocket client component for real-time updates only
```

### Feature 3.2: Random Rewards System
**Priority:** P2 - High  
**Dependencies:** 3.1  
**Prompt:**
```
Implement the random rewards system:
1. Create RewardsService with configurable spend thresholds
2. Build reward calculation logic with random benefit selection
3. Implement reward types: discounts, free items, loyalty points
4. Create reward notification component
5. Build reward redemption flow at checkout
6. Add rewards tracking to user profile
Use Server Actions for reward calculations to prevent client-side manipulation
```

### Feature 3.3: Customer Communication
**Priority:** P2 - High  
**Dependencies:** 3.1  
**Prompt:**
```
Build customer communication features:
1. Implement email notifications using Server Actions
2. Create in-app notification system with toast messages
3. Build order modification request component
4. Implement order cancellation with refund logic
5. Create contact/support form with issue categories
6. Add order rating and feedback system
Keep all email sending server-side, use optimistic UI updates for better UX
```

---

## Phase 4: Admin Dashboard (Week 7-8)

### Feature 4.1: Admin Authentication & Layout
**Priority:** P1 - Critical  
**Dependencies:** Phase 1  
**Prompt:**
```
Create admin dashboard foundation:
1. Build admin layout at /app/dashboard/layout.tsx
2. Implement role-based authentication middleware
3. Create admin navigation sidebar at /app-nav
4. Build dashboard home with key metrics overview
5. Implement admin user management
6. Set up audit logging for admin actions
Use route groups for admin routes, implement proper authorization checks
```

### Feature 4.2: Menu & Inventory Management
**Priority:** P1 - Critical  
**Dependencies:** 4.1  
**Prompt:**
```
Build admin menu and inventory system:
1. Create menu item CRUD interface at /app/dashboard/menu
2. Implement image upload with Server Actions saving to /public/uploads
3. Build bulk import/export functionality (CSV/JSON)
4. Create real-time inventory tracking dashboard
5. Implement low stock alerts and automatic reordering suggestions
6. Add category management interface
Use Server Components for lists, Server Actions for mutations
```

### Feature 4.3: Order Management Dashboard
**Priority:** P1 - Critical  
**Dependencies:** 4.1  
**Prompt:**
```
Create order management system:
1. Build live order queue at /app/dashboard/orders
2. Implement kitchen display system integration
3. Create order filtering and search functionality
4. Build order status management interface
5. Implement batch order operations
6. Add order analytics and reporting
Use real-time updates with Socket.io, implement virtualization for large lists
```

### Feature 4.4: Analytics & Reporting
**Priority:** P2 - High  
**Dependencies:** 4.1, 4.2, 4.3  
**Prompt:**
```
Build analytics dashboard:
1. Create AnalyticsService for data aggregation
2. Build sales reports with date range filters
3. Implement popular items analysis
4. Create peak hours heatmap
5. Build revenue tracking with payment method breakdown
6. Add customer retention metrics
Use server-side data processing, implement data visualization with lightweight charts
```

### Feature 4.5: Settings & Configuration
**Priority:** P2 - High  
**Dependencies:** 4.1  
**Prompt:**
```
Create settings management:
1. Build restaurant hours configuration
2. Implement delivery radius settings
3. Create payment method toggles
4. Build reward rules configuration interface
5. Add email template management
6. Implement feature flags for A/B testing
Store settings in database, use Server Actions for updates
```

---

## Phase 5: Optimization & Polish (Week 9-10)

### Feature 5.1: Performance Optimization
**Priority:** P1 - Critical  
**Dependencies:** All previous phases  
**Prompt:**
```
Optimize application performance:
1. Implement route prefetching strategies
2. Add image optimization with WebP and lazy loading
3. Optimize bundle size with dynamic imports
4. Implement Redis caching for frequently accessed data
5. Add CDN integration for static assets
6. Optimize database queries with proper indexing
Focus on Core Web Vitals (LCP, CLS, FID), use Lighthouse for benchmarking
```

### Feature 5.2: SEO & Metadata
**Priority:** P2 - High  
**Dependencies:** Phase 2  
**Prompt:**
```
Implement SEO optimizations:
1. Add dynamic metadata generation for all pages
2. Create XML sitemap at /app/sitemap.xml
3. Implement JSON-LD structured data for menu items
4. Add OpenGraph tags for social sharing
5. Create robots.txt with proper crawling rules
6. Implement canonical URLs for duplicate content
Use Next.js metadata API, ensure all pages are SEO-friendly
```

### Feature 5.3: Progressive Web App
**Priority:** P3 - Medium  
**Dependencies:** Phase 2, 3  
**Prompt:**
```
Convert to Progressive Web App:
1. Create web app manifest
2. Implement service worker for offline functionality
3. Add push notification support
4. Create app install prompt
5. Implement background sync for orders
6. Add offline menu browsing capability
Ensure PWA scores 100 in Lighthouse PWA audit
```

---

## Phase 6: Testing & Deployment (Week 11-12)

### Feature 6.1: Testing Implementation
**Priority:** P1 - Critical  
**Dependencies:** All features  
**Prompt:**
```
Implement comprehensive testing:
1. Set up Jest/Vitest for unit testing
2. Create component tests for all UI components
3. Write integration tests for API routes and Server Actions
4. Implement E2E tests with Playwright for critical user flows
5. Add payment gateway testing in sandbox mode
6. Create load testing scripts for peak hour simulation
Aim for 80% code coverage, focus on critical business logic
```

### Feature 6.2: Deployment Setup
**Priority:** P1 - Critical  
**Dependencies:** 6.1  
**Prompt:**
```
Prepare for production deployment:
1. Configure environment variables for production
2. Set up CI/CD pipeline with GitHub Actions
3. Configure Vercel/Netlify deployment
4. Implement monitoring with Sentry or similar
5. Set up backup strategies for database
6. Create deployment documentation
Ensure zero-downtime deployments, implement rollback procedures
```

---

## Success Metrics & KPIs

1. **Performance Metrics:**
   - Page Load Time < 2 seconds
   - Time to Interactive < 3 seconds
   - Lighthouse Score > 90

2. **Business Metrics:**
   - Order Completion Rate > 85%
   - Payment Success Rate > 95%
   - Cart Abandonment Rate < 20%

3. **User Experience Metrics:**
   - Customer Satisfaction Score > 4.5/5
   - Average Order Processing Time < 15 minutes
   - Mobile Conversion Rate > 3%

---

## Risk Mitigation Strategies

1. **Technical Risks:**
   - Maintain fallback payment methods
   - Implement graceful degradation for features
   - Create comprehensive error handling

2. **Business Risks:**
   - Soft launch with limited menu items
   - Beta test with staff before public launch
   - Maintain manual order backup system

3. **Security Risks:**
   - Regular security audits
   - Implement rate limiting
   - Use secure session management

---

## Development Best Practices Checklist

- [ ] All code follows Airbnb Style Guide
- [ ] TypeScript strict mode enabled
- [ ] No use of `any` type
- [ ] Interfaces preferred over types
- [ ] Server Components used by default
- [ ] Minimal `use client` directives
- [ ] All forms use React Hook Form
- [ ] Validation with Zod schemas
- [ ] Server Actions for mutations
- [ ] TanStack Query for client fetching
- [ ] Proper Suspense boundaries
- [ ] Mobile-first responsive design
- [ ] Accessibility standards met
- [ ] Performance budgets maintained
- [ ] Security best practices followed

---

## Timeline Summary

- **Week 1-2:** Foundation & Infrastructure
- **Week 3-4:** Core Customer Experience
- **Week 5-6:** Order Management & Tracking
- **Week 7-8:** Admin Dashboard
- **Week 9-10:** Optimization & Polish
- **Week 11-12:** Testing & Deployment

**Total Estimated Duration:** 12 weeks for MVP

---

## Notes for Vibe Coding

1. **Start each session** by reviewing the current phase and feature
2. **Use the prompts** as conversation starters, adapt based on context
3. **Always verify** that generated code follows the rules in `.windsurf/rules`
4. **Test incrementally** after each feature implementation
5. **Commit frequently** with descriptive messages
6. **Document decisions** for future reference
7. **Prioritize RSC** and minimize client components
8. **Focus on mobile-first** responsive design
9. **Maintain type safety** throughout the codebase
10. **Keep performance** as a constant consideration

---

*This strategy document should be treated as a living document and updated as the project evolves.*
