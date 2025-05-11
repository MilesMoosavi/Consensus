# Consensus Project Roadmap

## Project Overview
Consensus is a prototype application that allows users to input a prompt and get responses from multiple LLMs (such as Google's Gemini, ChatGPT, etc.) simultaneously, generating a dynamically created consensus answer based on the responses from all selected models.

## Development Roadmap

1. **Project scaffolding**  
   - mkdir Consensus && cd Consensus  
   - git init
   - npm init -y  

2. **Install dependencies**  
   - axios (HTTP calls)  
   - dotenv (load API key)  
   - readline (user input)  
   ```bash
   npm install axios dotenv
   ```

3. **Secure your API key**  
   - Create a `.env` in your project root:  
     ```
     GEMINI_API_KEY=your_google_api_key_here
     ```  
   - Add `.env` to `.gitignore`

4. **Accept user prompts**  
   - Use Node's `readline` in a simple CLI to read a prompt from stdin.

5. **Call Gemini's API**  
   - Write a function that:  
     – Reads `process.env.GEMINI_API_KEY`  
     – Sets up the request payload (`model`, `prompt`, `stream: true` if available)  
     – POSTs to the Gemini endpoint  
     – Parses streaming chunks (if supported) or the full JSON

6. **Display responses in real time**  
   - If streaming is supported, pipe chunks to `process.stdout` as they arrive  
   - Otherwise, print the full response once received

7. **Aggregate into a "consensus"**  
   - For now, with only one model you can echo Gemini's answer  
   - Later, call multiple endpoints in parallel (e.g. ChatGPT, Anthropic) and apply a merging algorithm (majority vote, semantic similarity, etc.)

8. **Error handling & rate-limits**  
   - Wrap calls in `try/catch` and handle HTTP 4xx/5xx  
   - Throttle requests if you hit Google's rate limits

9. **Run locally**  
   ```bash
   node consensus.js
   ```

## Important considerations
- Streaming support (inspect Gemini docs for `stream: true`)
- Environment variable safety (`dotenv`, `.gitignore`)
- Rate limits and retries (exponential backoff)
- Parallel calls and merging logic for true "consensus"

## Next Steps
- Add support for more LLM providers (OpenAI, Anthropic, etc.)
- Develop a consensus algorithm to merge responses
- Create a simple web interface
- Add configuration options for temperature, max tokens, etc.
