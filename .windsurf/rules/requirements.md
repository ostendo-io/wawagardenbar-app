---
trigger: always_on
---

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
* **Customer Rewards Dashboard:** (`/profile/rewards`)
    * **Statistics Overview:** Display active rewards count, total earned, total savings (₦), and loyalty points balance
    * **Active Rewards Tab:** View all active rewards with:
      - Reward code display
      - Reward type and value (percentage discount, fixed discount, free item, loyalty points)
      - Expiry date with visual warnings (expires today, expires in X days)
      - Action buttons (Use Now, Apply at Checkout)
      - Visual distinction for expiring rewards
    * **Reward History Tab:** View past rewards with:
      - Reward details (type, value, code)
      - Status badges (Active, Redeemed, Expired)
      - Earned and redeemed dates
      - Chronological listing
    * **Empty States:** Helpful messages and call-to-action when no rewards available
    * **Loyalty Points Conversion:** Display points value (100 points = ₦1)

##### Site Navigation Permissions
* **Main Navigation Bar:**
    * **All Users (Customer, Admin, Super-Admin):** Access to Home, Menu, Orders, and Rewards links
    * **Admin & Super-Admin Only:** Additional "Dashboard" link visible in main navigation
    * **Customer Role:** Dashboard link is hidden and dashboard routes are inaccessible
* **Dashboard Sections Access Control:**
    * **Customer Role:** No access to any dashboard sections (redirected if attempting to access)
    * **Admin Role:** Access to the following dashboard sections only:
      - Order Management
    * **Admin Role - Restricted Sections:** The following sections are NOT accessible to admin role:
      - Menu Management
      - Customer Management
      - Inventory Management
      - Rewards Configuration
      - Analytics Dashboard
      - Audit Logs
      - Settings Management
    * **Super-Admin Role:** Full access to all dashboard sections including:
      - Menu Management
      - Order Management
      - Customer Management
      - Inventory Management
      - Rewards Configuration
      - Analytics Dashboard
      - Audit Logs
      - Settings Management
* **Implementation Requirements:**
    * Role-based middleware to check permissions on dashboard routes
    * Conditional rendering of navigation items based on user role
    * Proper error pages (403 Forbidden) when users attempt to access restricted sections
    * Role information stored in user session and database
    * Dashboard sidebar navigation must hide restricted sections for admin users

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
* **Menu Management:**
  - **Menu Items List** (`/dashboard/menu`)
    - Table/grid view with image thumbnails, name, category, price, prep time, status
    - Search by name or category
    - Filter by category and availability status
    - Sort by name, price, category, or date
    - Quick actions dropdown (Edit, Upload Image, Toggle Status, Delete)
    - Bulk operations (status updates, deletion)
    - Add new item button
  - **Edit Menu Item** (`/dashboard/menu/[itemId]/edit`)
    - Basic information: name, description, category, subcategory, price, prep time, serving size
    - Image management: upload, preview, crop, delete (saved to `/public/uploads/menu-items/`)
    - Availability settings: available toggle, out of stock toggle, display priority
    - Customization options builder: groups (Size, Add-ons, Extras) with single/multi-select, price modifiers
    - Inventory tracking management:
      - Track inventory toggle (enable/disable inventory tracking)
      - Editable fields when enabled: current stock, minimum stock, maximum stock
      - Unit type (bottles, portions, kg, etc.)
      - Cost per unit (for profit tracking)
      - Supplier name
      - Prevent orders when out of stock toggle
      - Link to full inventory details & history (if inventory exists)
      - Automatic inventory record creation/update on save
    - Dietary information: dietary tags (vegetarian, vegan, gluten-free), allergen warnings, spice level, calories
    - SEO metadata: slug, meta description, tags
    - Action buttons: Save, Save & Continue, Cancel, Delete, Preview, Duplicate
    - Audit trail: created by, last modified by, edit history
    - Form validation with inline errors
    - Unsaved changes warning
  - **Create Menu Item** (`/dashboard/menu/new`)
    - Same form as edit page with default values
    - Redirect to edit page after creation
