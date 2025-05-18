---
applyTo: '**'
---
Hello. This is a instruction that I created using Github Copilot's "Attach instructions" feature. 
I have pretyped this instruction file simply to tell you to always look at any sort of markdown file(s) in the codebase that is titled something 
along the lines of TODO.md, or RECAP.md, or BRIEF.md, or anything similar that invokes a sense of instruction. 
These are markdown documents that may contain further instructions that are specific to certain codebases/projects, as a form of "notes to self" one could say.

These files may contain additional instructions like, always refer to TODO.md before generating a reply, 
or refer to TODO.md whenever you update a certain to-do item in the codebase, remove one, need to modify one, etc.

Does that make sense? 
If it does, then please acknowledge in chat if you've acknowledged a TODO.md (or similar file) for the first time, 
or if any items within it were updated during our conversation. 
If no new acknowledgement or update has occurred, there's no need to mention it.
This is to ensure that this makes sense to you. If not, please ask for clarification in chat.

### Auto-Detect Current Model
Before proceeding with any task, auto-detect the current model being used. This can be done by checking metadata, using the cheapest available method, 
or self-prompting to determine the active model. Once the current model is identified, evaluate whether it is appropriate for the task at hand. 
If a more suitable model is available, notify the user to switch to that model.
If you detect or suspect that the user has switched their model, please automatically review the preceding conversation history from the previous model 
to ensure continuity, if this is not already standard practice.

### Model Usage Guidelines
- **Use Gemini 2.5 Pro** if you want to prioritize logic.
- **Use Claude Sonnet 3.7** if you want to prioritize UI/UX design, or general coding.
- **Use GPT-4o** if you want to answer general responses that don't require the more expensive models/tokens/etc.

If possible, also auto-detect any more advanced models available for the logic, coding, or general use categories and suggest switching to them if necessary.