# 🛠️ Next.js & Tailwind Project Rules (Strict Mode)

This document outlines the absolute, non-negotiable rules for generating code and architecture within this Next.js App Router and Tailwind CSS project. Adherence to these standards is mandatory for all contributions.

## 1. ⚙️ Technical Stack & Architecture Constraints

| Rule | Description | Next.js/Tailwind Specifics |
|------|-------------|---------------------------|
| **Data Fetching Paradigm** | STRICTLY prefer Server Components. Data fetching (async/await) must occur on the server where possible. | Avoid client-side useEffect for initial data loading on pages and layouts. NEVER expose API keys/secrets in client code. |
| **Styling Consistency** | All visual styles must use the utility-first classes of Tailwind CSS. | DO NOT use inline `<style>` tags, separate CSS files, CSS-in-JS, or any other styling solution. Use a unified `tailwind.config.js`. |
| **Component Boundaries** | Enforce a clear separation of concerns: Data/Logic (Server Components) vs. Interactivity (Client Components). | Components marked `"use client"` should be minimal wrappers focused only on hooks, state, and event handlers. |
| **API Layer** | Use modern Next.js conventions for API logic. | All internal API endpoints must be implemented using Route Handlers (`route.ts`), not the deprecated `/pages/api` structure. |

## 2. 🚀 Performance and Optimization

| Rule | Description | Next.js/Tailwind Specifics |
|------|-------------|---------------------------|
| **Asset Optimization** | All images must be optimized and served efficiently. | ALWAYS use the built-in `<Image>` component from `next/image` for automatic optimization, lazy loading, and responsive sizing. |
| **Code Splitting** | Reduce the initial load size. | Leverage Next.js's automatic code splitting. For heavy components, use `React.lazy` and `Suspense` (or dynamic imports) to load them only when needed. |
| **Minimize CSS Output** | Only include the styles that are used. | Ensure the project uses Tailwind's Purge/JIT features to minimize the final CSS bundle size in production builds. |
| **Font Loading** | Manage font files efficiently. | Use the built-in `next/font` module to handle local font optimization and loading without performance impact. |

## 3. ✍️ Code Quality and Design System

| Rule | Description | Next.js/Tailwind Specifics |
|------|-------------|---------------------------|
| **TypeScript Enforcement** | All new files and components must be written in TypeScript. | Use strict types for props, state, and API response shapes. Define clear interfaces for data structures (`interface User {...}`). |
| **Utility Classes** | Apply Tailwind classes in a consistent, readable order. | Recommended Order: Layout/Sizing (w-, h-, p-, m-), Typography, Colors (bg-, text-), Effects (shadow-, rounded-), Interactivity (hover:, focus:). |
| **Accessibility (A11y)** | Generated code must prioritize web accessibility standards. | Always include clear alt text for images. Use semantic HTML (e.g., `<button>` for buttons, not `<div>`). Use ARIA attributes where standard HTML is insufficient. |
| **Component Naming** | Follow clear, descriptive naming conventions. | Use PascalCase for components (`<SidebarNavigation>`). Use clear filenames that match the exported component name (e.g., `Button.tsx` exports `Button`). |

## 4. 🎨 UI/UX Playfulness Mandate

| Rule | Description | Next.js/Tailwind Specifics |
|------|-------------|---------------------------|
| **Aesthetic Goal** | The design must be modern, minimal, and playful. | Use soft, high-contrast color palettes. Favor large `rounded-xl` or `rounded-full` corners. Integrate subtle shadows (`shadow-md`, `shadow-indigo-300/50`). |
| **Interactivity** | All interactive elements must provide visual feedback. | MUST include transition effects (`transition duration-200 ease-in-out`) on hover, focus, and active states. Use subtle transforms like `hover:scale-[1.01]`. |
| **Spacing and Airiness** | The UI must feel open and easy to read. | Use generous spacing. Avoid dense layouts. Prefer larger Tailwind spacing values (e.g., `gap-6`, `p-8`) to create "white space." |