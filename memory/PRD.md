# BidBridge — PRD

## Original Problem Statement
User uploaded a 6th-semester SRS document for **BidBridge**, a real-time online auction/bidding platform. The request was: "build a responsive real-time bidding website having all the features that I have shared with you. And the website has backend databases to store all the data."

## User Choices
- Authentication: **JWT-based custom (email + password)**
- Real-time: **Socket.IO** (path `/api/socket.io`)
- Payments: **Mocked only** (no real payment processor)
- Notifications: **In-app only** (no email/SMS)
- Design vibe: **Modern marketplace** (light, clean, e-commerce feel)

## User Personas
- **Bidder** — browses live/upcoming auctions, places bids, tracks watchlist, receives outbid alerts.
- **Seller** — lists items with photos/category/schedule, watches bids come in live.
- **Admin** — oversees users, auctions, and platform stats.

## Architecture
- **Backend**: FastAPI + MongoDB (Motor) + python-socketio (ASGI). Runs on port 8001 under supervisor.
- **Frontend**: React 19 + React Router + Tailwind + shadcn/ui + Sonner + Framer Motion + socket.io-client. Runs on port 3000 under supervisor.
- **DB**: MongoDB local at `mongodb://localhost:27017` / db `bidbridge_db`. Collections: users, auctions, bids, notifications, watchlist, feedback, categories, login_attempts, password_reset_tokens.
- **Auth**: JWT (access 24h + refresh 7d) as httpOnly cookies (`SameSite=None; Secure`) with Bearer fallback. bcrypt password hashing. Email-based brute force lockout (5 attempts / 15 min).
- **Real-time**: Socket.IO with rooms `auction:{id}` (bid broadcasts) and `user:{id}` (per-user notifications). Auth via `access_token` cookie or `auth={token}` handshake.
- **Background worker**: 3s async ticker transitions auctions upcoming→live→ended and emits `auction_status`, `won`, `sold` notifications.

## Core Requirements (from SRS)
- User auth with roles: bidder, seller, admin.
- Auction CRUD with images, category, start/end time, min increment, condition.
- Real-time bidding with outbid tracking.
- Watchlist / My bids / Won auctions.
- Notifications: outbid, new_bid, won, sold.
- Seller feedback + rating (1–5 stars).
- Categories & search filters (keyword, category, status, price range, sort).
- Admin dashboard: users list/delete, auctions list/delete, stats.
- Mock checkout for winning bidders.

## What's Been Implemented (2026-02)
- ✅ Full JWT auth (register/login/logout/me/refresh/profile) with brute force lockout.
- ✅ Auction CRUD + filter/sort/search + demo seed data (4 auctions across watches/cars/furniture).
- ✅ Real-time bidding: per-bid Socket.IO broadcast, in-place UI update with bid-pulse animation.
- ✅ Watchlist add/remove/list.
- ✅ Notifications: fetch + real-time push + mark read/all-read; toast on receipt (sonner).
- ✅ Feedback create + list per seller.
- ✅ Admin console: stats, users table (delete), auctions table (delete).
- ✅ Frontend pages: Home, Auctions browse, Auction detail (gallery + tabs), Login, Register (role select), Dashboard (5 tabs), Create Auction, Admin, Profile, Mock Checkout with post-purchase seller rating.
- ✅ Design system (Cabinet Grotesk + Satoshi + JetBrains Mono, deep forest green + terracotta, no purple gradients).
- ✅ All interactive elements have `data-testid` attributes.
- ✅ Seed admin/seller/bidder accounts + 8 categories on startup.

## Prioritized Backlog
- **P1**
  - Direct messaging between buyer and seller (SRS mentioned messaging; not built yet).
  - Auto-bid / proxy bidding.
  - Image upload (currently URL only). Would need object storage integration.
  - Email notifications (currently in-app only per user choice).
- **P2**
  - Per-auction locks (currently a single global `_bid_lock` — split into a `dict[str, asyncio.Lock]` for better concurrency).
  - Server-side pagination for /auctions (currently limit-based only).
  - Auction-end soft close (extend last minutes if a bid lands in the final 60s).
  - Split `server.py` into modules (auth, auctions, bids, admin, sockets) for maintainability.
- **P3**
  - Real Stripe integration (currently checkout is a mock).
  - Charts on the admin dashboard using Recharts.
  - Public seller profile pages with rating history.

## Test Credentials
See `/app/memory/test_credentials.md`.

## Known Gaps
- Direct messaging is not implemented (SRS mentioned it).
- Checkout is a UI-only mock — no real payment.
- File/image upload endpoint is not exposed; sellers paste image URLs.
