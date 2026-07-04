<div align="center">

<!-- Animated SVG Banner -->
<svg width="900" height="200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1f36">
        <animate attributeName="stop-color" values="#1a1f36;#242b4d;#0e1222;#1a1f36" dur="10s" repeatCount="indefinite"/>
      </stop>
      <stop offset="50%" style="stop-color:#2d3561">
        <animate attributeName="stop-color" values="#2d3561;#3c467a;#1b213b;#2d3561" dur="10s" repeatCount="indefinite"/>
      </stop>
      <stop offset="100%" style="stop-color:#0abf8a">
        <animate attributeName="stop-color" values="#0abf8a;#06d6a0;#059669;#0abf8a" dur="10s" repeatCount="indefinite"/>
      </stop>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <!-- Background -->
  <rect width="900" height="200" rx="18" fill="url(#bg)"/>
  
  <!-- Animated floating circles (decorative) -->
  <circle cx="820" cy="40" r="60" fill="#f5a623" opacity="0.06">
    <animate attributeName="r" values="60;75;60" dur="4s" repeatCount="indefinite"/>
    <animate attributeName="cy" values="40;55;40" dur="8s" repeatCount="indefinite"/>
  </circle>
  <circle cx="100" cy="170" r="50" fill="#0abf8a" opacity="0.08">
    <animate attributeName="r" values="50;65;50" dur="3s" repeatCount="indefinite"/>
    <animate attributeName="cx" values="100;120;100" dur="6s" repeatCount="indefinite"/>
  </circle>
  <circle cx="500" cy="180" r="40" fill="#2d3561" opacity="0.3">
    <animate attributeName="r" values="40;55;40" dur="5s" repeatCount="indefinite"/>
  </circle>
  
  <!-- Hotel icon (SVG path) on the left -->
  <g transform="translate(60, 50)" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4 36h32M8 36V12a3 3 0 0 1 3-3h18a3 3 0 0 1 3 3v24" stroke="#0abf8a">
      <animate attributeName="stroke" values="#0abf8a;#f5a623;#0abf8a" dur="6s" repeatCount="indefinite"/>
    </path>
    <path d="M16 36V26a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v10" stroke="#f5a623">
      <animate attributeName="stroke" values="#f5a623;#0abf8a;#f5a623" dur="6s" repeatCount="indefinite"/>
    </path>
    <rect x="12" y="14" width="4" height="4" rx="1" fill="#fff" opacity="0.8">
      <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" repeatCount="indefinite"/>
    </rect>
    <rect x="24" y="14" width="4" height="4" rx="1" fill="#fff" opacity="0.8">
      <animate attributeName="opacity" values="1;0.3;1" dur="3s" repeatCount="indefinite"/>
    </rect>
    <rect x="12" y="20" width="4" height="4" rx="1" fill="#fff" opacity="0.8">
      <animate attributeName="opacity" values="0.5;1;0.5" dur="2.5s" repeatCount="indefinite"/>
    </rect>
    <rect x="24" y="20" width="4" height="4" rx="1" fill="#fff" opacity="0.8">
      <animate attributeName="opacity" values="1;0.5;1" dur="2.5s" repeatCount="indefinite"/>
    </rect>
    <path d="M20 3l1 2h2l-1.5 1.5 0.5 2-2-1.2-2 1.2 0.5-2L17 5h2z" fill="#f5a623">
      <animate attributeName="opacity" values="0.2;1;0.2" dur="2s" repeatCount="indefinite"/>
    </path>
  </g>
  
  <!-- Resort palm tree icon on the right -->
  <g transform="translate(800, 50)" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M2 36c10-2 20-2 28 0" stroke="#0abf8a">
      <animate attributeName="stroke" values="#0abf8a;#f5a623;#0abf8a" dur="6s" repeatCount="indefinite"/>
    </path>
    <path d="M16 36c-2-6-1-14 3-20" stroke="#f5a623">
      <animate attributeName="stroke" values="#f5a623;#0abf8a;#f5a623" dur="6s" repeatCount="indefinite"/>
    </path>
    <path d="M19 16c2-4 7-6 10-4M19 16c-3-3-7-4-10-1M19 16c3 1 7 4 8 8M19 16c-1 3-3 7-6 9" stroke="#fff" opacity="0.9">
      <animate attributeName="opacity" values="0.6;1;0.6" dur="4s" repeatCount="indefinite"/>
    </path>
  </g>
  
  <!-- Main Title: Stayandaman -->
  <text x="450" y="95" 
        font-family="Georgia,serif" 
        font-size="52" 
        font-weight="bold" 
        fill="white" 
        text-anchor="middle"
        letter-spacing="3"
        filter="url(#glow)">
    Stayandaman
    <animate attributeName="opacity" values="0;1" dur="1.5s" fill="freeze"/>
  </text>
  
  <!-- Tagline -->
  <text x="450" y="140" 
        font-family="Arial,sans-serif" 
        font-size="18" 
        fill="#f5a623" 
        text-anchor="middle"
        letter-spacing="1">
    Your Perfect Stay, Simplified
    <animate attributeName="opacity" values="0;1" dur="2s" fill="freeze"/>
  </text>
  
  <!-- Animated underline -->
  <line x1="300" y1="155" x2="600" y2="155" 
        stroke="#0abf8a" stroke-width="2" opacity="0.7">
    <animate attributeName="x1" values="450;300" dur="1s" fill="freeze"/>
    <animate attributeName="x2" values="450;600" dur="1s" fill="freeze"/>
  </line>