* **Inventory Management:** Stock tracking, bulk import/export, low stock alerts.
* **Order Management:** 
  - **Order Queue** (`/dashboard/orders`)
    - Live order queue with real-time updates via Socket.IO
    - Order filtering by status (All, Active, Pending, Confirmed, Preparing, Ready, Completed)
    - Search orders by order number, customer name, or items
    - Batch operations (bulk status updates, bulk cancellation)
    - Quick actions (Start Preparing, Mark Ready, Complete, Cancel)
    - Order statistics cards (Total, Pending, Preparing, Completed, Revenue)
    - Export orders to CSV
  - **Order Details Page** (`/dashboard/orders/[orderId]`)
    - Comprehensive order information display
    - Order header with status, order number, type, and timestamps
    - Customer information (name, email, phone, delivery address for delivery orders)
    - Itemized order details with quantities, prices, and customizations
    - Special instructions display
    - Payment information (method, status, reference, amount)
    - Order timeline showing status history with timestamps and notes
    - Status management actions (transition to next status, cancel order)
    - Add notes to order
    - Print order receipt
    - Contact customer (email/phone links)
    - Real-time status updates via Socket.IO
    - Navigation back to order queue
  - **Kitchen Display Integration**
    - Real-time order notifications
    - Order status synchronization
* **Customer Management:** User profiles, order history, loyalty program.
* **Rewards Configuration:** 
  - **Reward Rules Management** (`/dashboard/rewards/rules`)
    - Create, edit, delete reward rules via UI
    - Configure spend thresholds (₦ minimum amount to qualify)
    - Set reward types: discount percentage, fixed discount, free item, loyalty points
    - Adjust probability (0-100% chance of receiving reward)
    - Set validity period (number of days until expiration)
    - Define max redemptions per user (optional limit)
    - Schedule campaigns with start/end dates
    - Toggle active/inactive status
    - Bulk actions (activate/deactivate multiple rules)
    - Duplicate rules for quick setup
  - **Analytics Dashboard** (`/dashboard/rewards`)
    - Total active rules count
    - Rewards issued (all time)
    - Rewards redeemed count
    - Redemption rate percentage
    - Total value redeemed (₦)
    - Active rewards count
    - Charts: rewards issued over time, by type, by rule performance
    - Top performing rules table
  - **Issued Rewards Tracking** (`/dashboard/rewards/issued`)
    - View all issued rewards with pagination
    - Filter by status (active, redeemed, expired)
    - Filter by reward type
    - Filter by date range
    - Search by user email or reward code
    - View detailed reward information
    - Manual expiration capability (admin override)
    - Export to CSV for reporting
  - **Rule Templates** (`/dashboard/rewards/templates`)
    - Pre-configured reward templates (first order, high spender, loyalty bonus, etc.)
    - One-click template application
    - Customize templates before saving
    - Save custom templates for reuse
* **Analytics Dashboard:** Sales reports, popular items, peak hours, revenue tracking.
* **Settings Management:** (`/dashboard/settings`) - Super-admin only
  - **Fee Configuration:**
    - Service fee percentage (configurable, default 2%)
    - Delivery fee base amount (default ₦1,000)
    - Delivery fee reduced amount (default ₦500)
    - Free delivery threshold (default ₦2,000)
    - Minimum order amount (default ₦1,000)
  - **Tax Configuration:**
    - Tax percentage (configurable, default 7.5%)
    - Tax enabled/disabled toggle
  - **Order Configuration:**
    - Estimated preparation time (minutes)
    - Maximum orders per hour
    - Guest checkout enabled/disabled
  - **Order Type Toggles:**
    - Enable/disable dine-in orders
    - Enable/disable pickup orders
    - Enable/disable delivery orders
    - Delivery radius (kilometers)
  - **Business Hours:**
    - Configurable hours for each day of the week
    - Open/close times
    - Closed day toggle
  - **Contact Information:**
    - Public contact email
    - Public contact phone
    - Restaurant address
  - **Features:**
    - Real-time updates (1-minute cache)
    - Audit trail for all changes
    - Form validation with Zod
    - Tabbed interface for organization
    - All settings stored in MongoDB
    - No code deployment required for changes

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
* **Naming: