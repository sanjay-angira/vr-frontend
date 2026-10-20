# Vr-Frontend Folder Structure

This project is a Next.js frontend for the Vrindavan Rasa storefront and admin panel. It uses the App Router and is organized into public-facing website pages and internal admin management screens.

## Root structure

```text
vr-frontend/
├── .next/                     # Next.js build output and cache files
├── public/                    # Static assets served directly by the app
├── scripts/                   # Optional custom scripts/utilities
├── src/                       # Main application source code
├── .env                       # Environment variables
├── .gitignore                 # Git ignore rules
├── eslint.config.mjs          # ESLint configuration
├── next-env.d.ts              # Next.js TypeScript declarations
├── next.config.ts             # Next.js configuration
├── package.json               # Dependencies and scripts
├── package-lock.json          # Lockfile for npm dependencies
├── postcss.config.mjs         # PostCSS configuration
├── tsconfig.json              # TypeScript project config
├── README.md                  # Default project README
└── tsconfig.tsbuildinfo       # TypeScript incremental build info
```

## `src` structure

```text
src/
├── app/                       # App Router pages and layouts
│   ├── admin/                 # Admin-side routes
│   │   ├── (auth)/            # Login, forgot-password, reset-password
│   │   ├── (panel)/           # Dashboard, CRUD modules, settings, footer, roles
│   │   └── layout.tsx         # Admin app shell
│   ├── (website)/            # Public storefront routes
│   │   ├── (account)/         # User account pages
│   │   ├── (place-order-flow)/ # Cart and checkout flow
│   │   ├── (store-and-category-flow)/ # Category and products pages
│   │   ├── [cms-slug]/        # Dynamic CMS pages
│   │   ├── blog/             # Blog pages
│   │   ├── categories/       # Categories listing page
│   │   ├── contact-us/       # Contact page
│   │   ├── layout.tsx        # Website layout wrapper
│   │   ├── page.tsx          # Homepage
│   │   ├── product/[slug]/  # Product detail pages
│   │   ├── recently-viewed-products/
│   │   ├── thank-you/
│   │   └── order-success/
│   ├── error.tsx             # Global error UI
│   ├── favicon.ico           # App favicon
│   ├── globals.css          # Global CSS
│   ├── layout.tsx            # Root layout
│   ├── not-found.tsx        # 404 page
│   ├── robots.ts             # Robots metadata
│   └── sitemap.ts            # Sitemap generation
│
├── components/               # Reusable UI components
│   ├── admin/                # Admin dashboard and management screens
│   │   ├── auth/             # Login/reset/forgot forms
│   │   ├── commonTable/      # Table abstractions and config
│   │   ├── dashboard/        # Stats and charts
│   │   ├── forms/            # CRUD admin forms and shared form helpers
│   │   ├── layout/           # Sidebar/header/panel shell
│   │   ├── orders/          # Order view components
│   │   ├── products/        # Product-specific admin UI
│   │   ├── profile/         # Admin profile page UI
│   │   ├── shared/          # Shared admin modal/dialog components
│   │   ├── views/           # Admin view registry and record view
│   │   └── website-layout/  # Website layout admin editor
│   ├── common/               # Common reusable components (Button, Input, Table, etc.)
│   └── website/              # Storefront UI features
│       ├── account/          # Account/order components
│       ├── blog/             # Blog UI and API handlers
│       ├── cart/             # Cart utilities
│       ├── categories/       # Category APIs
│       ├── data/             # Homepage/product mock/static data
│       ├── hooks/            # Website hooks
│       ├── product/          # Product-related helpers and APIs
│       ├── wishlist/         # Wishlist logic
│       └── ...
│
├── lib/                      # Shared application logic and metadata helpers
│   ├── linkPreview.ts
│   ├── schema.ts
│   ├── seo.ts
│   └── site.ts
│
├── services/                 # API services and Redux setup
│   ├── admin/                # Admin dashboard/auth services
│   ├── api/                  # Base API config, JWT handling, storage, errors, upload
│   ├── redux/                # Redux store, selectors, slices
│   ├── website/              # Frontend store services (cart, wishlist, auth, checkout, etc.)
│   └── ...
│
├── styles/                   # CSS styles by section
│   ├── admin/                # Admin CSS files
│   └── website/              # Storefront CSS files
│
├── types/                    # TypeScript interfaces/types
│   ├── footer.ts
│   ├── homepage.ts
│   └── user.ts
│
├── utils/                    # Helper utilities
│   ├── cartIdentity.ts
│   ├── categoryFilterHelpers.ts
│   ├── footerHelpers.ts
│   ├── formikHelpers.ts
│   ├── optimizedImage.ts
│   ├── razorpayCheckout.ts
│   ├── sessionId.ts
│   ├── shopFilterUrl.ts
│   └── validatons.ts
│
├── proxy.ts                  # Proxy configuration or API bridging helper
└── ...
```

## Public assets

```text
public/
├── images/
├── logo/
├── social-icons/
└── ...
```

These folders contain branding assets, product images, and social icons used by the public website.

## Main responsibilities by folder

- `app/`: route-driven pages and app-wide layout
- `components/admin/`: admin dashboard and CRUD interfaces
- `components/website/`: storefront homepage, product, category, cart, wishlist and account features
- `services/api/`: axios setup, token handling, API endpoint constants, upload helpers
- `services/redux/`: global state management for cart, modal, wishlist, and user auth
- `services/website/`: e-commerce features such as checkout, coupons, search, recently viewed, and catalog APIs
- `styles/`: themed CSS for website and admin sections
- `types/`: models for homepage, footer, and user data
- `utils/`: reusable logic for filters, form validation, cart behavior, and checkout integration

## Notes

- The project is built with Next.js 16 and React 19.
- It appears to support both a customer-facing retail website and a private admin panel.
- Most business logic is split between `components`, `services`, and `utils`, while route/page structure is maintained under `src/app`.
