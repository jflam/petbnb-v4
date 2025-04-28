# CLAUDE.md - Development Guide

This document describes the development practices, commands, and code style guidelines for the PetBnB project.

## Build, Lint, and Test Commands

### Root Commands
- `npm run dev` - Run both server and client in parallel
- `npm run server` - Run only the server
- `npm run client` - Run only the client
- `npm run bootstrap` - Install dependencies in root, server and client

### Server Commands (server/)
- `npm run dev` - Run migrations, seed data, and start server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm run migrate` - Run latest migrations
- `npm run seed` - Run database seeds

### Client Commands (client/)
- `npm run dev` - Run Vite dev server with HMR
- `npm run build` - Create production build
- `npm run preview` - Preview production build locally

## Code Style Guidelines

### Import Ordering
```typescript
// 1. External dependencies (alphabetical order)
import cors from 'cors';
import express from 'express';
import React, { useEffect, useState } from 'react';

// 2. Internal modules (alphabetical order)
import db from './db';
import App from './App';
import './App.css';
```

### Formatting Preferences
- 2-space indentation
- Single quotes for strings
- Semicolons at end of statements
- Arrow functions for callbacks and anonymous functions
- Template literals for string interpolation
- Function declarations for primary component exports

### Type Usage Patterns
- TypeScript interfaces for object shapes:
```typescript
interface Fortune {
  id: number;
  text: string;
}
```
- Type annotations for useState hooks:
```typescript
const [fortune, setFortune] = useState<Fortune | null>(null);
```
- Inline types for simpler cases:
```typescript
await db<{ id: number; text: string }>('fortunes')
```
- Non-null assertion operator (!) when type is guaranteed:
```typescript
document.getElementById('root')!
```
- Type annotations for error handling:
```typescript
catch (e: any) {
  setError(e.message);
}
```

### Naming Conventions
- PascalCase for React components: `App`, `Button`
- camelCase for variables, functions, and instances: `fetchFortune`, `setLoading`
- ALL_CAPS for constants: `PORT`
- Descriptive, semantic naming that explains purpose

### Error Handling Patterns
- Try/catch blocks for async operations:
```typescript
try {
  // Operation that might fail
} catch (err) {
  // Error handling
  console.error(err);
  // Respond with appropriate status
  res.status(500).json({ error: 'Internal server error.' });
}
```
- Client-side:
  - State for tracking errors: `const [error, setError] = useState<string | null>(null);`
  - Display error messages to users
  - Reset errors when retrying operations
  - Use finally block to ensure cleanup happens regardless of success/failure

### File Structure
- Separate client and server codebases
- Server uses CommonJS modules
- Client uses ES modules
- Simple, flat structure with minimal nesting
- Component-focused organization

### CSS Conventions
- Class-based styling
- Semantic class names: `.app-container`, `.card`, `.btn`
- Flexbox for layout
- CSS variables for theming (not yet implemented, but recommended)

## Development Workflow
1. Run `npm run bootstrap` to install all dependencies
2. Run `npm run dev` to start both server and client
3. Server runs on http://localhost:4000
4. Client runs on http://localhost:3000 with API proxy to server
5. Make changes and see them hot reload

## Project Architecture
- Backend: Express + Knex + SQLite API
- Frontend: React/Vite SPA
- Monorepo structure with separate package.json files