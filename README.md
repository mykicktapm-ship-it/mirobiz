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

## Local Business Actions

The MVP now runs real local business actions instead of rendering static seed data only. UI buttons execute actions against mutable in-memory repositories and immediately refresh the current page.

- Leads can be qualified and converted into deals via the local action/workflow pipeline.
- Deals can be marked won or lost. Winning a deal emits events and can trigger fulfillment workflow steps such as invoice, installation, task, and notification creation.
- Tasks can be completed and recorded in the event and audit streams.
- Sent or overdue invoices can be marked paid through the mock payment provider, with local notifications created afterward.
- Planned visits can be completed from the Schedule page.
- HVAC installations can be completed from the HVAC page, which also completes the linked visit and activates a local warranty stub.

Every supported action records an audit log, creates a business event, publishes to the local event bus, evaluates rules, runs matching workflows, sends local notifications when needed, and refreshes the vanilla TypeScript UI from the updated repositories.

## Action pipeline

```text
UI action
→ executeBusinessAction
→ permission check
→ domain service mutation
→ repository create/update/delete
→ business event
→ audit log
→ LocalEventBus publish
→ rule engine evaluation/execution
→ workflow engine execution
→ notification provider
→ UI refresh
```

Role enforcement is performed inside `executeBusinessAction`, not only in the UI. For example, an Installer can complete work but cannot mark invoices paid; an Accountant can mark invoices paid but cannot manage schedules; Managers can run sales actions; Dispatchers can manage schedules; Owners can do everything.

## Next production replacement

The next production step is to keep the same ports and action contracts while replacing local implementations with durable services:

- Replace in-memory repositories with API/Postgres-backed repositories.
- Enforce RBAC on the backend as well as in the local UI.
- Persist business events, audit logs, payments, notifications, and workflow execution logs.
- Make rule and workflow execution durable, idempotent, observable, and retryable.
- Swap local notification, payment, auth, and realtime providers for production integrations without changing domain services or UI action calls.
