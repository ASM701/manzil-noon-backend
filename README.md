# Manzil Noon — Backend API

> REST API powering the Manzil Noon e-commerce platform.

This is the Node.js/Express backend for [Manzil Noon](https://manzilnoon.com), handling authentication, products, orders, cart, wishlist, admin operations, and transactional email.

🌐 **Live API:** [manzil-noon-backend.vercel.app](https://manzil-noon-backend.vercel.app)
🛍️ **Frontend Repo:** [manzil-noon-frontend](https://github.com/ASM701/manzil-noon-frontend)

---

## Overview

The backend exposes a REST API consumed by the Manzil Noon React frontend. It connects to a Supabase (PostgreSQL) database for all data storage, uses Supabase Auth for user authentication, and sends transactional emails via Resend for order notifications and contact form submissions.

---

## Features

- **Authentication** — register, login, logout via Supabase Auth
- **Products** — fetch products with nested variants and sizes
- **Cart** — persistent per-user cart with quantity management
- **Wishlist** — persistent per-user wishlist
- **Orders** — create orders, fetch order history, cancel pending orders
- **Automatic stock management** — stock decreases on order, tracked per variant and per size
- **Admin API** — view all orders, update order status, manage inventory (protected by `is_admin` flag)
- **Email notifications** — order confirmations and contact form messages sent via Resend
- **Site settings** — global config (e.g. gift wrapping price and image)
- **CORS configured** — allows requests from `manzilnoon.com` and Vercel preview deployments

---

## Tech Stack

| Technology | Purpose |
|---|---|
| Node.js + Express | API server and routing |
| Supabase (PostgreSQL) | Database, authentication, storage |
| Resend | Transactional email delivery |
| Vercel | Serverless hosting and deployment |

---

## API Routes

| Method | Route | Description | Auth Required |
|---|---|---|---|
| GET | `/` | Health check | No |
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Login | No |
| POST | `/api/auth/logout` | Logout | No |
| GET | `/api/products` | Get all products with variants | No |
| GET | `/api/products/:id` | Get a single product | No |
| GET | `/api/users/me` | Get current user profile | Yes |
| PUT | `/api/users/me` | Update current user profile | Yes |
| GET | `/api/cart` | Get current user's cart | Yes |
| POST | `/api/cart` | Add item to cart | Yes |
| PUT | `/api/cart/:id` | Update cart item quantity | Yes |
| DELETE | `/api/cart/:id` | Remove item from cart | Yes |
| DELETE | `/api/cart` | Clear entire cart | Yes |
| GET | `/api/wishlist` | Get current user's wishlist | Yes |
| POST | `/api/wishlist` | Add item to wishlist | Yes |
| DELETE | `/api/wishlist` | Remove item from wishlist | Yes |
| POST | `/api/orders` | Create a new order | Yes |
| GET | `/api/orders` | Get current user's orders | Yes |
| GET | `/api/orders/:id` | Get a single order | Yes |
| PUT | `/api/orders/:id/cancel` | Cancel a pending order | Yes |
| GET | `/api/admin/orders` | Get all orders (admin) | Yes (admin) |
| PUT | `/api/admin/orders/:id` | Update order status (admin) | Yes (admin) |
| PUT | `/api/admin/variants/:id/stock` | Update variant stock (admin) | Yes (admin) |
| PUT | `/api/admin/sizes/:id/stock` | Update size stock (admin) | Yes (admin) |
| GET | `/api/settings` | Get site settings | No |
| POST | `/api/contact` | Send contact form message | No |

---

## Project Structure

```
manzil-noon-backend/
├── api/
│   ├── auth.js          # Register, login, logout
│   ├── products.js      # Product catalog
│   ├── users.js         # User profile
│   ├── cart.js          # Shopping cart
│   ├── wishlist.js      # Wishlist
│   ├── orders.js        # Order creation and history
│   ├── admin.js         # Admin-only routes
│   ├── settings.js      # Site settings
│   └── contact.js       # Contact form email
├── lib/
│   └── supabase.js      # Supabase client (regular + admin)
├── middleware/
│   └── auth.js           # JWT verification middleware
├── server.js             # Express app entry point
├── vercel.json            # Vercel deployment config
└── .env                   # Environment variables (not committed)
```

---

## Database

The backend relies on the following Supabase tables, all protected with Row Level Security (RLS):

| Table | Description |
|---|---|
| `profiles` | Extends `auth.users` with name, phone, address, and `is_admin` flag |
| `products` | Product catalog |
| `product_variants` | Color variants with images, swatches, video, and stock |
| `product_variant_sizes` | Size options per variant with individual price and stock |
| `wishlists` | User wishlisted items |
| `carts` | User cart items |
| `orders` | Placed orders |
| `order_items` | Items within each order, including gift wrap flag |
| `site_settings` | Global key-value config (e.g. gift price, gift image URL) |

Admin routes use a `supabaseAdmin` client (initialized with the service role key) to bypass RLS where necessary, such as reading another user's profile or updating order status.

---

## Deployment

Deployed on **Vercel** as a serverless function, configured via `vercel.json`. Automatically redeploys on every push to `main`.

**Live URL:** [manzil-noon-backend.vercel.app](https://manzil-noon-backend.vercel.app)

---

## CORS

The API allows requests from:
- `http://localhost:5173` (local frontend development)
- `https://manzilnoon.com` and `https://www.manzilnoon.com`
- Any `*.vercel.app` subdomain (for preview deployments)

---

## Related Repositories

- **Frontend:** [manzil-noon-frontend](https://github.com/ASM701/manzil-noon-frontend) — React + Vite storefront

---

## License

Private repository. All rights reserved © 2025 Manzil Noon.