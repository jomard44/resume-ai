# ResumeTailor AI

AI-powered resume tailoring tool. Users paste a job description + their resume, pay $4, and get an AI-rewritten resume that matches the job perfectly.

## Tech Stack

- **Next.js** (App Router) — full-stack framework
- **Tailwind CSS** — styling
- **OpenRouter (or OpenAI fallback)** — AI resume generation
- **Stripe** — payment processing
- **TypeScript** — type safety

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env.local` and fill in your API keys:

```bash
cp .env.example .env.local
```

You need:

- **OpenRouter API key (recommended)** — get one at https://openrouter.ai/keys
- Optional fallback: **OpenAI API key** — get one at https://platform.openai.com/api-keys
- **Stripe secret key** — get one at https://dashboard.stripe.com/apikeys
- **Stripe webhook secret** — see step 4

Recommended AI env values:

```bash
OPENROUTER_API_KEY=or-...
OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct:free
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Set up Stripe webhooks (for local dev)

Install the Stripe CLI: https://stripe.com/docs/stripe-cli

```bash
stripe listen --forward-to localhost:3000/api/webhook
```

Copy the webhook signing secret it prints and add it to `.env.local` as `STRIPE_WEBHOOK_SECRET`.

### 5. Test a payment

Use Stripe test card: `4242 4242 4242 4242` with any future date and any CVC.

## Project Structure

```
src/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── tailor/page.tsx          # Resume input form
│   ├── result/page.tsx          # Shows tailored resume after payment
│   └── api/
│       ├── checkout/route.ts    # Creates Stripe checkout session
│       ├── tailor/route.ts      # OpenAI resume generation
│       ├── result/route.ts      # Verifies payment & returns result
│       └── webhook/route.ts     # Stripe webhook handler
└── lib/
    └── store.ts                 # In-memory store (replace with DB in production)
```

## Deploy to Production

1. Push to GitHub
2. Connect to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Set `NEXT_PUBLIC_BASE_URL` to your production domain
5. Add Stripe webhook endpoint in Stripe Dashboard pointing to `https://yourdomain.com/api/webhook`

## Next Steps (after first paying customers)

- [ ] Replace in-memory store with Supabase/Postgres
- [ ] Add user accounts (NextAuth.js)
- [ ] Add PDF resume upload (parse with pdf-parse)
- [ ] Add subscription tier ($15/mo for unlimited)
- [ ] Add analytics (Vercel Analytics or PostHog)
