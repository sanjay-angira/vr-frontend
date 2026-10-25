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
│   ├── (website)/             # Storefront, account, cart, and checkout routes
│   ├── globals.css            # Tailwind and global styles
│   ├── robots.ts              # Search crawler rules
│   └── sitemap.ts             # Storefront sitemap
├── components/
│   ├── common/                # Shared storefront UI and controls
│   └── website/               # Storefront pages and feature components
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
