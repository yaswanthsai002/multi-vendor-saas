# Domain flows and current scope

This guide separates behavior present in the code from follow-up work discussed for the product. API route registration is in `apps/api/src/routes.ts`; web pages are under `apps/web/app`.

## Customer discovery and purchase

- **Home and navigation:** home categories, featured brands/products, and active/upcoming homepage campaigns come from API-backed services in `apps/web/features/home` and the catalog/merchandising API.
- **Catalog:** product listing, detail, brands, category browsing, and product reviews are public catalog experiences. Current campaign deal prices flow through catalog and cart pricing; see `apps/api/src/shared/pricing/current-product-price.ts`.
- **Account and delivery addresses:** customer account and address features exist. Address ownership is enforced by the API.
- **Wishlist:** authenticated wishlist API and customer page exist.
- **Cart:** cart API requires an authenticated session. Cart totals are calculated server-side; cart does not reserve stock.
- **Checkout and customer order history:** authenticated checkout review, order placement with persisted idempotency keys, order history/detail, and whole-order cancellation are implemented by the customer API and `/checkout` and `/orders` pages. The design record documents the concurrency and retry rules.
- **Review submission:** product review reading and aggregation exist. Customer review submission remains deferred.

### Public catalog visibility and effective price

```mermaid
flowchart TD
  product[Product candidate] --> published{Published, approved, not deleted?}
  published -- No --> hidden[Exclude from public result]
  published -- Yes --> vendor{Vendor profile active?}
  vendor -- No --> hidden
  vendor -- Yes --> owner{Vendor owner account active?}
  owner -- No --> hidden
  owner -- Yes --> deal{Published campaign active now<br/>and deal price below product price?}
  deal -- Yes --> dealPrice[Use campaign deal price]
  deal -- No --> regular[Use product selling price]
  dealPrice --> visible[Return product]
  regular --> visible
```

These visibility predicates apply to public catalog data and review access. The effective price expression is shared by product responses, price sorting/ranges, and cart totals. `currentProductPriceSql` uses the most recently started eligible active campaign; otherwise it falls back to `products.price`.

### Product review pagination and aggregates

```mermaid
sequenceDiagram
  actor Customer
  participant Web as Product detail
  participant API as Catalog API
  participant DB as PostgreSQL

  Customer->>Web: Open reviews or show more
  Web->>API: GET /api/products/{slug}/reviews?page&limit
  API->>API: Validate slug, page, and limit (max 20)
  API->>DB: Confirm product is publicly available
  API->>DB: Group all ratings by star value
  API->>DB: Fetch requested review page, newest first with ID tie-breaker
  DB-->>API: All-star counts and page items
  API->>API: Calculate average, count, distribution, hasMore
  API-->>Web: Page and full-product aggregates
  Web-->>Customer: Append reviews and update summary
```

Aggregates include rating-only reviews and use every review, independent of page. Implementation lives in `getProductReviews` and `productReviewsQuerySchema` under the catalog feature.

### Add an item to cart

```mermaid
sequenceDiagram
  actor Customer
  participant Web as Web API client
  participant API as Cart route/controller
  participant Auth as verifyToken
  participant Service as Cart service
  participant DB as PostgreSQL

  Customer->>Web: Add product with quantity
  Web->>API: POST /api/cart/items
  API->>Auth: Verify session
  Auth-->>API: Authenticated user subject
  API->>API: Validate productId and quantity with Zod
  API->>Service: addItem(userId, input)
  Service->>DB: Transaction: check availability/stock and mutate cart
  DB-->>Service: Updated cart state
  Service-->>Web: Server-calculated prices and totals
  Web-->>Customer: Refresh cart view/badge
```

Cart routes apply `verifyToken` in `apps/api/src/features/cart/cart.routes.ts`. The controller derives the user ID from the verified session; cart writes run in transactions in `cart.service.ts`.

### Checkout placement and safe retry

```mermaid
sequenceDiagram
  actor Customer
  participant Web as Checkout page
  participant API as Customer order API
  participant DB as PostgreSQL

  Customer->>Web: Review cart and select saved address
  Web->>API: GET checkout review with address ID
  API->>DB: Read owned IN address, cart, current prices, and stock
  DB-->>API: Review data
  API-->>Web: Lines, totals, stock, and expected prices

  Customer->>Web: Place order
  Web->>Web: Persist UUID key and exact request in localStorage
  Web->>API: POST order with Idempotency-Key
  API->>DB: Begin transaction; lock active user, then cart
  API->>DB: Look up user + key before reading cart

  alt Same key and same fingerprint already placed
    DB-->>API: Existing order
    API-->>Web: Return existing order; do not change stock or cart
  else New key
    API->>DB: Lock products by ID; recheck availability, price, stock, address
    alt Any line changed or unavailable
      API-->>Web: Conflict with affected lines and current values
      Web-->>Customer: Keep cart; refresh review; ask for confirmation
    else All lines valid
      API->>DB: Create order, vendor portions, and snapshots
      API->>DB: Decrement stock and remove submitted cart lines
      API->>DB: Commit
      API-->>Web: Order confirmation
    end
  else Same key, different fingerprint
    API-->>Web: Conflict; do not create another order
  end
```

