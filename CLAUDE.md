# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `npm run dev` (runs on port 8080)
- **Build for production**: `npm run build`
- **Build for development**: `npm run build:dev`
- **Lint code**: `npm run lint`
- **Preview production build**: `npm run preview`

## Architecture Overview

FlexiBugBeauty is a React-based beauty professional management platform built with:

### Core Stack
- **React 18** with TypeScript
- **Vite** as build tool and dev server
- **React Router** for client-side routing
- **TanStack Query** for server state management
- **Supabase** as backend-as-a-service with PostgreSQL database

### UI Framework
- **Tailwind CSS** for styling
- **Radix UI** components library for accessible primitives
- **shadcn/ui** component system
- **Lucide React** for icons
- **next-themes** for theme switching

### Key Architecture Patterns

#### Authentication & Authorization
- Authentication handled via `AuthContext` (`src/contexts/AuthContext.tsx`)
- Supabase auth with email/password and Google OAuth
- Route protection via `ProtectedRoute` component
- User types: `beauty_professional` and `client`

#### Data Layer
- Supabase client configuration in `src/integrations/supabase/`
- Custom hooks for data fetching (e.g., `useAppointments`, `useClientProfiles`)
- Real-time subscriptions for appointments and messages

#### Component Organization
- **UI Components**: `src/components/ui/` (shadcn/ui components)
- **Feature Components**: Organized by domain (calendar, client, leads, messaging, etc.)
- **Pages**: `src/pages/` for route components
- **Hooks**: `src/hooks/` for custom React hooks

#### Key Features
- **Appointment Management**: Calendar views, drag-drop scheduling, time blocks
- **Client Management**: Profiles, dashboard, appointment history
- **Lead Management**: Forms, pipeline, conversion tracking
- **Messaging**: Real-time chat system
- **Portfolio Management**: Image upload and showcase
- **Settings**: Business settings, branding, notifications

### Path Aliases
- `@/*` maps to `src/*` for clean imports

### Database Integration
- Supabase PostgreSQL with migrations in `supabase/migrations/`
- Edge functions in `supabase/functions/` for server-side logic
- Real-time subscriptions enabled for appointments

### Type Safety
- TypeScript with relaxed strictness settings
- Database types auto-generated in `src/integrations/supabase/types.ts`
- Form validation using Zod and React Hook Form