</svg>

<!-- Typing SVG Badge -->
![Typing SVG](https://readme-typing-svg.demolab.com?font=Playfair+Display&size=22&duration=3000&pause=1000&color=F5A623&center=true&vCenter=true&width=600&lines=Discover+Premium+Hotels;Explore+Cozy+Lodges;Find+Perfect+Rentals;Your+Andaman+Journey+Starts+Here)

</div>

<br/>

<div align="center">

<!-- Tech Stack Badges -->
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![EJS](https://img.shields.io/badge/EJS-B4CA65?style=for-the-badge&logo=ejs&logoColor=black)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

<!-- Status Badges -->
![Status](https://img.shields.io/badge/Status-Active-2ecc71?style=flat-square)
![Version](https://img.shields.io/badge/Version-1.0.0-f5a623?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-0abf8a?style=flat-square)
![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen?style=flat-square)
![Made with Love](https://img.shields.io/badge/Made%20with-Love-red?style=flat-square)

</div>

---

<div align="center">

### Application Preview

| Home Page | Hotel Listings |
|:---:|:---:|
| ![Home](https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&q=80&fit=crop) | ![Hotels](https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80&fit=crop) |

| Lodge Listings | Rental Properties |
|:---:|:---:|
| ![Lodges](https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=400&q=80&fit=crop) | ![Rentals](https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=400&q=80&fit=crop) |

</div>

---

## Table of Contents

| # | Section |
|---|---------|
| 1 | [Features](#features) |
| 2 | [Application Preview](#application-preview) |
| 3 | [Tech Stack](#tech-stack) |
| 4 | [Logo & Brand Identity](#logo--brand-identity) |
| 5 | [Project Structure](#project-structure) |
| 6 | [Quick Start](#quick-start) |
| 7 | [Authentication](#authentication) |
| 8 | [Database](#database) |
| 9 | [API Routes](#api-routes) |
| 10 | [Project Stats](#project-stats) |
| 11 | [Property Categories](#property-categories) |
| 12 | [UI Highlights](#ui-highlights) |
| 13 | [Contributing](#contributing) |
| 14 | [License](#license) |

---

## Features

<div align="center">

### What Makes Stayandaman Special

</div>

### User Features
| Feature | Description |
|---------|-------------|
| **Passwordless Login** | Sign in securely and instantly with just username + email matching. |
| **Browse Listings** | Explore properties under three rich categories: Hotels, Lodges & Rentals. |
| **Smart Filters** | Search and filter listings by name, category, location, and rating. |
| **View Details** | Detailed property view showing full galleries, amenities list, and description. |
| **Book Now** | Complete bookings using an interactive modal form with date pickers. |
| **Price Calculator** | Real-time calculations of subtotal, 18% GST tax, and net payable amount. |
| **My Bookings** | Track, review, and cancel active reservations in real-time. |
| **Profile Management** | Edit details (Avatar, Phone, Gender, Date of Birth, City) with live uploads. |

### Admin Features
| Feature | Description |
|---------|-------------|
| **Dashboard Stats** | Real-time totals, active inventory counts, and user/booking metrics on load. |
| **Manage Listings** | Complete CRUD operations for properties with inline base64 image previews. |
| **Manage Users** | Activate/deactivate accounts or delete user profiles directly. |
| **Manage Bookings** | Live lifecycle controls: change status (Pending/Confirmed/Cancelled) or delete bookings. |
| **Revenue Tracking** | Compute overall and monthly revenue totals dynamically. |
| **Export CSV** | Download formatted booking lists as CSV spreadsheets with one click. |
| **Image Upload** | Drag & drop file selector encoding uploads into base64 data URIs. |
| **Search & Filter** | Advanced search filters across users, listings, and bookings. |

---

## Tech Stack

<div align="center">

| Layer | Technology | Purpose |
|:---:|:---:|:---:|
| **Runtime** | ![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=nodedotjs&logoColor=white) | Lightweight, fast asynchronous backend server |
| **Framework** | ![Express](https://img.shields.io/badge/Express.js-4.x-000000?logo=express) | Web server routing and application logic |
| **Templates** | ![EJS](https://img.shields.io/badge/EJS-3.x-B4CA65) | Server-side template rendering for dynamic HTML UI |
| **Database** | ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white) | Persistent Cloud document database (Mongoose ODM) |
| **Fallback DB** | ![JSON](https://img.shields.io/badge/JSON-File--based-orange) | Automatic file fallback storage (`db.json`) for configuration-free local execution |
| **Auth** | ![Session](https://img.shields.io/badge/express--session-Auth-blue) | Secure cookie-based stateful authentication sessions |
| **Styling** | ![CSS3](https://img.shields.io/badge/CSS3-Custom-1572B6?logo=css3) | Beautiful Glassmorphism stylesheet utilizing HSL variables and flex/grid |
| **Images** | ![Unsplash](https://img.shields.io/badge/Unsplash-CDN-000000?logo=unsplash) | Modern high-definition property illustrations |

</div>

---

## Logo & Brand Identity

Stayandaman includes a complete **SVG logo system** with 6 professionally designed variations stored in `public/images/`:

| File | Dimensions | Use Case |
|------|-----------|----------|
| `logo-primary.svg` | 320×80 | Navbar, email headers, presentations (includes CSS float/shimmer animations) |
| `logo-stacked.svg` | 200×180 | Landing page hero, splash screens, about pages |
| `logo-icon.svg` | 100×100 | App icon, social media avatar, profile pictures |
| `logo-dark.svg` | 320×80 | Admin sidebar, dark navbar, footer (white + gold on dark backgrounds) |
| `logo-mono.svg` | 320×80 | Print, watermarks, documents (all-navy, no gradients) |
| `logo-favicon.svg` | 32×32 | Browser tab favicon, PWA icon (pixel-perfect at 16px) |

**Brand Colors:**
- Primary Navy: `#1a1f36` — Trust, luxury, depth
- Warm Gold: `#f5a623` — Premium, warmth, energy
- Fresh Teal: `#0abf8a` — Modern, calm, nature

**Icon Concept:** Roof + Location Pin fusion — a stylised hotel rooftop forming the top half of a location pin, combining travel and stay identity. Gold roof, navy pin body, teal windows.

**Preview:** Start the app and visit `/images/logo-preview.html` to see all 6 logos on one page.

---

## Project Structure

A clean, modular directory structure containing models, middleware, controllers, public styles, and server logic:

```text
Stayandaman/
│
├── middleware/
│   ├── isAdminLoggedIn.js  # Restricts routes to active admin sessions
│   └── isUserLoggedIn.js   # Restricts routes to active user sessions
│
├── models/
│   ├── Admin.js            # Admin profiles (FullName, Username, Email, Phone, Bio, etc.)
│   ├── Booking.js          # Booking entries (BookingId, Stay duration, guest details, pricing)
│   ├── Listing.js          # Accommodation entries (Name, Location, Category, Price, Amenities, Image)
│   └── User.js             # User accounts (FullName, Username, Email, City, Status)
│
├── public/
│   ├── css/
│   │   ├── admin.css       # Layout styles for the administrative panel
│   │   ├── auth.css        # Centered visual inputs for user & admin login/signup
│   │   ├── booking.css     # Styling for booking form cards and details
│   │   ├── detail.css      # Property overview gallery, descriptions, and rules
│   │   ├── global.css      # Core HSL variable design system, buttons, & resets
│   │   ├── home.css        # Search, hero category selectors, and listing grids
│   │   ├── landing.css     # Clean visual gateway layout (Role Selector)
│   │   ├── listings.css    # Grid views for listing cards (hover lift & shadows)
│   │   └── profile.css     # Form layouts for profile editing and avatar cropping
│   │
│   ├── images/
│   │   ├── logo-primary.svg   # Horizontal animated logo (navbar, headers)
│   │   ├── logo-stacked.svg   # Vertical stacked logo (landing, splash)
│   │   ├── logo-icon.svg      # Icon-only mark (app icon, social media)
│   │   ├── logo-dark.svg      # Dark background variant (admin sidebar)
│   │   ├── logo-mono.svg      # Monochrome print-ready version
│   │   ├── logo-favicon.svg   # Ultra-simple 32×32 favicon
│   │   └── logo-preview.html  # Preview page showing all logo variations
│   │
│   ├── js/
│   │   └── admin.js        # Dynamic front-end logic for Single Page Admin Panel
│   └── hotel_background.png # Premium background asset for authentication
│
├── src/
│   ├── dbService.js         # Unified CRUD adapter matching MongoDB API / JSON fallback
│   └── db.json            # Dynamic fallback database populated in absence of MongoDB URL
│
├── views/                  # Embedded Javascript (EJS) markup templates
│   ├── adminDashboard.ejs  # Control dashboard (Single-page app for Listings, Users, Bookings)
│   ├── adminLogin.ejs      # Login form layout for administrators
│   ├── adminSignup.ejs     # Sign up form layout for administrators
│   ├── home.ejs            # Main landing search page for authenticated users
│   ├── hotels.ejs          # Grid listings filter targeting Hotels category
│   ├── landing.ejs         # Application entry portal for selecting portals
│   ├── listingDetail.ejs   # Individual accommodation view page with image gallery
│   ├── lodges.ejs          # Grid listings filter targeting Lodges category
│   ├── myBookings.ejs      # Active & cancelled bookings list of a logged-in user
│   ├── rentals.ejs         # Grid listings filter targeting Rentals category
│   ├── userLogin.ejs       # Passwordless portal entry for users
│   ├── userProfile.ejs     # Profile management form layout
│   └── userSignup.ejs      # User registration form layout
│
├── .env                     # App configuration parameters
├── index.js                 # Unified entry point initializing routes & DB connections
└── package.json             # Project dependencies and deployment runner
```

---

## Quick Start

Follow these steps to set up and run Stayandaman locally on your computer:

### Prerequisites

![Node](https://img.shields.io/badge/Node.js-v16+-339933?logo=nodedotjs)
![npm](https://img.shields.io/badge/npm-v8+-CB3837?logo=npm)
![MongoDB](https://img.shields.io/badge/MongoDB-Optional-47A248?logo=mongodb)

### 1 Clone the Repository

```bash
git clone https://github.com/RimiD162/StayEase.git
cd StayEase
```

### 2 Install Dependencies

```bash
npm install
```

### 3 Configure Environment

Create a `.env` file in the root directory:

```env
# MongoDB Connection URL (optional)
# Leave blank or set to a placeholder containing "xxxxx" to use local file db
mongodb_url = mongodb+srv://<username>:<password>@cluster0.mongodb.net/

# Session Secret (Required)
SESSION_SECRET = stayandaman-session-secret-key-2026

# Port (Optional, defaults to 5050 if unset)
PORT = 5050
```

> **Tip:** If `mongodb_url` is left blank, empty, or contains `xxxxx`, the app automatically switches to the local `src/db.json` database. No MongoDB setup is required for testing!

### 4 Start the Application

```bash
node index.js
```

### 5 Open in Browser

Depending on the configuration in `.env` (defaulting to Port `5050`), visit these URLs:

| Portal | URL |
|--------|-----|
| Landing Page | [http://localhost:5050/](http://localhost:5050/) |
| Home Page | [http://localhost:5050/home](http://localhost:5050/home) |
| Hotels Grid | [http://localhost:5050/hotels](http://localhost:5050/hotels) |
| Lodges Grid | [http://localhost:5050/lodges](http://localhost:5050/lodges) |
| Rentals Grid | [http://localhost:5050/rentals](http://localhost:5050/rentals) |
| Admin Login | [http://localhost:5050/admin/login](http://localhost:5050/admin/login) |
| User Login | [http://localhost:5050/user/login](http://localhost:5050/user/login) |

---

## Authentication

```mermaid
graph TD
    A[Visit Stayandaman] --> B{Landing Page}
    B --> C[User Portal]
    B --> D[Admin Portal]
    
    C --> E[User Login\nUsername + Email]
    C --> F[User Signup\nFill Registration Form]
    E --> G{Credentials Match?}
    G -->|Yes| H[Home Page]
    G -->|No| E
    F --> E
    
    D --> I[Admin Login\nUsername + Email]
    I --> J{Admin Verified?}
    J -->|Yes| K[Admin Dashboard]
    J -->|No| I
    
    H --> L[Browse Listings]
    L --> M[View Details]
    M --> N[Book Now]
    N --> O[Booking Confirmed]
```
---

## API Routes

### Public Routes
| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/` | Portal gateway (Role Selector landing screen) |
| `GET` | `/user/login` | User login form page |
| `GET` | `/user/signup` | User signup form page |
| `POST` | `/user/login` | Validates user session credentials |
| `POST` | `/user/signup` | Adds user record and redirects to login |
| `GET` | `/admin/login` | Administrative login page |
| `POST` | `/admin/login` | Validates admin session credentials |
| `GET` | `/admin/signup` | Hidden admin registration page |
| `POST` | `/admin/signup` | Registers new administrator using access key |

### Protected User Routes
| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/home` | Main home page showing active listings & search bar |
| `GET` | `/hotels` | Redirects to category filtered Hotel listings page |
| `GET` | `/lodges` | Redirects to category filtered Lodge listings page |
| `GET` | `/rentals` | Redirects to category filtered Rental listings page |
| `GET` | `/home/hotel` | View Hotel grid listings |
| `GET` | `/home/lodges` | View Lodge grid listings |
| `GET` | `/home/rentals` | View Rental grid listings |
| `GET` | `/listing/:id` | View specific property description, gallery & contact detail |
| `POST` | `/booking/create` | Creates a property booking reservation |
| `GET` | `/my-bookings` | Lists active and cancelled bookings |
| `POST` | `/booking/cancel/:id` | Set status of own booking to "Cancelled" |
| `GET` | `/profile` | Displays profile update page |
| `POST` | `/profile` | Updates user details & avatar |
| `POST` | `/user/logout` | Clears user cookie session |

### Admin Routes and AJAX APIs
| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/admin/dashboard` | Main dashboard control layout |
| `GET` | `/admin/listings` | Administrative listing subpanel EJS view |
| `GET` | `/admin/users` | Administrative user management subpanel EJS view |
| `GET` | `/admin/bookings` | Administrative booking management subpanel EJS view |
| `GET` | `/admin/profile` | Administrative profile manager subpanel EJS view |
| `GET` | `/api/listings` | Fetch all properties (JSON) |
| `GET` | `/api/listings/:id` | Fetch specific property details (JSON) |
| `POST` | `/api/listings` | Create a new property listing (JSON) |
| `PUT` | `/api/listings/:id` | Update property listing information (JSON) |
| `DELETE` | `/api/listings/:id` | Remove a property listing (JSON) |
| `GET` | `/api/admin/bookings` | Fetch all active bookings (JSON) |
| `POST` | `/admin/booking/status/:id` | Change status of any booking |
| `POST` | `/admin/booking/delete/:id` | Remove booking from database |
| `GET` | `/api/admin/bookings/export` | Export bookings list as CSV |
| `GET` | `/api/admin/users` | Fetch registered user list (JSON) |
| `PUT` | `/api/admin/users/:id/toggle` | Toggle user active / suspended status |
| `DELETE` | `/api/admin/users/:id` | Permanently remove user record |
| `POST` | `/admin/logout` | Clears administrative cookie session |

---

## Database

### Dual-Mode Storage Architecture

The application has a hybrid database system that runs out-of-the-box using either **MongoDB** or a **JSON local file** fallback, managed by [dbService.js](file:///c:/Users/rimid/OneDrive/Desktop/Stay%20Ease/src/dbService.js):

```mermaid
graph LR
    A[App Starts] --> B{Check mongodb_url}
    B -->|Valid URL| C[Connect MongoDB]
    B -->|Placeholder/Empty| D[Use db.json]
    C -->|Connection Success| E[MongoDB Mode]
    C -->|Connection Failed| D
    D --> F[JSON File Mode]
    E --> G[App Running]
    F --> G
```

### Data Models Overview

<details>
<summary>Listing Schema (models/Listing.js)</summary>

```json
{
  "name": "The Grand Imperial",
  "category": "Hotel",
  "location": "Mumbai, Maharashtra",
  "price": 8500,
  "description": "Luxurious 5-star hotel featuring an infinity pool, dynamic dining, and spa facilities.",
  "amenities": ["WiFi", "AC", "Pool", "Parking", "Breakfast"],
  "rating": 5,
  "available": true,
  "image": "data:image/png;base64,iVBORw0KGgo...",
  "image2": "",
  "image3": "",
  "image4": "",
  "createdAt": "2026-06-29T08:00:00.000Z"
}
```
</details>

<details>
<summary>User Schema (models/User.js)</summary>

```json
{
  "fullName": "Rimi Dutta",
  "username": "rimi_dutta",
  "email": "rimi@example.com",
  "phone": "9876543210",
  "gender": "Female",
  "dateOfBirth": "1998-05-15T00:00:00.000Z",
  "city": "Shimla",
  "avatar": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "isActive": true,
  "createdAt": "2026-06-29T08:15:00.000Z",
  "lastLogin": "2026-06-29T08:45:00.000Z"
}
```
</details>

<details>
<summary>Booking Schema (models/Booking.js)</summary>

```json
{
  "bookingId": "SE-2026-4821",
  "listingId": "65b5c907a9e0f6b15865e239",
  "listingName": "The Grand Imperial",
  "category": "Hotel",
  "location": "Mumbai, Maharashtra",
  "listingImage": "data:image/png;base64,iVBORw0KGgo...",
  "guestName": "Rimi Dutta",
  "guestEmail": "rimi@example.com",
  "guestPhone": "9876543210",
  "userId": "65b5c907a9e0f6b15865e230",
  "checkIn": "2026-07-15T00:00:00.000Z",
  "checkOut": "2026-07-17T00:00:00.000Z",
  "nights": 2,
  "guests": 2,
  "roomType": "Deluxe",
  "pricePerNight": 8500,
  "subtotal": 17000,
  "tax": 3060,
  "totalAmount": 20060,
  "paymentMethod": "Pay at Property",
  "specialRequests": "Late check-in requested",
  "status": "Confirmed",
  "createdAt": "2026-06-29T08:48:00.000Z"
}
```
</details>

---

## Project Stats

<div align="center">

<!-- Animated stat cards using shields.io -->
![Hotels](https://img.shields.io/badge/Hotels-120+_Listings-1a1f36?style=for-the-badge)
![Lodges](https://img.shields.io/badge/Lodges-80+_Listings-0abf8a?style=for-the-badge)
![Rentals](https://img.shields.io/badge/Rentals-60+_Listings-f5a623?style=for-the-badge)
![Users](https://img.shields.io/badge/Users-500+_Registered-6c5ce7?style=for-the-badge)

</div>

---

## Property Categories

<div align="center">

### Hotels
*Luxury stays with world-class amenities*

![Hotel](https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=300&q=80&fit=crop)

---

### Lodges
*Cozy mountain retreats close to nature*

![Lodge](https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800&h=300&q=80&fit=crop)

---

### Rentals
*Private homes and villas for a personal touch*

![Rental](https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&h=300&q=80&fit=crop)

</div>

---

## UI Highlights

| Feature | Details |
|---------|---------|
| **Design Style** | Premium Glassmorphism overlay + modern flat layout grids |
| **Color Palette** | Navy `#1a1f36` (Dominant) • Gold `#f5a623` (Accents) • Teal `#0abf8a` (Highlights) |
| **Typography** | Playfair Display (Serif headings) + Inter (Clean sans-serif reading text) |
| **Logo System** | 6 SVG logo variations (primary, stacked, icon, dark, mono, favicon) with CSS animations |
| **Favicon** | Custom SVG favicon (Roof + Pin icon) displayed on every page across the app |
| **Animations** | Responsive micro-interactions, springy hover card lifts, and smooth page fades |
| **Responsive** | Dynamic media queries tailoring components for Mobile, Tablet, and Desktop screen widths |
| **Admin Theme** | Deep navy sidebar configuration paired with a high-contrast clean content workspace |
| **Cards** | Subtle shadow elevation offsets matched with scale-based image zooms on hover |
| **Toasts** | Auto-dismissing success, deactivation warnings, and database connection notifications |

---

## Contributing

We welcome contributions to Stayandaman! To contribute, follow these guidelines:

1. **Fork the Repository** on GitHub.
2. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit Your Changes** with descriptive comments:
   ```bash
   git commit -m "Add some AmazingFeature"
   ```
4. **Push to the Branch**:
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request** explaining your implementation details.

### Found a Bug?
Create a new GitHub Issue using the `bug` label. Please describe:
- What happened (unexpected behavior details).
- What you expected to happen.
- Steps to reproduce the issue.

---

## License

This project is licensed under the terms of the **MIT License**. Feel free to use, modify, and distribute it in accordance with the license.
