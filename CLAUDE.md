# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ER Notes is a web application designed for emergency department physicians to manage timestamped patient notes during their shifts. The app prioritizes efficiency and speed, allowing doctors to quickly switch between patients, add notes, and track patient care throughout their ED stay.

## Development Commands

### Setup
```bash
npm install
```

### Running the Application
```bash
# Development mode with hot reload
npm run dev
# Opens at http://localhost:5173/

# Production build
npm run build

# Preview production build
npm run preview
```

### Type Checking
```bash
# TypeScript compilation check
npx tsc --noEmit
```

## Code Architecture

### High-Level Structure

React single-page application with component-based architecture. Data persistence uses browser LocalStorage, making this a fully client-side application with no backend required.

### Key Directories

- **src/components/**: React components for UI elements
- **src/utils/**: Utility functions for data persistence and formatting
- **src/types.ts**: TypeScript type definitions for the data model

### Core Components

- **App.tsx**: Main application container managing global state and orchestrating all operations
- **ShiftManager.tsx**: Top header component for creating/editing/deleting shifts
- **PatientList.tsx**: Left sidebar showing all patients in current shift with quick navigation
- **PatientDetail.tsx**: Main content area displaying patient notes and note input
- **NoteItem.tsx**: Individual note display with edit/delete functionality
- **ConfirmDialog.tsx**: Reusable confirmation modal for delete operations

### Data Flow

1. **Initial Load**: App loads data from LocalStorage on mount
2. **State Management**: All data stored in App component state
3. **Updates**: User actions trigger utility functions in `storage.ts` which:
   - Update the data structure
   - Persist to LocalStorage
   - Return new data to update React state
4. **Auto-save**: Every change automatically persists to LocalStorage
5. **Re-renders**: State changes trigger React re-renders to update UI

### Important Patterns

- **Immutable Updates**: All data operations return new objects rather than mutating existing state
- **Auto-selection**: When patients are added/deleted, the app intelligently selects an appropriate patient to display
- **Inline Editing**: Shift and patient names can be edited in-place with save/cancel options
- **Confirmation Dialogs**: All delete operations require explicit confirmation to prevent accidents
- **Dual Timestamps**: Notes preserve original creation time and add separate edit timestamp when modified

## Key Technologies

- **React 18**: Component library for UI
- **TypeScript**: Type safety and better developer experience
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library for clean, professional icons
- **LocalStorage**: Browser API for data persistence

## Important Conventions

### File Naming
- Components use PascalCase: `PatientList.tsx`
- Utilities use camelCase: `storage.ts`, `dateFormat.ts`
- Types file: `types.ts`

### Code Organization
- Each component in its own file
- Related utilities grouped in `utils/` directory
- All types exported from central `types.ts` file

### State Management
- Single source of truth in App component
- Props drilled down to child components
- Callback functions passed down for child components to trigger updates
- No external state management library (Redux, Zustand, etc.)

### Data Model
```typescript
Shift {
  id, name, createdAt,
  patients: Patient[]
}

Patient {
  id, name,
  notes: Note[]
}

Note {
  id, content, createdAt, editedAt?
}
```

## Configuration

- **vite.config.ts**: Vite configuration with React plugin
- **tsconfig.json**: TypeScript compiler options
- **tailwind.config.js**: Tailwind CSS configuration
- **postcss.config.js**: PostCSS configuration for Tailwind

## Gotchas and Common Issues

- **Data Persistence**: All data is stored in browser LocalStorage. Clearing browser data will delete all shifts and notes.
- **No Backend**: This is a fully client-side application. Data is not synced across devices or backed up to a server.
- **LocalStorage Limits**: Browser LocalStorage typically has a 5-10MB limit. Very large amounts of notes may hit this limit.
- **Date Formatting**: Dates stored as ISO strings, displayed with relative time for recent notes ("5 minutes ago") and formatted time for older notes.
- **Edit Preserves Original Timestamp**: When a note is edited, the original `createdAt` timestamp is preserved and a new `editedAt` timestamp is added.
