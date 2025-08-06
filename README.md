# GermanPro

## Overview
GermanPro is a language-learning web app designed to support German speaking practice aligned with CEFR levels (A1–C2). You can practice using voice or text input, receive AI-powered feedback, and track your progress.

## Features
Practice speaking exercises tailored for each CEFR level (A1 → C2)

Input your responses via voice or text

Get detailed linguistic analysis powered by OpenAI GPT‑4o

Track progress over time with personalized feedback

Communication style: simple, everyday language


## Architecture
### Frontend
Built with React + TypeScript and Vite. Key libraries and tools:

UI Framework: Radix UI + shadcn/ui styling

Styling: Tailwind CSS with custom CSS variables (dark/light themes)

State Management: TanStack Query

Routing: Wouter

Forms & Validation: React Hook Form + Zod

Main workflow:

Select CEFR level

View speaking prompt

Record your response (voice/text)

View AI-generated feedback

### Backend
A REST API built with Express.js and TypeScript. Architecture highlights:

Server Framework: Express.js (JSON parsing, logging)

Database Layer: Drizzle ORM with PostgreSQL

Storage Pattern: Abstracted interface for both in-memory and PostgreSQL storage

API Design: Endpoints for exercises, practice sessions, and progress tracking

Clean separation: routes → business logic → storage

## Data Storage
Primary Database: PostgreSQL (configured via DATABASE_URL)

ORM & Migrations: Drizzle ORM & Drizzle Kit

Development Mode: In-memory storage fallback

Schema supports exercises, sessions, and user progress, with proper indexing for performance


## Auth
No user authentication yet

Single-user context: progress tracked without user accounts

Implementation reflects prototype/demo phase or single-user use case


## Dependencies
AI Analysis: OpenAI GPT‑4o for CEFR assessment, grammar & vocabulary feedback

Speech Recognition: Web Speech API (German language support)

Database Hosting: Compatible with Neon Database (PostgreSQL)

Development Tools: Replit plugins and integrated dev server
