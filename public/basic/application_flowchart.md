# KeralamMatch — End-to-End Application Flowchart & Architecture

This document provides a comprehensive end-to-end flowchart detailing all user, matching, payment, and administrative workflows in **KeralamMatch**.

![KeralamMatch End-to-End Flowchart Diagram](file:///c:/Users/DELL/Downloads/Trivandrum%20Matrimonial/basic/end_to_end_flowchart.jpg)

---

## 1. High-Level System Architecture & User Journey

```mermaid
flowchart TD
    %% Styling
    classDef startEnd fill:#0A1F44,color:#FFFFFF,stroke:#C81D45,stroke-width:2px;
    classDef process fill:#FFFFFF,color:#0A1F44,stroke:#0A1F44,stroke-width:1.5px;
    classDef decision fill:#FCFBF7,color:#C81D45,stroke:#C81D45,stroke-width:2px;
    classDef admin fill:#0A1F44,color:#D4AF37,stroke:#D4AF37,stroke-width:1.5px;
    classDef success fill:#E6F4EA,color:#137333,stroke:#137333,stroke-width:1.5px;

    %% Entry Points
    A["🌐 Visitor Entry<br/>(Landing Page / SEO District / Blog)"]:::startEnd --> B{"Authenticated User?"}:::decision
    
    %% Auth Path
    B -- No --> C["📱 Auth Page (/auth)<br/>Mobile OTP / Google Sign-In"]:::process
    C --> D{"OTP Verified & Session Set?"}:::decision
    D -- No --> C
    D -- Yes --> E{"Profile Completed?"}:::decision
    
    %% Onboarding Path
    E -- No --> F["📝 10-Step Onboarding (/join)<br/>Basic, Career, Religion, Photos"]:::process
    F --> G["🛡️ Verification Queue Submit<br/>(Selfie / Aadhaar Check)"]:::process
    G --> H["🎉 Member Dashboard (/dashboard)"]:::success
    
    E -- Yes --> H
    B -- Yes --> H

    %% Core Application Actions
    H --> I["🔍 Discover & Search (/find)<br/>AI Smart Prompt / District Filter"]:::process
    I --> J["👤 View Target Profile (/profile/[id])"]:::process
    
    J --> K{"Action Choice"}:::decision
    K -- Shortlist --> L["⭐ Saved to Shortlist"]:::process
    K -- Direct Message --> M["💬 Encrypted Chat (/chat)"]:::process
    K -- Request Contact --> N["🔒 Contact Request (/requests)"]:::process

    %% Consent & Ephemeral Reveal
    N --> O{"Recipient Consents?"}:::decision
    O -- Declined --> P["❌ Request Declined"]:::process
    O -- Accepted --> Q["⏰ 24-Hour Ephemeral Reveal<br/>(Phone & Email Unlocked)"]:::success

    %% Subscription & Monetization
    H --> R["💎 Pricing Upgrade (/pricing)"]:::process
    R --> S{"Select Option"}:::decision
    S -- Membership Plan --> T["💳 Razorpay Checkout<br/>(Silver / Gold / Platinum)"]:::process
    S -- Reveal Credits --> U["🪙 Wallet Top-Up<br/>(Pay-Per-Reveal)"]:::process
    T & U --> V["✅ Webhook Verified & Benefits Unlocked"]:::success

    %% Admin Workflow
    W["🔑 Admin Login (/admin/login)"]:::admin --> X["📊 Admin Dashboard (/admin)"]:::admin
    X --> Y1["👥 User Management (/admin/users)"]:::admin
    X --> Y2["🛡️ Verification Queue (/admin/verification)"]:::admin
    X --> Y3["🚩 Report Moderation (/admin/reports)"]:::admin
    X --> Y4["💳 Payments & Revenue (/admin/payments)"]:::admin
```

---

## 2. Detailed Technical Workflows

### A. Authentication & Onboarding Workflow

1. **User Auth Phase (`/auth`)**:
   - User inputs 10-digit Indian Mobile Number or selects Google OAuth.
   - System triggers Firebase OTP delivery to phone.
   - Upon verification, backend creates encrypted HTTP-only session cookie (`km_session`).

2. **10-Step Onboarding Phase (`/join`)**:
   - **Step 1**: Basic Info (Name, DOB, Gender, Created For).
   - **Step 2**: Physical Attributes (Height, Complexion, Body Type).
   - **Step 3**: Religion & Community (Religion, Caste, Star/Horoscope).
   - **Step 4**: Education & Career (Degree, Institution, Occupation, Income).
   - **Step 5**: Location & District (State, District, City, Native Place).
   - **Step 6**: Family Background (Family Type, Status, Values, Parents).
   - **Step 7**: Lifestyle & Habits (Diet, Smoking, Drinking).
   - **Step 8**: Partner Preferences (Age Range, Height, Religion, District).
   - **Step 9**: Profile Photo Upload (Cloudinary storage integration).
   - **Step 10**: Liveness & ID Verification Submission (Selfie + Aadhaar).

---

### B. Matching Engine & Ephemeral Contact Reveal Workflow

1. **Matching & Discovery (`/find`)**:
   - Client executes quick filters (Religion, Caste, Location) or AI Natural Language Query (e.g. *"Software engineer from Ernakulam preferring vegetarian diet"*).
   - Backend processes search filters and calculates **Compatibility Score (%)** based on 12 key attributes.

2. **24-Hour Ephemeral Contact Reveal (`/requests`, `/profile/[id]`)**:
   - Candidate A clicks **"Send Contact Request"** on Candidate B's profile.
   - Candidate B receives real-time notification (`/notifications`) and email alert.
   - Candidate B reviews profile and clicks **"Accept"**.
   - System encrypts timestamp (`expiresAt = now + 24 hours`).
   - For exactly 24 hours, Candidate A and Candidate B can decrypt and view candidate phone number & email.
   - At $t > 24\text{ hours}$, credentials auto-lock and revert to masked state.

---

### C. Payment & Razorpay Gateway Workflow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Frontend as Next.js Client
    participant Controller as Payments Controller
    participant Razorpay as Razorpay Gateway
    participant Webhook as API Webhook Handler
    participant DB as PostgreSQL DB

    User->>Frontend: Selects Membership Plan / Credit Pack
    Frontend->>Controller: Calls checkoutSubscriptionAction(planId)
    Controller->>Razorpay: Creates Order (Amount, Currency, Receipt)
    Razorpay-->>Controller: Returns Order ID (rzp_order_...)
    Controller-->>Frontend: Renders Razorpay Payment Modal
    User->>Razorpay: Completes Payment (UPI / Netbanking / Card)
    Razorpay-->>Frontend: Payment Success Event
    Razorpay->>Webhook: Webhook Event: payment.captured
    Webhook->>DB: Updates Subscription / Wallet Balance
    Frontend->>User: Redirects to /pricing/success with Unlocked Features
```

---

### D. Admin Portal & Safety Moderation Workflow

```mermaid
flowchart LR
    A["🔐 Admin Login"] --> B["📊 Dashboard Overview"]
    
    B --> C1["👥 User Management"]
    C1 --> C1A["View Profiles / Ban Accounts / Reset Password"]
    
    B --> C2["🛡️ Verification Queue"]
    C2 --> C2A["Review Document Submissions"] --> C2B["Approve (Badge Given) / Reject"]
    
    B --> C3["🚩 Reports & Moderation"]
    C3 --> C3A["Review Reported Messages & Profiles"] --> C3B["Dismiss / Issue Warning / Suspend User"]
    
    B --> C4["💳 Financial Operations"]
    C4 --> C4A["View Revenues / Process Refunds / Audit Transactions"]
```

---

## 3. Summary of System Routes & Architecture Layers

| Layer | Component | Target Routes / Functions |
|---|---|---|
| **Public & SEO** | Landing, SEO, Blog | `/`, `/find/brides-in-[district]`, `/find/[community]-matrimony`, `/blog`, `/trust` |
| **Authentication** | Auth & Session | `/auth`, `/api/auth/session`, `/api/auth/logout` |
| **User Application** | Core Portal | `/join`, `/dashboard`, `/find`, `/profile/[id]`, `/chat`, `/requests`, `/notifications` |
| **Monetization** | Payments & Subscriptions | `/pricing`, `/pricing/success`, `/api/payments/razorpay/webhook` |
| **Admin Portal** | System Management | `/admin/login`, `/admin`, `/admin/users`, `/admin/verification`, `/admin/reports`, `/admin/payments`, `/admin/blog`, `/admin/faq`, `/admin/audit`, `/admin/settings` |

---

*Document generated for KeralamMatch Platform Architecture.*