On timeout or network failure, the web app keeps the exact request and key and offers an explicit retry. It does not create a new key until the customer reviews changed order details. The API computes the fingerprint; it does not accept one from the browser. Product locks coordinate checkout with campaign price changes. Database changes and cart cleanup commit together or roll back together.

### Customer cancellation and vendor status aggregation

```mermaid
sequenceDiagram
  actor Customer
  participant CustomerWeb as Customer order page
  participant API as Order API
  participant DB as PostgreSQL
  actor Vendor
  participant VendorWeb as Vendor order page

  Customer->>CustomerWeb: Cancel whole order
  CustomerWeb->>API: POST customer order cancellation
  API->>DB: Lock parent order; reread all vendor portions
  alt Any portion is completed
    API-->>CustomerWeb: Reject cancellation; show current order status
  else No portion is completed
    API->>DB: Cancel remaining pending/processing portions atomically
    API->>DB: Restore stock for portions changed to cancelled
    API->>DB: Recalculate parent status; commit
    API-->>CustomerWeb: Return customer-safe order status
  end

  Vendor->>VendorWeb: Change vendor portion status
  VendorWeb->>API: POST vendor status update
  API->>DB: Lock parent order; reread vendor portions
  API->>DB: Validate and conditionally apply transition
  API->>DB: Restore stock only if pending portion changed to cancelled
  API->>DB: Recalculate parent status; commit
  API-->>VendorWeb: Return updated vendor order
```

The transaction lock order is parent order first, then vendor portions. Customer cancellation is all-or-nothing and becomes unavailable when any portion is `completed`. Vendors may cancel only `pending` portions; `processing` portions may only become `completed`. Stock restoration applies only to portions actually transitioned to `cancelled`, preventing duplicate restoration on retries.

Customer-facing status is derived from all vendor portions; customers do not receive vendor order IDs or per-vendor actions:

```mermaid
flowchart TD
  portions[Vendor portion statuses] --> allCancelled{All cancelled?}
  allCancelled -- Yes --> cancelled[Cancelled]
  allCancelled -- No --> allCompleted{All completed?}
  allCompleted -- Yes --> completed[Completed]
  allCompleted -- No --> anyCompleted{Any completed?}
  anyCompleted -- Yes --> partlyFulfilled[Partially fulfilled]
  anyCompleted -- No --> anyCancelled{Any cancelled?}
  anyCancelled -- Yes --> partlyCancelled[Partially cancelled]
  anyCancelled -- No --> anyProcessing{Any processing?}
  anyProcessing -- Yes --> processing[In progress]
  anyProcessing -- No --> pending[Order placed]
```

### Indian PIN-code lookup for address forms

```mermaid
sequenceDiagram
  actor Customer
  participant Web as Address form
  participant API as Location API
  participant IndiaPost as api.postalpincode.in

  Customer->>Web: Enter six-digit Indian PIN code
  Web->>Web: Enable lookup only for valid PIN format
  Web->>API: GET /api/locations/pincodes/{postalCode}
  API->>API: Validate PIN and apply lookup rate limit
  API->>IndiaPost: GET /pincode/{postalCode}, 5-second timeout
  IndiaPost-->>API: Post-office area, district, state
  API->>API: Validate response and map district to city
  API-->>Web: Distinct area/city/state options
  Web->>Web: Fill address fields from selected area
```

The lookup endpoint is public for guest delivery-location selection. Saving a customer address is a separate authenticated, ownership-checked flow; `customer-address.service.ts` also verifies that the PIN exists before persistence.

## Vendor operations

- Vendors manage profile, products, product media, and bulk imports through authenticated vendor routes.
- Vendor order list/detail/status flows exist in `apps/api/src/features/vendor/order.*` and the vendor app routes. Fulfillment statuses are `pending`, `processing`, `completed`, and `cancelled`; allowed transitions are defined by `getAllowedOrderActions`.
- Vendor order updates recalculate the parent order status. Order management routes remain available to suspended vendors so existing commitments can be fulfilled; product management requires an active vendor.
- Carrier integration, shipment tracking, and customer delivery notifications are not represented by the current vendor order status contract.

