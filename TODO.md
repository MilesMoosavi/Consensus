# Consensus App TODO List

## UI Improvements
- [x] Fix model selection flickering issue (completed)
- [x] Implement basic dark mode (completed)
- [x] Complete dark mode for all UI elements:
  - [x] Top navbar (completed)
  - [x] Model selection dropdown (completed)
  - [x] Consensus box (completed)
  - [] Model selected box
- [ ] Add light/dark mode toggle in header (default to dark mode)
- [ ] Convert model chips to horizontal layout instead of vertical listing
- [ ] Improve responsive design for mobile devices

## Features
- [ ] Implement streaming responses (show text as it's being generated)
- [ ] Add conversation history:
  - [ ] Persistent conversations
  - [ ] Temporary chat mode (deletes on refresh)
  - [ ] Left sidebar for conversation list
  - [ ] Ability to rename/delete conversations
- [ ] Complete the consensus generation feature (combine model responses)

## Technical Improvements
- [x] Fix React dependency warnings with useMemo (completed)
- [x] Improve state management with functional updates (completed)
- [ ] Add proper error handling for API calls
- [ ] Implement proper loading states
- [ ] Add unit and integration tests
