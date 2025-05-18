import React from "react";

const ConsensusPanel = ({ consensus, renderFormattedContent }) => {
  const { isLoading, content, error } = consensus;

  return (
    <div className="consensus-response">
      <div className="consensus-header">
        <span className="consensus-icon">🤝</span>
        <span>Consensus (via Gemini 2.0 Flash)</span>
        {isLoading && <span className="loading-indicator">⏳</span>}
        {error && <span className="error-indicator">⚠️</span>}
      </div>
      <div className="consensus-content">
        {isLoading ? (
          <div className="skeleton-loader"></div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : content ? (
          <div
            dangerouslySetInnerHTML={{
              __html: renderFormattedContent(content),
            }}
          />
        ) : (
          <p>No consensus generated.</p>
        )}
      </div>
    </div>
  );
};

export default ConsensusPanel;