import React from "react";
import UserMessage from "./UserMessage";
import ModelResponseCard from "./ModelResponseCard";
import ConsensusPanel from "./ConsensusPanel";

const MessageList = ({ messages, renderFormattedContent, messagesEndRef }) => {
  return (
    <div className="chat-messages">
      {messages.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💬</div>
          <h2>Welcome to Consensus</h2>
          <p>Select models and start chatting to compare responses</p>
        </div>
      ) : (
        messages.map((message) => (
          <div key={message.id} className={`message ${message.role}`}>
            {message.role === "user" ? (
              <UserMessage
                content={message.content}
                renderFormattedContent={renderFormattedContent}
              />
            ) : message.role === "system" ? (
              <div className="system-message">{message.content}</div>
            ) : (
              <div className="assistant-responses">
                {Object.entries(message.modelResponses).map(
                  ([modelId, response]) => (
                    <ModelResponseCard
                      key={modelId}
                      response={response}
                      renderFormattedContent={renderFormattedContent}
                    />
                  )
                )}

                {message.consensus && (
                  <ConsensusPanel
                    consensus={message.consensus}
                    renderFormattedContent={renderFormattedContent}
                  />
                )}
              </div>
            )}
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;