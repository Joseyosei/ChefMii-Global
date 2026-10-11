# 🍳 ChefMii — A Private Culinary Operating System
> *Connecting World-Class Private Chefs, Discerning Food Lovers, and Organic Local Growers through Google Gemini Intelligence.*

---

## 🌟 Executive Summary & Pitch

**ChefMii Global** is a next-generation culinary marketplace and autonomous AI hospitality operating system. It bridges the gap between master private chefs, bespoke event dining, Uber-style gourmet food delivery, and regenerative organic farm sourcing.

Powered by **Google Gemini AI** on **Google Cloud Platform**, ChefMii acts as a 24/7 autonomous culinary concierge—analyzing diner flavor profiles, calculating dietary nutritional constraints, orchestrating 16-country international chef bookings, and providing live animated GPS map delivery tracking with 100% Escrow financial protection via Stripe.

---

## 🧠 Google Gemini & Google Cloud Architecture

```
                                  ┌────────────────────────────────────────┐
                                  │           CHEFMII CLIENT (NEXT.JS 14)  │
                                  └────────────────────────────────────────┘
                                                       │
                                   User Query / Voice  │  Streaming AI Response
                                                       ▼
                                  ┌────────────────────────────────────────┐
                                  │      GEMINI AI CULINARY ENGINE         │
                                  │       (Google Cloud Vertex AI)         │
                                  │    • Gemini 3.5 & 3.7 Flash            │
                                  │    • 16-Country Culinary Knowledge     │
                                  │    • Dynamic Chef Card Generation      │
                                  │    • SpeechSynthesis Voice Narration   │
                                  └────────────────────────────────────────┘
                                                       │
                       ┌───────────────────────────────┴───────────────────────────────┐
                       ▼                                                               ▼
        ┌─────────────────────────────┐                                 ┌─────────────────────────────┐
        │   GOOGLE CLOUD & FIREBASE   │                                 │   STRIPE LIVE ESCROW SYSTEM │
        │ • Project: c5daea85-d002    │                                 │ • 100% Escrow Protection    │
        │ • Realtime Firestore DB     │                                 │ • Split-Bill Checkout       │
        │ • Secure Auth & Profiles    │                                 │ • 10% Platform Fee Payouts  │
        └─────────────────────────────┘                                 └─────────────────────────────┘
```

### 1. **Gemini 3.5 / 3.7 Multimodal AI Concierge**
- **Autonomous Culinary Matching**: Understands complex queries (e.g., *"Find me a Michelin-trained chef for a 10-person gluten-free truffle dinner"*).
- **Interactive Action Cards**: Dynamically returns interactive, clickable chef profile preview cards directly in the chat stream.
- **Voice Speech Synthesis**: Real-time voice narration for seamless hands-free culinary guidance.
- **Zero-Downtime Fallback Engine**: Built-in resilient heuristic system ensuring uninterrupted performance.

### 2. **16 International Master Chefs Roster**
Curated culinary talent representing 16 distinct nations and cuisines:
1. 🇮🇹 **Chef Marco Rossi** — Italian Fine Dining & Black Truffle Pasta (London, UK)
2. 🇯🇵 **Chef Yuki Tanaka** — Japanese Omakase & Edomae Sushi (Dubai, UAE)
3. 🇫🇷 **Chef Pierre Dubois** — French Haute Cuisine & Modern Classic (Paris, France)
4. 🇪🇸 **Chef Carlos Garcia** — Modern Spanish Tapas & Molecular Gastronomy (Barcelona, Spain)
5. 🇳🇬 **Chef Aisha Okafor** — West African Fine Dining & Firewood Jollof (Lagos, Nigeria)
6. 🇲🇽 **Chef Sofia Mendez** — Oaxacan Heritage & Smoked Mole (Mexico City, Mexico)
7. 🇮🇳 **Chef Meera Patel** — Royal Indian Mughlai & Tandoor (Mumbai, India)
8. 🇬🇭 **Chef James Osei** — Contemporary Afro-Fusion (Accra, Ghana)
9. 🇺🇸 **Chef Marcus Vance** — American Contemporary & Wood-Fired Smokehouse (New York, USA)
10. 🇨🇦 **Chef Éléna Beauchamp** — French-Canadian Foraged Terroir (Montreal, Canada)
11. 🇨🇳 **Chef Wei Zhang** — Imperial Cantonese & Artisanal Dim Sum (Beijing, China)
12. 🇺🇦 **Chef Olena Kovalenko** — Modern Ukrainian & Carpathian Heritage (Kyiv, Ukraine)
13. 🇳🇴 **Chef Henrik Lindqvist** — New Nordic Gastronomy & Fjord Seafood (Oslo, Norway)
14. 🇯🇵 **Chef Kenji Sato** — Kaiseki Artistry & Wagyu Master (Kyoto, Japan)
15. 🇰🇷 **Chef Min-Jun Park** — Modern Korean & 10-Year Aged Fermentation (Seoul, South Korea)
16. 🇸🇦 **Chef Tariq Al-Ghamdi** — Royal Hijazi & Arabian Peninsula Feasts (Riyadh, Saudi Arabia)

