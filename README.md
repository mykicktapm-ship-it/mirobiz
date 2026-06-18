# Business OS / Service OS Local MVP

Business OS is a SaaS foundation for service companies. It models the chain Lead → Sale → Offer → Schedule → Work → Invoice → Payment → Service → Warranty → Repeat Sale. The first industry pack is HVAC, while the core domain remains generic enough for windows, construction, solar, cleaning, repair, dental, and other service businesses.

## Local run

```bash
npm install
npm run dev
npm run build
```

Copy `.env.example` if you want to override local settings. Defaults are safe for local development and do not require external API keys.

```bash
BUSINESS_OS_MODE=local
VITE_BUSINESS_OS_MODE=local
VITE_LOCAL_ROLE=Owner
```

Use `VITE_LOCAL_ROLE=Installer` or `VITE_LOCAL_ROLE=Accountant` to verify role-aware UI behavior.

## Pages

The localhost MVP includes Dashboard, Clients, Leads, Deals, Tasks, Schedule, Offers/Packages, Invoices, HVAC, and Settings. All pages use seeded KRON Climate mock data and are designed to avoid broken routes or missing service dependencies.

## Architecture

External services are accessed through replaceable ports/adapters in `src/lib/adapters/local.ts`:

- `AuthProvider` → `LocalAuthProvider` now; Clerk/Supabase later.
- `Repository<T>` → in-memory seed repositories now; API/Prisma/Postgres later.
- `NotificationProvider` → local console notification now; email/SMS/Telegram later.
- `PaymentProvider` → mock authorization now; Stripe/LiqPay/WayForPay later.
- `RealtimeProvider` → local event bus now; Socket.IO/Supabase realtime later.

Domain contracts live in `src/lib/domain/types.ts`. Mock data lives in `src/lib/mock/seed.ts`. Analytics, RBAC, scheduler intelligence, rule evaluation, and workflow running are split away from UI so production implementations can replace local implementations incrementally.

## MVP scope

- Local auth and workspace: KRON Climate.
- Roles: Owner, Admin, Manager, Dispatcher, Installer, Accountant, Service, Viewer.
- Core entities: workspace, users, clients, contacts, locations, leads, deals, tasks, visits, offers, invoices, payments, events, audit, notifications, rules, workflows.
- HVAC entities: equipment, installations, service requests, warranties, technician teams.
- Offer/package items support product, service, material, warranty, subscription, and custom lines.
- Dashboard analytics are calculated from local repositories.
- Schedule includes duration, overlap conflict detection, team skills, district fit, and priority scoring.

## Replacing mocks

Keep UI code calling provider/repository interfaces. Add production adapters next to local adapters and choose the implementation by environment mode. Production service keys must remain optional for `local` mode so localhost and production build continue to work without external services.
