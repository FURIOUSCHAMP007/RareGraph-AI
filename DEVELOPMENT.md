# RareGraph AI: Development Guide

This guide provides technical instructions for developers and researchers extending the RareGraph AI platform.

## 🛠 Prerequisites
- **Node.js**: v18.0.0 or higher.
- **npm**: v9.0.0 or higher.
- **Gemini API Key**: Required for the inference and entitizer engines.

## 🚀 Getting Started

### 1. Installation
Install project dependencies:
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory and add your Google Gemini API key:
```env
GEMINI_API_KEY=your_api_key_here
```

### 3. Development Server
Run the application in development mode:
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

## 🏗 Project Structure

### `/src/components`
Reusable UI units.
- `ui/`: Design system primitives (Cards, Badges, Buttons).
- `Navbar.tsx`: Semantic navigation with active state tracking.

### `/src/pages`
Module-specific dashboards.
- `DiagnosisPage.tsx`: The primary inference hub.
- `PharmacogenomicsPage.tsx`: Genetic drug-response analysis.
- `EntitizerPage.tsx`: Clinical note processing.
- `CollaborationPage.tsx`: Network-based peer review.
- `UncertaintyPage.tsx`: Risk and entropy analysis.

### `/src/services`
Core business logic and external integrations.
- `gemini.ts`: Wrapper for the `@google/genai` SDK, including system prompts for HPO mapping.

### `/src/types`
Standardized TypeScript interfaces for clinical data models and HPO entities.

## 🧪 Development Workflow

### Adding a New Module
1. Create the page component in `src/pages/`.
2. Define the new route in `src/App.tsx`.
3. Add a navigation link with a matching Lucide icon in `src/components/Navbar.tsx`.

### Extending the LLM Prompts
If you need to improve retrieval precision, modify the prompt templates in `src/services/gemini.ts`. We use strict JSON output schemas to ensure the UI can consistently parse inference results.

## 🚢 Deployment
To build the application for production:
```bash
npm run build
```
This will generate a `dist/` directory containing the optimized static assets.

## 🛡 Coding Standards
- **Strict Typing**: No `any` types. Use exhaustive interfaces for all clinical data.
- **Tailwind-First**: Custom CSS is discouraged. Use the theme extended in `tailwind.config.js` if necessary.
- **Immutability**: Maintain functional state updates (Redux pattern or `useState` with pure updates).

---

For technical issues or feature requests, contact the RareGraph AI Research Team.