---

## 🚗 Uber-Style Gourmet Order Hub & Live GPS Delivery Tracking

### **Gourmet Food Ordering Hub (`/order`)**
- High-resolution dish photography and visual cuisine ribbons.
- Instant toggle between **Delivery** and **Pickup**.
- Interactive address selector with real-time ETA tags.
- Direct-to-consumer **Organic Farmer Marketplace**.

### **Real-Time GPS Map Tracking (`/order/tracking/[orderId]`)**
- **Live Vector Map**: Visualizes Chef's Kitchen 🍳, Customer Home 🏠, and moving Delivery Vehicle 🚗.
- **Dynamic Telemetry**: Live speed indicator, street waypoint progression, and heading rotation.
- **Driver Profile**: Driver Ahmed Hassan (★ 4.98), Blue Honda Civic (`LJ19 ABC`), direct Call button.
- **In-App Driver Messaging**: Real-time customer-to-driver communication modal.
- **Escrow Guarantee**: 100% Escrow Protection badge with itemized receipt breakdown.

---

## 💳 Live Production Financial Engine (Stripe Live)

- **Account ID**: `acct_1U5Hii0TzJU7vmcN`
- **100% Escrow Protection**: Client funds are held in secure escrow and released to the chef only upon successful event completion.
- **Split-Bill Feature**: Groups can split dining costs across multiple payment cards.
- **20% Advance Booking Deposit**: Reserve top chefs in advance with automated milestone balances.
- **Live Webhooks**: Automated event listeners for instant status reconciliation (`https://chefmii.com/api/webhooks/stripe`).

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router), TypeScript, TailwindCSS, Lucide Icons |
| **Artificial Intelligence** | Google Gemini 3.5 / 3.7 Flash, Google Cloud Vertex AI |
| **Cloud Infrastructure** | Google Cloud Platform (`project-c5daea85-d002-4d77-a3f`), Firebase Auth, Cloud Firestore |
| **Payments & Escrow** | Stripe Live Production Connect, Stripe Elements |
| **Deployment** | Vercel Edge Network, GitHub CI/CD |

---

## 🚀 Getting Started Locally

### 1. Clone the Repository
```bash
git clone https://github.com/Joseyosei/ChefMii.git
cd ChefMii
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables (`.env.local`)
Create a `.env.local` file with the following variables:
```env
# Google Cloud & Firebase
NEXT_PUBLIC_FIREBASE_PROJECT_ID=project-c5daea85-d002-4d77-a3f
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=project-c5daea85-d002-4d77-a3f.firebaseapp.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=project-c5daea85-d002-4d77-a3f.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=193892859007
GCP_PROJECT_ID=project-c5daea85-d002-4d77-a3f
GCP_PROJECT_NUMBER=193892859007

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_PROJECT_NAME=projects/531772435061
GEMINI_PROJECT_NUMBER=531772435061

# Stripe (Live Production)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key
STRIPE_SECRET_KEY=sk_live_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PLATFORM_FEE_PERCENT=10
NEXT_PUBLIC_APP_URL=https://chefmii.com
```

### 4. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🏆 Devpost Submission Checklist

- [x] **Google Gemini API Integrated**: Multi-turn culinary concierge with interactive chef booking cards.
- [x] **Google Cloud Connected**: Project `project-c5daea85-d002-4d77-a3f`.
- [x] **Live Stripe Payments**: 100% Escrow Protection with real card processing.
- [x] **Uber Eats-Style Food Delivery Hub**: Categories, dishes, and delivery/pickup mode.
- [x] **Live Real-Time Animated GPS Tracking**: Map navigation, vehicle speed, and driver chat.
- [x] **16 Global Master Chefs**: International representation across 16 countries.
- [x] **Clean Production Build**: 0 TypeScript errors, 0 build warnings.
- [x] **GitHub Repository Up-to-Date**: [`https://github.com/Joseyosei/ChefMii.git`](https://github.com/Joseyosei/ChefMii.git).
