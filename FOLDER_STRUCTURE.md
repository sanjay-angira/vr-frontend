# Vr-Frontend Folder Structure

This project is the customer-facing Vrindavan Rasa storefront. The administration panel is maintained separately in `vr-admin`.

## Root structure

```text
vr-frontend/
├── public/                    # Storefront assets
├── src/                       # Main application source
├── .env                       # Environment variables
├── package.json               # Dependencies and scripts
├── package-lock.json          # npm lockfile
└── ...
```

## `src` structure

```text
src/
├── app/                       # Storefront routes, layouts, SEO, and metadata
│   ├── (account)/             # Customer account routes
│   ├── (place-order-flow)/    # Cart and checkout routes
│   ├── (store-and-category-flow)/ # Catalog routes
│   ├── globals.css            # Tailwind and global styles
│   ├── robots.ts              # Search crawler rules
│   └── sitemap.ts             # Storefront sitemap
├── components/
│   ├── account/               # Customer account components
│   ├── auth/                  # Customer authentication and modals
│   ├── blog/                  # Blog features
│   ├── cart/                  # Cart and checkout features
│   ├── common/                # Shared storefront UI and controls
│   ├── header/                # Storefront navigation
│   ├── product/               # Product details and cards
│   ├── sections/              # Homepage sections
│   ├── shop/                  # Catalog and filters
│   └── ...                    # Other storefront feature components
├── lib/                       # Link previews, SEO, schema, and site helpers
├── services/
│   ├── api/                   # API client, customer auth, and endpoint constants
│   ├── redux/                 # Storefront state and customer auth
│   └── website/               # Storefront API and business logic
├── styles/website/            # Storefront styles
├── types/                     # Storefront TypeScript types
└── utils/                     # Storefront helpers
```

The frontend retains customer sign-in, account, catalog, cart, checkout, orders, wishlist, and contact flows. It does not contain admin routes, admin state, admin API endpoints, or admin styling.
