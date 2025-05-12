import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

// Base Gemini API endpoint
const GEMINI_API_BASE =
  "https://generativelanguage.googleapis.com/v1beta/models";

/**
 * Query the Gemini API with a user prompt
 */
async function queryGemini(prompt, model = "gemini-1.5-pro-002") {
  try {
    const apiUrl = `${GEMINI_API_BASE}/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const response = await axios.post(apiUrl, {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
      },
    });

    if (
      response.data &&
      response.data.candidates &&
      response.data.candidates[0] &&
      response.data.candidates[0].content &&
      response.data.candidates[0].content.parts &&
      response.data.candidates[0].content.parts[0]
    ) {
      return response.data.candidates[0].content.parts[0].text;
    } else {
      throw new Error("Unexpected response structure from Gemini API");
    }
  } catch (error) {
    if (error.response) {
      const errorMessage = error.response.data.error
        ? error.response.data.error.message
        : JSON.stringify(error.response.data);
      throw new Error(`API Error: ${error.response.status} - ${errorMessage}`);
    } else if (error.request) {
      throw new Error("Network error - no response received");
    } else {
      throw error;
    }
  }
}

/**
 * Handle different LLM providers
 */
async function queryLLM(
  prompt,
  provider = "google",
  model = "gemini-1.5-pro-002"
) {
  switch (provider) {
    case "google":
      return await queryGemini(prompt, model);
    default:
      throw new Error(`Provider '${provider}' is not supported yet.`);
  }
}

// Main serverless function handler for Vercel
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // Handle OPTIONS request (pre-flight)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow POST for actual requests
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ message: "Method not allowed. Please use POST." });
  }

  const {
    prompt,
    provider = "google",
    model = "gemini-1.5-pro-002",
  } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: "Prompt is required" });
  }

  try {
    // Only allow specific providers that are actually implemented
    if (provider !== "google") {
      return res
        .status(400)
        .json({ message: `Provider '${provider}' is not supported yet.` });
    }

    const response = await queryLLM(prompt, provider, model);
    return res.status(200).json({ response, provider, model });
  } catch (error) {
    console.error("Error in API handler:", error.message);
    return res
      .status(500)
      .json({ message: error.message || "Failed to get response from LLM" });
  }
}
