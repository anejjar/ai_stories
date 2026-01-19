# AI Stories - Personalized Baby Stories App

A Next.js application that empowers parents to create beautiful, personalized stories starring their child using AI.

## Features

- **Free Trial**: Generate 1 free story to experience the magic
- **PRO Tier**: Unlimited text story generation with rewrite/enhance tools
- **Family Plan Tier**: Everything in PRO plus AI-illustrated stories

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand + React Query
- **Backend**: Firebase (Auth, Firestore, Storage)
- **AI**: Google Gemini 1.5 Flash
- **Payments**: Stripe
- **Animations**: Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase account
- Google Gemini API key
- Stripe account (for payments)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd ai_stories
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.local.template` to `.env.local`
   - Follow the detailed setup guide in `SETUP.md`
   - Fill in all required API keys and configuration

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
app/
  (auth)/          # Authentication pages
  (dashboard)/     # Main app pages
  api/             # API route handlers
components/
  ui/              # shadcn/ui components
  auth/            # Auth components
  stories/          # Story-related components
  modals/          # Modal components
lib/
  firebase/        # Firebase configuration
  ai/              # AI service integrations
  payments/        # Stripe integration
  auth/            # Authentication utilities
  api/             # API utilities
  utils/           # General utilities
types/             # TypeScript type definitions
hooks/             # React hooks
store/             # Zustand stores
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Development Guidelines

See `RULES.MD` for strict coding standards and conventions.

## Documentation

- `project_plan.md` - Complete product plan and roadmap
- `SETUP.md` - Detailed setup instructions for all services
- `RULES.MD` - Coding standards and best practices

## License

[Add your license here]

## Support

[Add support information here]

