# Vrindavan Rasa Storefront

The customer-facing Vrindavan Rasa storefront is built with Next.js 16 and React 19. The administration panel is maintained separately in `vr-admin`.

## Development

Install dependencies and start the local server:

```bash
npm install
npm run dev
```

The development server is available at [http://localhost:3000](http://localhost:3000).

## Production

```bash
npm run build
npm run start
```

Set `NEXT_PUBLIC_API_URL` in the environment to the backend API base URL. The storefront includes customer authentication, catalog, cart, checkout, order, wishlist, and contact flows.
