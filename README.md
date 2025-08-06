
## Overview

SprachPraxis is a German language learning application focused on CEFR-level speaking practice. The application provides structured exercises for different proficiency levels (A1-C2) with AI-powered analysis and feedback. Users can practice speaking through voice recognition or text input, receive detailed linguistic analysis, and track their progress over time.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built with React and TypeScript using Vite as the build tool. The application follows a component-based architecture with:

- **UI Framework**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Form Management**: React Hook Form with Zod validation

The frontend is structured around a single-page application with modular components for exercise selection, recording interface, and feedback display. The main practice workflow allows users to select CEFR levels, view exercise prompts, record responses, and receive AI analysis.

### Backend Architecture

The backend uses Express.js with TypeScript in a REST API architecture:

- **Framework**: Express.js with middleware for JSON parsing and request logging
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Storage Pattern**: Abstract storage interface allowing for both in-memory and database implementations
- **API Design**: RESTful endpoints for exercises, practice sessions, and user progress

The backend implements a clean separation between route handlers, business logic, and data storage through the IStorage interface pattern.

### Data Storage Solutions

The application uses PostgreSQL as the primary database with Drizzle ORM:

- **Database**: PostgreSQL (configured via DATABASE_URL environment variable)
- **ORM**: Drizzle with type-safe schema definitions
- **Migration Management**: Drizzle Kit for schema migrations
- **Fallback Storage**: In-memory storage implementation for development/testing

The database schema includes tables for exercises, practice sessions, and user progress tracking with proper relationships and indexing.

### Authentication and Authorization

Currently, the application does not implement user authentication. The system assumes a single-user context with progress tracking stored without user association. This suggests either a demo/prototype phase or intended single-user deployment.

### External Dependencies

- **AI Language Analysis**: OpenAI GPT-4o integration for analyzing German text submissions
- **Speech Recognition**: Web Speech API for browser-based voice recording (German language)
- **Database Hosting**: Designed to work with Neon Database (PostgreSQL-compatible)
- **Development Tools**: Replit-specific plugins and development server integration

The OpenAI integration provides detailed CEFR-level assessment, grammar analysis, and personalized feedback for German language learners. The system is designed to evaluate speaking proficiency across multiple dimensions including grammar, vocabulary, and sentence structure.
