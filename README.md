# Kiosk Backoffice Frontend

Next.js-based admin panel for the Kiosk system.

## Features

- 🔐 JWT-based authentication
- 📊 Dashboard with statistics
- 🖼️ Image management
- 🎥 Video management
- 🎨 Modern UI with Tailwind CSS
- ⚡ React Query for data fetching
- 🔒 Protected routes with middleware

## Tech Stack

- **Next.js 14+** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **TanStack Query** (React Query)
- **Zustand** (State management)
- **React Hook Form** + **Zod** (Form validation)
- **Axios** (HTTP client)

## Getting Started

### Prerequisites

- Node.js 20+
- Backend API running (default: http://localhost:3000)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```bash
cp .env.local.example .env.local
```

3. Update `.env.local` with your API URL:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3001](http://localhost:3001) in your browser.

## Project Structure

```
app/
├── (dashboard)/          # Protected dashboard routes
│   ├── layout.tsx        # Dashboard layout
│   ├── page.tsx          # Dashboard home
│   ├── images/           # Images management
│   ├── videos/           # Videos management
│   └── profile/          # Admin profile
├── login/                # Login page
└── layout.tsx            # Root layout

components/
├── ui/                   # Reusable UI components
├── layout/               # Layout components (Sidebar, Header)
├── auth/                 # Authentication components
└── providers/           # Context providers

lib/
├── api/                  # API client and endpoints
├── hooks/                # Custom React hooks
├── store/                # Zustand stores
└── utils/                # Utility functions

types/                    # TypeScript type definitions
```

## Authentication

The app uses JWT tokens stored in cookies. The middleware automatically:
- Redirects unauthenticated users to `/login`
- Redirects authenticated users away from `/login` to `/dashboard`

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Phase 1 Status

✅ Project setup (Next.js, TypeScript, Tailwind)
✅ shadcn/ui component installation
✅ API client setup with interceptors
✅ Authentication flow (login, token management)
✅ Protected route middleware
✅ Basic layout (sidebar, header)

## Next Steps (Phase 2)

- [ ] Dashboard statistics page
- [ ] Images list and detail pages
- [ ] Videos list and detail pages
- [ ] React Query integration
- [ ] Error handling and loading states
