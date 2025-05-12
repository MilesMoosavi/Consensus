# Consensus App TODO List

## UI Improvements
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
- [ ] Implement streaming responses for individual LLM outputs
- [ ] Add conversation history:
  - [ ] Persistent conversations
  - [ ] Temporary chat mode (deletes on refresh)
  - [ ] Left sidebar for conversation list
  - [ ] Ability to rename/delete conversations
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
- [ ] Add unit and integration tests
