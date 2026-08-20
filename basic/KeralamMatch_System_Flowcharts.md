# KeralamMatch — Master System Flowcharts & Architecture

This document contains all 4 official Mermaid flowcharts and operational sequences for **KeralamMatch**.

![KeralamMatch Master Flowchart](file:///c:/Users/DELL/Downloads/Trivandrum%20Matrimonial/basic/end_to_end_flowchart.jpg)

---

## 1. Master End-to-End User & Admin Journey Flowchart

```flowchart TD
    %% Styling Configuration
    classDef startEnd fill:#0A1F44,color:#FFFFFF,stroke:#C81D45,stroke-width:2px;
    classDef process fill:#FFFFFF,color:#0A1F44,stroke:#0A1F44,stroke-width:1.5px;
    classDef decision fill:#FCFBF7,color:#C81D45,stroke:#C81D45,stroke-width:2px;
    classDef admin fill:#0A1F44,color:#D4AF37,stroke:#D4AF37,stroke-width:1.5px;
    classDef success fill:#E6F4EA,color:#137333,stroke:#137333,stroke-width:1.5px;

    %% Entry Points & Public Discovery
    A["🌐 Visitor Discovery<br/>(Landing / District SEO / Community / Blog)"]:::startEnd --> B{"Authenticated Session?"}:::decision
    
    %% Authentication & Onboarding
    B -- No --> C["📱 Auth Page (/auth)<br/>Mobile SMS OTP / Google Sign-In"]:::process
    C --> D{"OTP Verified & Session Set?"}:::decision
    D -- No --> C
    D -- Yes --> E{"Profile Completed?"}:::decision
    
    %% Onboarding Path
    E -- No --> F["📝 10-Step Onboarding Wizard (/join)<br/>Basic, Religion, Career, Photos, Liveness"]:::process
    F --> G["🛡️ Verification Queue Submit<br/>(Selfie & ID Document Review)"]:::process
    G --> H["🎉 Member Dashboard (/dashboard)"]:::success
    
    E -- Yes --> H
    B -- Yes --> H

    %% Core Member Discovery & Matching
    H --> I["🔍 Discover Matches (/find)<br/>AI Prompt / 12-Attribute Filters"]:::process
    I --> J["👤 View Target Profile (/profile/[id])"]:::process
    
    J --> K{"Action Selected"}:::decision
    K -- Shortlist --> L["⭐ Added to Saved Shortlist"]:::process
    K -- Direct Message --> M["💬 Encrypted In-App Chat (/chat)"]:::process
    K -- Request Contact --> N["🔒 Send Contact Request (/requests)"]:::process

    %% 24-Hour Ephemeral Reveal Lifecycle
    N --> O{"Recipient Consents?"}:::decision
    O -- Declined --> P["❌ Request Closed"]:::process
    O -- Accepted --> Q["⏰ 24-Hour Ephemeral Window<br/>(AES-256 Decrypted Phone & Email Unlocked)"]:::success
    Q --> Q1{"Timer Expired (>24h)?"}:::decision
    Q1 -- Yes --> Q2["🔒 Credentials Auto-Lock & Re-mask"]:::process

    %% Monetization & Payments
    H --> R["💎 Pricing & Upgrades (/pricing)"]:::process
    R --> S{"Select Purchase"}:::decision
    S -- Membership Tier --> T["💳 Razorpay Checkout<br/>(Silver / Gold / Platinum)"]:::process
    S -- Reveal Credits --> U["🪙 Wallet Refill<br/>(Pay-Per-Reveal Packs)"]:::process
    T & U --> V["✅ Webhook Signature Verified & Benefits Provisioned"]:::success

    %% Admin Portal Suite
    W["🔑 Admin Login (/admin/login)"]:::admin --> X["📊 Admin Dashboard (/admin)"]:::admin
    X --> Y1["👥 User Management (/admin/users)"]:::admin
    X --> Y2["🛡️ Verification Queue Review (/admin/verification)"]:::admin
    X --> Y3["🚩 Report Moderation (/admin/reports)"]:::admin
    X --> Y4["💳 Financial Operations (/admin/payments)"]:::admin
    X --> Y5["📋 Audit Logs & Settings (/admin/audit)"]:::admin
```

### Operational Flow Breakdown:
1. **Visitor Discovery**: Visitors arrive via landing page (`/`), 13 district SEO pages, or 6 community hubs.
2. **Authentication & Onboarding**: Mobile SMS OTP (+91) sets `km_session` cookie, leading to 10-step onboarding (`/join`).
3. **Matching & Profile Viewing**: 12-attribute compatibility scoring (%) on `/find` and rich profile view on `/profile/[id]`.
4. **Action Choices**: Shortlist profile, encrypted in-app chat (`/chat`), or 24h contact reveal (`/requests`).
5. **Monetization & Upgrades**: Silver, Gold, Platinum plans and pay-per-reveal credit packs via Razorpay (`/pricing`).
6. **Admin Operations**: User management, verification queue, report moderation, and immutable audit logs.

---

## 2. The 24-Hour Ephemeral Contact Reveal Flowchart

```sequenceDiagram
    autonumber
    actor UserA as Candidate A (Requester)
    participant System as KeralamMatch Backend
    actor UserB as Candidate B (Recipient)
    participant DB as PostgreSQL Database

    UserA->>System: Clicks "Send Contact Request"
    System->>DB: Creates ContactRequest (status: PENDING)
    System->>UserB: Sends In-App Notification & Resend Email
    UserB->>System: Inspects Candidate A Profile & Clicks "Accept"
    System->>DB: Sets status = ACCEPTED, expiresAt = now + 24h
    System->>UserA: Notifies "Request Accepted! 24h Window Active"
    UserA->>System: Opens Profile B (/profile/[id])
    System->>DB: Checks active reveal (now < expiresAt)
    System->>UserA: Decrypts AES-256 Phone & Email + Displays 24:00:00 Countdown
    Note over UserA,UserB: Exactly 24 Hours Pass (now > expiresAt)
    UserA->>System: Requests Profile B contact details
    System-->>UserA: 403 Forbidden: ACCESS_EXPIRED_OR_LOCKED (Auto-locked)
```

### Operational Flow Breakdown:
1. **Step 1: Request Initiation**: Candidate A clicks "Send Contact Request". Status set to `PENDING`.
2. **Step 2: Notification & Consent**: Candidate B receives real-time notification and email alert.
3. **Step 3: Mutual Consent Approval**: Candidate B clicks "Accept". Backend sets `expiresAt = now + 24 hours`.
4. **Step 4: Decrypted Unlocking**: Candidate A views Profile B. AES-256 decrypted phone & email are displayed with countdown.
5. **Step 5: Automatic Re-Locking**: When `now > expiresAt`, credentials auto-lock and throw `403 ACCESS_EXPIRED_OR_LOCKED`.

---

## 3. Razorpay Payment & Webhook Architecture Flowchart

```sequenceDiagram
    autonumber
    actor User as Member
    participant Client as Next.js 16 Client
    participant Server as Next.js Server Action
    participant RZP as Razorpay Gateway API
    participant Webhook as Webhook Route Handler (/api/payments/razorpay/webhook)
    participant DB as PostgreSQL Database

    User->>Client: Selects Silver / Gold / Platinum / Credit Pack
    Client->>Server: Calls checkoutSubscriptionAction(planId)
    Server->>RZP: Creates Order (Amount, INR, Receipt ID)
    RZP-->>Server: Returns Order ID (rzp_order_...)
    Server-->>Client: Initializes Razorpay Standard Modal
    User->>RZP: Completes Payment (UPI / Netbanking / Card)
    RZP-->>Client: Triggers onSuccess callback
    RZP->>Webhook: Dispatches Webhook Event (payment.captured)
    Webhook->>Webhook: Validates HMAC SHA-256 Webhook Signature
    Webhook->>DB: Activates Subscription / Credits Wallet Balance
    Client->>User: Redirects to /pricing/success with Unlocked Features
```

### Operational Flow Breakdown:
1. **Step 1: Plan Selection**: User selects plan tier or ₹99 credit refill on `/pricing`.
2. **Step 2: Order Creation**: Next.js Server Action calls Razorpay Order API and returns `rzp_order_id`.
3. **Step 3: Client Checkout**: Standard Razorpay modal opens supporting UPI, Netbanking, and Cards.
4. **Step 4: Webhook Event Dispatch**: Razorpay fires webhook (`payment.captured`) to `/api/payments/razorpay/webhook`.
5. **Step 5: Signature Validation & Provisioning**: Server validates HMAC SHA-256 signature and provisions user benefits.

---

## 4. Admin Governance & Verification Flowchart

```flowchart LR
    classDef admin fill:#0A1F44,color:#D4AF37,stroke:#D4AF37,stroke-width:1.5px;
    classDef process fill:#FFFFFF,color:#0A1F44,stroke:#0A1F44,stroke-width:1.5px;
    classDef badge fill:#E6F4EA,color:#137333,stroke:#137333,stroke-width:1.5px;

    A["🔐 Admin Login (/admin/login)"]:::admin --> B["📊 Dashboard Overview (/admin)"]:::admin
    
    B --> C1["🛡️ Verification Queue (/admin/verification)"]:::admin
    C1 --> C1A["Inspect Selfie Liveness & Aadhaar ID"]:::process
    C1A --> C1B["Approve ──► Green Verified Badge Issued"]:::badge
    C1A --> C1C["Reject ──► Re-upload Prompt Sent"]:::process

    B --> C2["🚩 Report Moderation (/admin/reports)"]:::admin
    C2 --> C2A["Review Reported Accounts & Flags"]:::process
    C2A --> C2B["Dismiss / Issue Warning / Suspend User"]:::process

    B --> C3["💳 Revenue & Payments (/admin/payments)"]:::admin
    C3 --> C3A["Audit Ledger, Subscriptions & Refunds"]:::process

    B --> C4["📋 Audit Logs (/admin/audit)"]:::admin
    C4 --> C4A["Immutable Timeline of All Staff Actions"]:::process
```

### Operational Flow Breakdown:
1. **Admin Authentication**: Guarded login at `/admin/login` redirects staff to dark navy layout (`/admin`).
2. **Verification Queue Review**: Inspect selfie liveness and Aadhaar ID uploads; issue green verified badges.
3. **Report Moderation**: Review flagged accounts and issue warnings or instant bans.
4. **Financial Oversight**: Audit revenue ledger, subscriptions, and process refunds.
5. **Audit Trail**: Immutable logging of every staff action with timestamp, admin ID, and IP address.
