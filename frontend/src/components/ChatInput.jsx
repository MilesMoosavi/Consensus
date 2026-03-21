import React from "react";

const ChatInput = ({
  prompt,
  setPrompt,
  isLoading,
  activeModels,
  handleSubmit,
  setShowModelSelector,
}) => {
  return (
    <div className="chat-input">
      <div className="input-container">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={
            activeModels.length === 0
              ? "Select models first..."
              : "Type your message..."
          }
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          disabled={isLoading || activeModels.length === 0}
        />
        <div className="input-actions">
          <button className="action-button" title="Attach file">
            📎
          </button>
          <button
            className="submit-button"
            onClick={handleSubmit}
            disabled={
              isLoading || !prompt.trim() || activeModels.length === 0
            }
          >
            {isLoading ? "⏳" : "➤"}
          </button>
        </div>
      </div>

      <div className="active-models-chips">
        {activeModels.map((model) => (
          <div key={model.id} className="model-chip">
            <span className="model-icon">{model.providerIcon}</span>
            <span className="model-name">{model.name}</span>
            <button
              className="remove-model"
              onClick={(e) => {
                e.stopPropagation();
                setShowModelSelector(true);
              }}
              title={`Remove ${model.name}`}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatInput;