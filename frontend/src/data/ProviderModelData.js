/**
 * Contains data about available providers and models
 */
export const providerModelData = [
  {
    id: "google",
    name: "Google",
    icon: "🔍",
    available: true,
    models: [
      // Gemini 1.5 Models
      { id: "gemini-1.5-pro-002", name: "Gemini 1.5 Pro", available: true },
      {
        id: "gemini-1.5-flash-002",
        name: "Gemini 1.5 Flash",
        available: true,
      },
      {
        id: "gemini-1.5-flash-8b-001",
        name: "Gemini 1.5 Flash 8B",
        available: true,
      },

      // Gemini 2.0 Models
      { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", available: true },
      {
        id: "gemini-2.0-flash-001",
        name: "Gemini 2.0 Flash 001",
        available: true,
      },
      {
        id: "gemini-2.0-flash-lite",
        name: "Gemini 2.0 Flash Lite",
        available: true,
      },

      // Gemini 2.5 Models
      {
        id: "gemini-2.5-pro-preview-05-06",
        name: "Gemini 2.5 Pro Preview",
        available: true,
      },
      {
        id: "gemini-2.5-flash-preview-04-17",
        name: "Gemini 2.5 Flash Preview",
        available: true,
      },
    ],
  },
  {
    id: "openai",
    name: "OpenAI",
    icon: "🤖", // Or any other icon you prefer for OpenAI
    available: true, // Changed from false to true
    models: [
      { id: "gpt-4o", name: "GPT-4o", available: true }, // Changed from false to true
      { id: "gpt-4", name: "GPT-4", available: true }, // Changed from false to true
      // You can add other OpenAI models here if needed, e.g.:
      // { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", available: true },
    ],
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    icon: "🔍",
    available: false,
    models: [
      { id: "deepseek-coder", name: "DeepSeek Coder", available: false },
      { id: "deepseek-chat", name: "DeepSeek Chat", available: false },
    ],
  },
];

/**
 * Gets details about an active model
 * @param {string} modelId - The model ID to look up
 * @param {Array} providers - The provider data array
 * @returns {Object} Model details including provider info
 */
export const getModelDetailsById = (modelId, providers = providerModelData) => {
  const provider = providers.find((p) =>
    p.models.some((m) => m.id === modelId)
  );
  const model = provider?.models.find((m) => m.id === modelId);

  return {
    id: modelId,
    name: model?.name || modelId,
    providerName: provider?.name || "Unknown",
    providerIcon: provider?.icon || "❓",
  };
};

/**
 * Gets details for multiple active models
 * @param {Array} modelIds - Array of model IDs
 * @param {Array} providers - The provider data array
 * @returns {Array} Array of model details
 */
export const getActiveModelDetails = (modelIds, providers = providerModelData) => {
  return modelIds.map((modelId) => getModelDetailsById(modelId, providers));
};

/**
 * Gets default settings for a model
 * @returns {Object} Default model settings
 */
export const getDefaultModelSettings = () => ({
  useInternet: false,
  temperature: 0.7,
  maxTokens: 800,
  visible: true,
});
