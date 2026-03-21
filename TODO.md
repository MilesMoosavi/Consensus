# Consensus App TODO List

## 🎯 CRITICAL: Complete GitHub Models Migration (IMMEDIATE)

### Backend Integration (95% COMPLETE!)
- [x] Install Azure AI Inference SDK dependencies
- [x] Create GitHubModelsService.js with full model support  
- [x] Create backend routes (models, prompt, consensus)
- [x] Integrate GitHub Models with main server.js
- [x] Add GitHub Models routes to main server
- [x] Create multi-model consensus endpoint
- [ ] **⚠️ CRITICAL: Configure GITHUB_PAT environment variable**
- [ ] **Test GitHub Models backend functionality**

### Frontend Multi-Model Implementation (90% COMPLETE!)
- [x] Frontend ModelSelector updated for GitHub Models
- [x] Update ApiService for consensus calls
- [ ] **Design consensus results UI component**
- [ ] **Replace single-model with multi-model consensus in MainChatApp**
- [ ] **Test full frontend-to-backend consensus flow**

### Essential Project Setup
- [ ] **Set up proper dev environment commands/documentation**
- [ ] **Clean up legacy/example files** (latex examples, old consensus.js, etc.)
- [ ] **Update root package.json scripts for monorepo**
- [ ] **Test full application flow end-to-end**

## 🎨 UI/UX Improvements (Secondary Priority)

### Dark Mode & Styling
- [x] Fix model selection flickering issue
- [x] Implement basic dark mode
- [x] Complete dark mode for all UI elements:
  - [x] Top navbar
  - [x] Model selection dropdown  
  - [x] Consensus box
  - [ ] Model selected box (active models bar at the bottom)
- [x] Add light/dark mode toggle in header
- [ ] Convert model chips (active models bar) to horizontal layout
- [ ] Improve responsive design for mobile devices
- [ ] Enhance Markdown/LaTeX visual styling

### Advanced Consensus UI
- [ ] Display individual model responses in expandable cards
- [ ] Show consensus confidence scores and supporting models
- [ ] Add consensus method selection (majority, weighted, semantic)
- [ ] Implement model reliability weighting interface
- [ ] Add consensus analysis summary panel
- [ ] Show "models queried" vs "successful responses" stats

## 🔧 Technical Improvements

### Core Functionality  
- [ ] Add proper error handling for API calls (user-friendly messages)
- [ ] Implement proper loading states (per model response, consensus loading)
- [ ] Add streaming responses for individual LLM outputs
- [ ] Add conversation history persistence
- [ ] Implement left sidebar for conversation list
- [ ] Add ability to rename/delete conversations

### Advanced Features
- [ ] Implement search/filter functionality within model selector
- [ ] Add per-LLM controls (memory toggle, internet access toggle)
- [ ] Add global LLM controls (global memory, global internet access)
- [ ] Implement proper rate limiting and request throttling
- [ ] Add unit and integration tests

### Authentication & Data
- [x] Set up Google Sign-In integration
- [x] User profile page
- [x] Session management  
- [x] Set up authentication infrastructure
- [x] Create API routes for authentication flows
- [x] Secure data storage for user information
- [x] Set up protected routes in frontend
- [ ] (Optional) Email/password authentication

### Code Quality
- [x] Fix React dependency warnings with useMemo
- [x] Improve state management with functional updates
- [x] Consolidate LaTeX/Markdown rendering
- [x] Extract renderFormattedContent utility
- [x] Modularize App.jsx components
- [ ] Replace Storybook implementation with shared utility
- [ ] Ensure consistent rendering behavior between main app and Storybook

## 🚀 Deployment & Production
- [ ] Set up production environment variables
- [ ] Configure rate limiting for consensus endpoint  
- [ ] Add proper logging and monitoring
- [ ] Deploy web/mobile app
- [ ] Set up CI/CD pipeline

## UI Improvements (Secondary Priority)
- [x] Fix model selection flickering issue (completed)
- [x] Implement basic dark mode (completed)
- [x] Complete dark mode for all UI elements:
  - [x] Top navbar (completed)
  - [x] Model selection dropdown (completed)
  - [x] Consensus box (completed)
  - [ ] Model selected box (active models bar at the bottom)
- [X] Add light/dark mode toggle in header (default to dark mode)
- [ ] Convert model chips (active models bar) to a horizontal layout
- [ ] Improve responsive design for mobile devices
- [ ] Enhance Markdown/LaTeX visual styling (e.g., title sizes, list indentation, blockquote styling)

## Features
- [ ] Implement search/filter functionality within the model selector UI.
- [ ] Implement streaming responses for individual LLM outputs
- [x] Add conversation history:
  - [ ] Persistent conversations
  - [x] Temporary chat mode (deletes on refresh)
  - [ ] Left sidebar for conversation list
  - [ ] Ability to rename/delete conversations
- [x] Implement user authentication:
  - [x] Set up Google Sign-In integration
  - [ ] (Optional) Email/password authentication
  - [x] User profile page
  - [x] Session management
- [ ] Refine Consensus Generation:
  - [ ] Output: Tally unique responses (e.g., "True: 2, False: 3")
  - [ ] Output: Provide a concise consensus statement (e.g., "Consensus: False")
  - [ ] Add collapsible panel for detailed consensus rationale/thinking process (hidden by default)
- [ ] LLM Response Display:
  - [ ] Default to collapsed "thinking"/reasoning for each LLM response (show final answer or summary)
  - [ ] Allow users to expand/uncollapse to view full reasoning for each LLM response
- [ ] Per-LLM Controls (in each model's response header/panel):
  - [ ] Persistent memory toggle (e.g., brain icon) - implement state and UI
  - [ ] Internet access toggle (e.g., 🌐 icon) - ensure functionality and UI
- [ ] Global LLM Controls (e.g., bottom-left of the app):
  - [ ] Global toggle for Internet access for all active LLMs
  - [ ] Global toggle for persistent memory for all active LLMs
- [ ] Deploy web/mobile app

## Technical Improvements
- [x] Fix React dependency warnings with useMemo (completed)
- [x] Improve state management with functional updates (completed)
- [ ] Add proper error handling for API calls (display user-friendly messages)
- [ ] Implement proper loading states (more granular, e.g., per model response, consensus loading)
- [x] Set up authentication infrastructure:
  - [x] Create API routes for authentication flows
  - [x] Secure data storage for user information 
  - [x] Set up protected routes in frontend
- [ ] Add unit and integration tests
- [x] Consolidate LaTeX/Markdown rendering:
  - [x] Extract renderFormattedContent from App.jsx into a shared utility
  - [x] Update imports in App.jsx to use the shared utility
  - [ ] Replace Storybook implementation in renderFormatted.js with the shared utility
  - [ ] Ensure consistent rendering behavior between main app and Storybook
- [x] Modularize App.jsx:
  - [x] Create utility functions
  - [x] Create API service
  - [x] Extract UI components
  - [x] Improve code organization