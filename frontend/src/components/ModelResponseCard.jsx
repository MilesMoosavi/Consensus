import React from "react";

const ModelResponseCard = ({ response, renderFormattedContent }) => {
  const { providerIcon, modelName, isLoading, error, content } = response;

  return (
    <div className={`model-response ${isLoading ? "loading" : ""}`}>
      <div className="model-response-header">
        <div className="model-info">
          <span className="model-icon">{providerIcon}</span>
          <span className="model-name">{modelName}</span>
          {isLoading && <span className="loading-indicator">⏳</span>}
          {error && <span className="error-indicator">⚠️</span>}
        </div>
      </div>
      <div className="model-response-content">
        {isLoading ? (
          <div className="skeleton-loader"></div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div
            dangerouslySetInnerHTML={{
              __html: renderFormattedContent(content),
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ModelResponseCard;