### Vendor fulfillment state flow

```mermaid
stateDiagram-v2
  [*] --> pending
  pending --> processing: vendor accepts/processes
  pending --> cancelled: vendor cancels
  processing --> completed: vendor completes
  completed --> [*]
  cancelled --> [*]
```

Each vendor status change locks the parent order first, verifies vendor ownership, rereads the portion, and applies a conditional transition in one transaction. Vendor cancellation is pending-only; stock is restored exactly once. Existing transition logic is in `getAllowedOrderActions` and `updateVendorOrderStatus` in `apps/api/src/features/vendor/order.service.ts`.

### Vendor media-library upload

```mermaid
sequenceDiagram
  actor Vendor
  participant Web as Media library UI
  participant API as Vendor media API
  participant R2 as R2 object storage
  participant Processor as Image/video processor
  participant DB as PostgreSQL

  Vendor->>Web: Select files
  Web->>API: POST /api/vendor/media/initiate with metadata
  API->>API: Check vendor session, MIME type, and size
  API-->>Web: Return media IDs, storage keys, and presigned URLs
  Web->>R2: PUT file bytes directly
  Web->>API: POST /api/vendor/media/complete with metadata
  API->>API: Verify vendor-owned storage key
  API->>R2: HEAD and read uploaded object
  API->>Processor: Create image variants or video poster/metadata
  Processor->>R2: Store processed assets
  API->>DB: Insert mediaLibrary record
  API-->>Web: Return media item and resolved URLs
  Web-->>Vendor: Show uploaded media and progress result
```

`apps/web/features/media/services/media.service.ts` sends metadata to the API and uploads bytes directly to R2. `completeMediaUpload` verifies ownership and uploaded object metadata, processes the file, then stores the library record. Failed processing cleans up the asset prefix.

## Admin operations and merchandising

- Admin routes cover administration, categories, vendors/customers, products, orders, and merchandising.
- Campaigns support draft editing, publishing, scheduling, product deal prices, banner media, and homepage listing. Public homepage campaign data is provided by `/api/merchandising/homepage`.
- Vendor media management is under `/api/vendor/media`. Admin media currently exposes a campaign media catalog; campaign banner upload operations are campaign-scoped. A broader admin media-library management workflow is separate follow-up work.

### Campaign banner upload

Campaign banner upload has its own draft-scoped flow; files are not inserted into the vendor media library.

```mermaid
sequenceDiagram
  actor Admin
  participant Web as Promotion editor
  participant API as Admin campaign API
  participant R2 as R2 object storage
  participant DB as PostgreSQL

  Admin->>Web: Choose campaign banner file
  Web->>API: POST draft banner metadata
  API->>DB: Verify owned campaign draft
  API->>API: Validate MIME type and 10 MB limit
  API-->>Web: Return presigned URL and draft storage key
  Web->>R2: PUT banner bytes directly
  Web->>API: POST banner completion metadata
  API->>DB: Re-verify draft ownership
  API->>R2: Verify object and metadata, read image
  API->>R2: Store processed image variants
  API->>DB: Save draft banner prefix
  API-->>Web: Return processed image URL
```

The flow is implemented by `promotion-editor.tsx`, `admin.service.ts`, and `merchandising.service.ts`. It uses direct-to-storage transfer but stores processed campaign draft assets separately from reusable vendor media.

### Campaign draft and publication flow

```mermaid
flowchart TD
  start[Admin creates promotion] --> draft[Draft row in campaigns]
  edit[Admin edits promotion] --> draft
  draft --> valid{Required content, schedule, products, and prices valid?}
  valid -- No --> draft
  valid -- Yes --> publish{New campaign or edit of published campaign?}
  publish -- New --> rowpub[Publish same row]
  publish -- Existing edit --> source[Update source published row and remove draft row]
  rowpub --> scheduled[Published and scheduled]
  source --> scheduled
  scheduled -->|start time reached| active[Shown as active campaign]
  scheduled -->|future start| upcoming[Shown as upcoming campaign]
  active -->|end time reached| expired[Not returned by homepage endpoint]
  upcoming -->|end time passed before start| expired
```

Drafts and published campaigns share `campaigns`; an edit draft points to its published source through `sourceCampaignId`. The homepage endpoint orders by campaign position and start time, then returns active campaigns and up to three upcoming campaigns. Publishing and schedule selection are implemented in `merchandising.service.ts`.

## Follow-up sequence discussed

1. Define shipment/tracking information and customer delivery notifications before adding shipping statuses.
2. Add customer review submission and decide purchase-verification rules.
3. Extend admin media-library management if needed beyond current campaign media selection/upload.

Treat this list as planning context, not an API contract. Update it when implementation scope changes.
